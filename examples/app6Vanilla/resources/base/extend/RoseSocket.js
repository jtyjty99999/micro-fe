/*
 * zenli 20160418
 * 玫瑰socket:websocket兼容短轮询
 * 1.0.0
 * */


;(function(global, factory) {
	if (typeof define === "function" && (define.amd || define.cmd)) {
		define(factory);
	} else if (typeof module !== "undefined" && module.exports) {
		module.exports = factory();
	} else {
		global.RoseSocket = factory();
	}
}(this, function() {
	var RoseSocket,//玫瑰socket类
		poll,//管理轮询
		WS;//管理ws
	
	var _time = 29000;//ws心跳和轮询间隔默认时间
	
	WS = {
		connectWS: function(roseSocket) {
			var _this = this;
			var url = roseSocket.socketUrl;

			roseSocket.socket = new WebSocket(url);				
			roseSocket.socket.onmessage = function(event) {
				var json = JSON.parse(event.data);
				roseSocket.callback.call(roseSocket.content, json);
				if(roseSocket.debug){ console.log('Web Socket接收数据：'+ event.data)};
			}
			roseSocket.socket.onopen = function(event) {
				if(roseSocket.debug){ console.log('Web Socket 打开!')};

			};
			roseSocket.socket.onclose = function(event) {
				if(roseSocket.debug){ console.log('Web Socket 关闭!')};
				//roseSocket.callback.call(roseSocket.content, json);
				//去除心跳，改为轮询
				_this.goPoll(roseSocket);
				
			};
			
			
		},
		sendHeartBeat: function(roseSocket) {
			var _this = this;
			//var wsobj = roseSocket;
			var socket = roseSocket.socket;
			if(socket.readyState == 0){
				if(roseSocket.debug){ console.log("心跳：Web Socket还没开启")};

				_this.goPoll(roseSocket);
			}else if(socket.readyState == 1){
				if(roseSocket.debug){ console.log("心跳：Web Socket开启中")};
				socket.send("heatbeat");
			}else if(socket.readyState == 2){
				if(roseSocket.debug){ console.log("心跳：Web Socket正在关闭中")};

				_this.goPoll(roseSocket);
					
			}else if(socket.readyState == 3){
				if(roseSocket.debug){ console.log("心跳：Web Socket已经关闭，或者连接无法建立")};

				_this.goPoll(roseSocket);
				
			}
		},
		intervalHeat: function(roseSocket) {
			var _this = this;

			if(roseSocket.socketIntervalObj){_this.clearIntervalHeat(roseSocket);}
			//心跳轮询
			roseSocket.socketIntervalObj = setInterval(function(){
				_this.sendHeartBeat(roseSocket);
			},roseSocket.socketTime);
		},
		clearIntervalHeat: function(roseSocket) {
			if(roseSocket.socketIntervalObj){
				clearInterval(roseSocket.socketIntervalObj);

			}
		},
		//停止ws,启用poll兼容
		goPoll: function(roseSocket) {
			if(roseSocket.type == "mix" && !roseSocket.isStop){
				this.clearIntervalHeat(roseSocket);
				poll.start(roseSocket);
			}
		}
	
	}
	
	/*
	 * 轮询部分
	 * 支持两种方式：
	 * 一：轮询传入的function
	 * 二：依赖jq和zepto的ajax模块轮询传入的data，调用callback
	 * 优先方式一
	 */
	poll = {
		
		start: function(roseSocket) {
			//如果是传入了url，则启用方法2
			this.interval(roseSocket);
		},
		//组装poll轮询的内容
		getPollFunction: function(roseSocket) {
			//依赖jq or zepto
			var $ = window.jQuery || window.Zepto;
			if($){
				
				$.ajax({
		            type:"get",
		           	url: roseSocket.pollUrl,
					data: roseSocket.pollData,
		            dataType: "json",
		            success: function(json) {
						roseSocket.callback.call(roseSocket.content, json);
					}
		        });	

			}else{
				if(roseSocket.debug){console.log("请引入jQuery或者zepto")};
			}
		},
		
		interval: function(roseSocket) {
			var _this = this;

			if(roseSocket.pollIntervalObj){this.clearInterval(roseSocket);}
			//心跳轮询
			if(roseSocket.pollUrl){
				roseSocket.pollIntervalObj = setInterval(function(){
					_this.getPollFunction(roseSocket);
				},roseSocket.pollTime);
			}else if(typeof roseSocket.pollFunction == "function"){
				roseSocket.pollIntervalObj = setInterval(function(){
					roseSocket.pollFunction.call(roseSocket);
				},roseSocket.pollTime);
			}
			
		},
		clearInterval: function(roseSocket) {
			if(roseSocket.pollIntervalObj){clearInterval(roseSocket.pollIntervalObj);}
		}
		
	}
	/**
	 * 参数说明
	 * type 类型  取值mix, socket, poll 默认混合mix
	 * socketTime
	 * socketUrl
	 * 
	 * pollTime
	 * pollUrl
	 * pollData
	 * pollFunction
	 * 
	 * content 上下文，默认window
	 * callback ws和poll共用
	 * jsonCallback 用于服务器缓存
	 * debug 调试
	 */
	function RoseSocket (params){
		
		if(typeof params !== "object") {return false;}
		
		//this.scheme	= params.scheme || 2;//目前只实现2.使用策略取值：1是若ws不可用则启用轮询并且ws可用的时候切换至ws,2若ws不可用则启用轮询终止ws。  
		//默认mix类型,若ws关闭则启用poll
		this.type = !params.type ? "mix" : params.type;
		
		if(this.type != "poll"){
			this.socketUrl = params.socketUrl;
			this.socketTime = params.socketTime || _time;//ws心跳时间
			
		}
		if(this.type != "socket"){
			this.pollTime = params.pollTime || params.socketTime || _time;//poll轮询时间
			this.pollUrl = params.pollUrl;
			this.pollData = params.pollData;
			this.pollFunction = params.pollFunction;
				
		}
		
		this.content = params.content || window;
		this.callback = params.callback || "";
		this.jsonCallback = params.jsonCallback || ( "rosejson" + new Date().getTime() );
		this.debug = !!params.debug || false;
	}; 
	//对外接口
	RoseSocket.prototype = {
		
		//启动
		start: function(){
	        
	        if( !!window.WebSocket && (this.type == "socket" || this.type == "mix") ){
	        	WS.connectWS(this);
	        	WS.intervalHeat(this);	
	        	if(this.debug){ console.log("开启模式：" + this.type)};
	        }else if( !window.WebSocket || this.type == "poll" ){
	        	poll.start(this);
	        	if(this.debug){ console.log("开启模式：" + this.type)};
	        }else{
	        	if(this.debug){ console.log("开启模式错误！")};
	        }
	        this.isStop = false;//控制&查询状态
			
		},
		//终止
		stop: function() {

			if(this.type == "mix"){
				WS.clearIntervalHeat(this);
				poll.clearInterval(this);							
			}else if(this.type == "socket"){
				WS.clearIntervalHeat(this);
			}else if(this.type == "poll"){
				poll.clearInterval(this);
			}
			this.isStop = true;
			
		}
		
		
		
	}	
				
	return {
		extend: function(params){
			return new RoseSocket(params);
		}  
	}

}));









