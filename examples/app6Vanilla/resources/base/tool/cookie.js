/**
 * Created by xiabingwu on 2016/3/23.
 */
define(function (require, exports, module) {
    var cookie = {
        set: function (name, value, expires, path, domain, raw) {
            if (!raw) value = escape(value);

            if (typeof expires == "undefined") {
                expires = new Date(new Date().getTime() + 365 * 24 * 3600 * 1000);
            }

            document.cookie = name + "=" + value +
                ((expires) ? "; expires=" + expires.toGMTString() : "") +
                ((path) ? "; path=" + path : "; path=/") +
                ((domain) ? "; domain=" + domain : "; domain=om.qq.com");
        },
        get: function (name, raw) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));

            if (arr != null) {
                return raw ? arr[2] : unescape(arr[2]);
            }

            return null;

        },
        clear: function (name, path, domain) {
            if (this.get(name)) {
                document.cookie = name + "=" +
                    ((path) ? "; path=" + path : "; path=/") +
                    ((domain) ? "; domain=" + domain : "; domain=qq.com") +
                    ";expires=Fri, 02-Jan-1970 00:00:00 GMT";
            }
        }
    };
    return cookie;
});