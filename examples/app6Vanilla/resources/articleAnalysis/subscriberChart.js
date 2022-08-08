
define(function (require, exports, module) {
    var base=require('OM_BASE');
    var omapi=require('service/statistics');
    var $=base.$;
    var template = require('biz/article/articleAnalysis/template');
    var coreConfig={
        bar_tmpl: 'barList',
        standbar_tmpl: 'standBarList',
        colorList: ['#67c7f6', '#f89d80', '#f8bd57', '#d48de9', '#e98dc1', '#918de9', '#8de9db', '#8bdaad'],
        mapColor: ['#67c7f6', '#76ccf7', '#85d2f8', '#94d8f9', '#a4ddfa', '#b3e3fa', '#c2e9fb', '#caebfc', '#d1eefc', '#d9f1fd']
    };
    //性别环图
    function setSexPieChart(data){
        var sexPieChart = echarts.init(document.getElementById('sexPie'));
        sexPieChart.setOption({
            color:coreConfig.colorList,
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            calculable : false,
            series : [
                {
                    name:'性别分布',
                    type:'pie',
                    radius : ['40%', '70%'],
                    itemStyle : {
                        normal : {
                            label : {
                                show : true,
                                formatter: "{b} :{d}%",
                                textStyle:{
                                    color:'#696969',
                                    fontSize:14
                                }
                            },
                            labelLine : {
                                show : true,
                                length:50,
                                lineStyle:{
                                    color:'#D9DEE0'
                                }
                            }
                        }
                    },
                    data:data
                }
            ]
        });
    }
    //终端环图
    function setTerminalPieChart(data){
        var terminalPieChart = echarts.init(document.getElementById('terminalPie'));
        terminalPieChart.setOption({
            color:coreConfig.colorList,
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            calculable : false,
            series : [
                {
                    name:'终端来源',
                    type:'pie',
                    radius : ['40%', '65%'],
                    itemStyle : {
                        normal : {
                            label : {
                                show : true,
                                formatter: "{b} :{d}%",
                                textStyle:{
                                    color:'#696969',
                                    fontSize:14
                                }
                            },
                            labelLine : {
                                show : true,
                                length:50,
                                lineStyle:{
                                    color:'#D9DEE0'
                                }
                            }
                        }
                    },
                    data:data
                }
            ]
        });
    }
    //省份地图
    function setCityMapChart(data){
        var cityMapChart = echarts.init(document.getElementById('cityMap'));
        var temp = [];
        $.each(data,function(i,el){
            if(el.name!='其他'){
                temp.push(el.value);
            }
        });
        temp.sort(function(a,b){
            return b - a;
        });
        cityMapChart.setOption({
            dataRange: {
                min: 0,
                max: temp[0],
                x: 'left',
                y: 'bottom',
                text:['高','低'],
                calculable : true,
                color:coreConfig.mapColor
            },
            toolbox: {
                show: true,
                orient : 'vertical',
                x: 'left',
                y: 'center'
            },
            series : [
                {
                    name: '用户省份分布',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    itemStyle:{
                        normal:{label:{show:true,textStyle:{color:'#333'}},color:'#eaeef1'},
                        emphasis:{label:{show:true},areaStyle:{color: '#92ddff'}}
                    },
                    data:data
                }
            ]
        });
    }
    //柱状图
    function setBar(dom,data,total,hideColor){
        var _barHtml='';
        var barWidth = parseInt(dom.parent('table').find('.cell-progress').width())-40;
        for (var i in data) {
            if(coreConfig.colorList[i]){
                data[i]['bgcolor']=coreConfig.colorList[i];
            }
            if(hideColor){
                data[i]['display']='none';
            }
            data[i]['percent']=parseInt(barWidth*(data[i]['value']/total));
            _barHtml += template(coreConfig.bar_tmpl, data[i]);
        }
        dom.html(_barHtml);
    }
    function setStandBar(dom,data,total){
        var _barHtml='';
        var barHeight = 280;
        var temp = [];
        $.each(data,function(i,el){
            temp.push(el.value);
        });
        temp.sort(function(a,b){
            return b - a;
        });
        var max = temp[0];
        for (var i in data) {
            data[i]['index']=parseInt(i)+1;
            data[i]['percent']=(100*(data[i]['value']/total)).toFixed(1);
            data[i]['height']=parseInt(barHeight*(data[i]['value']/max));
            _barHtml += template(coreConfig.standbar_tmpl, data[i]);
        }
        dom.html(_barHtml);
    }
    //性别分布
    function renderSex(d){
        var total = d.total;
        var data = d.detailMap;
        var date = d.date;
        setSexPieChart(data);
        setBar($('#sexBars tbody'),data,total);
        //$('#sexBars .text-totals').html('总人数：'+total);
        $('#sexDate').html(date);
    }
    //性别分布
    function renderAge(d){
        var total = d.total;
        var data = d.detailMap;
        setStandBar($('#ageBar ul'),data,total);
    }
    //终端分布
    function renderTerminal(d){
        var total = d.total;
        var data = d.detailMap;
        setTerminalPieChart(data);
        setBar($('#terminalBars tbody'),data,total,true);
    }
    //省份分布
    function renderProv(d){
        var total = d.total;
        var data = d.detailMap;
        var provTotalNum = data.length;
        setCityMapChart(data);
        setBar($('#provBars tbody'),data.slice(0,10),total,true);

        $('#provPage').twbsPagination({
            totalPages: Math.ceil(provTotalNum/10),
            startPage: 1,
            onPageClick: function (event, page) {
                setBar($('#provBars tbody'),data.slice((page-1)*10,10*page),total,true);
            }
        });
        var $icon=$("#provBars .cell-sort").on('click',function(){
            if($(this).find('i').hasClass('icon-sort-up')){
                $(this).find('i').removeClass('icon-sort-up').addClass('icon-sort-down');
                $(this).addClass('active');
                if(data.isReverse){//如果已经被颠倒，相当于点击了icon-sort-up
                    data.reverse();
                    data.isReverse=false;
                }

            }else if($(this).find('i').hasClass('icon-sort-down')){//这是后台默认返回的数据排序
                $(this).find('i').removeClass('icon-sort-down').addClass('icon-sort-up');
                $(this).addClass('active');
                if(!data.isReverse){
                    data.reverse();
                    data.isReverse=true;
                }
            }
            $icon.off('click');
            $('#provPage').twbsPagination('destroy');
            renderProv(d);
        });
    }
    //城市分布
    function renderCity(d){
        var total = d.total;
        var data = d.detailMap;
        var cityTotalNum = data.length;
        setBar($('#cityBars tbody'),data.slice(0,10),total,true);

        $('#cityPage').twbsPagination({
            totalPages: Math.ceil(cityTotalNum/10),
            startPage: 1,
            onPageClick: function (event, page) {
                setBar($('#cityBars tbody'),data.slice((page-1)*10,10*page),total,true);
            }
        });
        var $icon=$("#cityBars .cell-sort").on('click',function(){
            if($(this).find('i').hasClass('icon-sort-up')){
                $(this).find('i').removeClass('icon-sort-up').addClass('icon-sort-down');
                $(this).addClass('active');
                if(data.isReverse){//如果已经被颠倒，相当于点击了icon-sort-up
                    data.reverse();
                    data.isReverse=false;
                }
            }else if($(this).find('i').hasClass('icon-sort-down')){//这是后台默认返回的数据排序
                $(this).find('i').removeClass('icon-sort-down').addClass('icon-sort-up');
                $(this).addClass('active');
                if(!data.isReverse){
                    data.reverse();
                    data.isReverse=true;
                }
            }
            $icon.off('click');
            $('#cityPage').twbsPagination('destroy');
            renderCity(d);
        });
    }


    function main(){
        var self=this;
        var isBind=false;
        //事件绑定
        function eventBind(){

        }
        function init(){
            omapi.getUserFaceData({}).done(function(res){
                if(res.response.code!='0'){
                    return;
                }
                if(res.data['detail']){
                    $('#nullChart').hide();
                    $('#charts').show();
                    if(!!res.data.detail.gender){//填充性别图表数据
                        renderSex(res.data.detail.gender);
                    }
                    if(!!res.data.detail.age){//填充年龄图表数据
                        renderAge(res.data.detail.age);
                    }
                    if(!!res.data.detail.province){//填充省份分布图表数据
                        renderProv(res.data.detail.province);
                    }
                    if(!!res.data.detail.city){//填充城市分布图表数据
                        renderCity(res.data.detail.city);
                    }
                }

            });
        }
        this.isInit=false;
        //业务初始化
        this.bizInit=function(){
            init();
            this.isInit=true;
            //放数据加载
            return this;
        };
        this.render=function(){
            if(!isBind){
                isBind=true;
                eventBind();
            }
            return this;
        };
    }
    var mainEnter=new main();
    return mainEnter;
});