define(function (require, exports, module) {
    var constantVar=require('base/component/constantVar');
    var mess={};
    mess.formatBytes=function(bytes,decimals) {
        if(bytes == 0) return '0 Byte';
        var k = 1024;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + sizes[i];
    };
    mess.detectFlash=function(){
        //navigator.mimeTypes是MIME类型，包含插件信息
        if(navigator.mimeTypes.length>0){
            //application/x-shockwave-flash是flash插件的名字
            var flashAct = navigator.mimeTypes["application/x-shockwave-flash"];
            return flashAct != null ? flashAct.enabledPlugin!=null : false;
        } else if(self.ActiveXObject) {
            try {
                new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                return true;
            } catch (oError) {
                return false;
            }
        }
    };
    mess.getEmailLink=function(email){
        var emailMap=constantVar.getEmailMap();
        var emailLink = emailMap[email.substring(email.indexOf('@')+1).toLowerCase()];
        if(!emailLink){
            emailLink='http://'+email;
        }
        return emailLink;
    };
    mess.objectTrim=function(obj){
        var newObj={};
        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                newObj[key]=$.trim(obj[key]);
            }
        }
        return newObj
    }
    //字符串、数字数组去重
    mess.arrRemoveDuplicate=function(arr,key){
        var newArr=[];
        var hash = {};  
        for(var i=0,lg=arr.length;i<lg;i++) {  
            var item=(key?arr[i][key]:arr[i]);
            if(!hash[item]){
                hash[item] = true;  
                newArr.push(arr[i]);
            }
        }  
        return newArr;  
    }
    return mess;
});