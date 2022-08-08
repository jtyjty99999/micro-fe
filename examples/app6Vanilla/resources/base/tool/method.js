define(function (require, exports, module) {
    let methodTool = {
        dealTips: function (result, tipText, tipdom) {
            if (result == true) {
                tipdom.html('').hide().removeClass('help-error error');
                return true;
            }
            if (undefined == tipdom) {
                return false;
            }
            tipdom.html(tipText).show().addClass('help-error error');
            return false;
        },
        inArray: function(ar, ele) {
            let ret = false;
            $.each(ar, function(i, r) {
                if (ele === r) {
                    ret = true;
                }
            });
            return ret;
        },
        clone: function clone(obj) { // 深度复制对象
            // Handle the 3 simple types, and null or undefined
            if (obj == null || 'object' !== typeof obj) return obj;
            // Handle Date
            if (obj instanceof Date) {
                let copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
            // Handle Array
            if (obj instanceof Array) {
                let copy = [];
                for (let i = 0, len = obj.length; i < len; ++i) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                let copy = {};
                for (let attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        },
        getArgsFromHref: function (sArgName) {
            // ?号之后为参数，参数之间用&隔开
            // eslint-disable-next-line
            let ret_args_arr = Array();
            let sHref = sArgName;
            let args = sHref.split('?');
            if (args[0] == sHref) {
                return ret_args_arr;
            }
            let str = args[1];
            args = str.split('&');
            for (let i = 0; i < args.length; i++) {
                str = args[i];
                let arg = str.split('=');
                if (arg.length < 1) {
                    continue;
                }
                else {
                    ret_args_arr[arg[0]] = arg[1];
                }
            }

            return ret_args_arr;
        },
        showErrorDialog: function(msg) {
            layer.msg(msg, { icon: 2 });
        },
        getStrCountWithChineseOneOtherTwo: function(str = '') {
            /* // 获取字符串的长度，汉字算一个，其他字符算半个
            let strLength = str.length;
            let arr = str.match(/[\u4E00-\u9FA5]/g);
            let curLen = 0;
            if (arr) {
                curLen = strLength - arr.length + arr.length * 2;
            } else {
                curLen = strLength;
            }

            curLen = Math.ceil(curLen / 2);
            return curLen; */
            return str.length;
        }
    };
    return methodTool;
});
