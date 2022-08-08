define(function(require, exports, module){
    var clientList = {};
    return {
    	listen:function(key, fn) {
	        if (!clientList[key]) {
	            clientList[key] = [];
	        }
	        clientList[key].push(fn);
	    },
	    trigger:function(){
	    	var key = [].shift.call(arguments);
	        var fns = clientList[key];

	        if (!fns || fns.length === 0) {
	            return false;
	        }

	        for (var i = 0, fn; fn = fns[i++];) {
	            fn.apply(this, arguments);
	        }
	    }
    }
})