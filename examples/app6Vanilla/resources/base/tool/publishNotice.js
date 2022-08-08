define(function(require, exports, module) {
    return {
        checkCharLen: function(str, flag) {
            if (!str) return;
            var charLen = 0;
            for (var i = 0; i < str.length; i++) {
                var res = /[\u4e00-\u9fa5]|[a-z]|[0-9]/i.test(str[i]);
                if (res) charLen++;
            }
            if (charLen < str.length - charLen) return "文章" + (flag ? "双" : "") + "标题所含符号过多，可能影响推荐效果，确定发布？"
        },
        checkPuerChar: function(str, flag) {
            if (!str) return;
            if (/^[a-z0-9]+$/i.test(str)) return "文章" + (flag ? "双" : "") + "标题仅含英文或数字，可能影响推荐效果，确定发布？"
        },
        maxCharLen: function(str, flag) {
            if (!str) return;
            var res = str.match(/(\S+)(\1){2,}/)
            if (res) {
                return "文章" + (flag ? "双" : "") + "标题包含重复内容“" + res[0] + "”，确定发布？"
            }
        }
    }
})