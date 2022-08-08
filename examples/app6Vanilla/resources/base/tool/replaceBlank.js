define(function(require, exports, module){
	return {
		offStartBlank:function(str){
			if(!str) return "";
			return str.replace(/^\s*/g, "");
		},
		offThreeBlank:function(str){
			if(!str) return "";
			return str.replace(/\s{3,}/g, " ");
		},
		intervalThreeBlank:function(str){
			if(!str) return "";
			var arr = str.match(/(\s+\S){2,}\s+/);
			while(arr&&arr.length>0){
				var start = str.indexOf(arr[0]);
				str = str.replace(arr[0],arr[0].replace(/\s*/g,''));
				arr = str.match(/(\s+\S){2,}\s+/);
			};
			return str;
		}
	}
})