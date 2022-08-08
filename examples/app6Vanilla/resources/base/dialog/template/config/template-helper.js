
    /* eslint-disable */
    var runtime = require('art-template/lib/runtime');
    runtime.dateformat_filter = function (datestr, format) {
        if(datestr.split(' ')) {
            return datestr.split(' ')[0];
        }
        date = new Date(datestr);
        var map = {
            "M": date.getMonth() + 1, //月份 
            "d": date.getDate(), //日 
            "h": date.getHours(), //小时 
            "m": date.getMinutes(), //分 
            "s": date.getSeconds(), //秒 
            "q": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        format = format.replace(/([yMdhmsqS])+/g, function(all, t){
            var v = map[t];
            if(v !== undefined){
                if(all.length > 1){
                    v = '0' + v;
                    v = v.substr(v.length-2);
                }
                return v;
            }
            else if(t === 'y'){
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    }
    
    runtime.timeformat_filter = function (sec_num) {
         var sec_num = parseInt(sec_num, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    }
    
    runtime.bignum_filter = function (number) {
        var WAN = 10000;
        var YI  = 100000000;
        if(Math.max(YI, number) === number) {
            return Math.round(number/WAN) + '亿';
        }else if(Math.max(WAN, number) === number) {
            return Math.round(number/WAN) + '万';
        }else{
            return number
        }
    }
    
    runtime.protocal_filter = function(link) {
        var reg = /^\s*http:/
        if(reg.test(link)) {
            return link.replace(reg,'');
        }
        return link;
    }
    module.exports = runtime;

