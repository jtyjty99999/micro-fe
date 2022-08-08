/**
 * Created by xiabingwu on 2016/3/23.
 */
define(function (require, exports, module) {
    var url={};
    url.getArgsFromHref=function (sArgName) {
        //?号之后为参数，参数之间用&隔开
        var ret_args_arr = Array();
        var sHref = sArgName;
        var args = sHref.split("?");
        if (args[0] == sHref) {
            return ret_args_arr;
        }
        var str = args[1];
        args = str.split("&");
        for (var i = 0; i < args.length; i++) {
            str = args[i];
            var arg = str.split("=");
            if (arg.length < 1) {
                continue;
            }
            else {
                ret_args_arr[arg[0]] = arg[1];
            }
        }

        return ret_args_arr;
    };
    url.getParameter=function(a){
        var b,c,d,e="",f,g,h=/[^\u4E00-\u9FA5\w\s]/g,i,j;
        b=window.location.href.replace(/&amp;/g,"&");
        d=(c=b.indexOf("?"))>-1?c:b.indexOf("#");
        if(a!=null&&d>-1){
            b=b.substring(d+1);
            b=b.replace(/#/g,"&");
            c=b.split("&");
            for(d=0;d<c.length;d++){
                var f,g;
                f=c[d].split("=")[0];
                g=c[d].substring(c[d].indexOf("=")+1);
                try{
                    i=j="";
                    i=decodeURIComponent(f);
                    j=decodeURIComponent(g);
                    f=h.test(i)?f:i;
                    g=h.test(j)?g:j;
                }catch(ex){}
                f=f.indexOf("%u")>-1?unescape(f):f;
                g=g.indexOf("%u")>-1?unescape(g):g;
                if(f==a){e=g}
            }
        }
        return e;
    };
    url.updateQueryString=function(uri, key, value) {
        var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "i");
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            var hash =  '';
            if( uri.indexOf('#') !== -1 ){
                hash = uri.replace(/.*#/, '#');
                uri = uri.replace(/#.*/, '');
            }
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            return uri + separator + key + "=" + value + hash;
        }
    };
    url.redirect = function(url, target) {
        if (document.all) {
            var referLink = document.createElement("a");
            referLink.onclick = null;
            referLink.href = url;
            if (target) {
                referLink.target = target;
            }
            document.body.appendChild(referLink);
            referLink.click();
        } else {
            if (target) {
                var tmp = window.open(url, target);
            } else {
                location.href = url;
            }
        }
    };
    return url;
});