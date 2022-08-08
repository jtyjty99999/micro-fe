/**
 * Created by xiabingwu on 2016/3/23.
 */
define(function (require, exports, module) {
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }
    String.prototype.realLength = function () {
        return this.replace(/[^\x00-\xff]/g, "**").length;
    };

    String.prototype.cut = function (limit, addStr) {
        if (this.realLength() <= limit) return this;

        var len = Math.min(this.length, limit);

        var tmp = '';
        for (var i = len; i >= 0; --i) {
            var tmp = this.substring(0, i);
            if (tmp.realLength() <= limit) {
                if (i < len && addStr) {
                    return tmp + addStr;
                } else {
                    return tmp;
                }
            }
        }
        return tmp;
    };
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
    String.prototype.str2Arr = function () {
        if (this == "") {
            return [];
        }
        var tmp = this.replace(/[\s|，|。|,|.]/g, ' ');
        tmp = tmp.replace(/[\s]+/g, ' ');
        tmp = tmp.trim();
        return tmp.split(" ");
    };
    /*将字符串中的分隔符格式化成指定字符*/
    String.prototype.strFormat = function (c) {
        if (this == "") {
            return "";
        }
        var tmp = this.replace(/[\s|，|。|,|.]/g, " ");
        tmp = tmp.trim();
        tmp = tmp.replace(/[\s]+/g, c);
        return tmp;
    };
    String.prototype.strEscape = function () {
        return this.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&#34;")
            .replace(/'/g, "&#39;")
            .replace(/\\/g, "&#92;")
            .replace(/\*/g, "&#42;")
            .replace(/%/g, "&#37;");
    };
    String.prototype.jsEscape = function () {
        return this.replace(/</g, "\\<")
            .replace(/>/g, "\\>")
            .replace(/\//g, "\/");
    };
    String.prototype.jsUnEscape = function () {
        return this.replace(/\\</g, "<")
            .replace(/\\>/g, ">")
            .replace(/\\\//g, "/");
    };
    String.prototype.strUnEscape = function () {
        var _s = this.replace(/(\&[a-zA-z]+\;)+/g, function (m, r) {
            switch (r) {
                case '&amp;':
                    return '&';
                case '&quot;':
                    return '"';
                case '&#34;':
                    return '"';
                case '&gt;':
                    return '>';
                case '&lt;':
                    return '<';
                case '&apos;':
                    return "'";
                case '&#39;':
                    return "'";
            }
        })
        return _s;
    };
    String.prototype.backslashRscape = function () {
        var _s = this.strUnEscape();
        _s = _s.replace(/"/g, "\"").replace(/'/g, "\'");
        return _s;
    };
    String.prototype.filterTag = function () {
        return this.replace(/<script[\s\S]+<\/script *>/g, "").replace(/<[^>]+>/g, "").replace(/\&[^;]+;/g, "");
    };
    String.prototype.filterFileName = function () {
        return this.replace(/&/g, "")
            .replace(/</g, "")
            .replace(/>/g, "")
            .replace(/"/g, "")
            .replace(/'/g, "")
            .replace(/\\/g, "")
            .replace(/\*/g, "")
            .replace(/:/g, "")
            .replace(/\?/g, "")
            .replace(/\|/g, "")
            .replace(/%/g, "");
    };
    /**
     * 把字符串转成参数对象，格式：{ 参数1: 值1, 参数2: 值2 }
     * @return {object}
     */
    String.prototype.toQueryParams = function () {
        var params = {};
        var pairs = this.match(/^\??(.*)$/)[1].split('&');
        for (var i = 0; i < pairs.length; ++i) {
            var pair = pairs[i].split('=');
            params[pair[0]] = pair[1];
        }
        return params;
    };

    String.prototype.isDate = function () {
        if (/^([1-2]\d{3})[\/|\-](0?[1-9]|10|11|12)[\/|\-]([1-2]?[0-9]|0[1-9]|30|31)$/.test(this)) {
            //return true;
            return this;
        } else {
            //else false;
            return "0000-00-00";
        }
    };
    String.prototype.isTime = function () {
        if (/^(\d{2}):(\d{2}):(\d{2})$/.test(this)) {
            //return true;
            return this;
        } else {
            //else false;
            return "00:00:00";
        }
    };
    String.prototype.checkDatetime = function () {
        if (/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(this)) {
            return true;
        } else {
            return false;
        }
    };
});
