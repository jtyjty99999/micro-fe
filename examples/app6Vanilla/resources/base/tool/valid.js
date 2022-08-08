/**
 * Created by xiabingwu on 2016/3/23.
 */
define(function (require, exports, module) {
    var valid={};
    valid.isNull=function (str) {
        if (str == "") return true;
        var regu = "^[ ]+$";
        var re = new RegExp(regu);
        return re.test(str);
    };
    valid.isQQ=function (qq) {
        var filter = /^\s*[.0-9]{5,11}\s*$/;
        if (!filter.test(qq)) {
            return false;
        } else {
            return true;
        }
    };
    valid.getTextLength=function (str) {
        if(typeof(str) != "string")
        {
            return false;
        }
        return str.length;
        //return str.replace(/[^\x00-\xFF]/g,'aa').length;
        //if (typeof(str) != "string") {
        //    return false;
        //}
        //var s = clone(str);
        //
        //var s = s.replace(/(^\s*)|(\s*$)/g, "");
        //return s.length;
    };
    valid.validTextLen=function (v_Dom, MinLen, MaxLen, tipText, tipDom) {
        //验证长度
        //验证长度
        var vResult = {"ret":"","msg":""};
        var strLen = OM.util.getTextLength(v_Dom.val());
        var id = v_Dom.attr('class');

        if(strLen < MinLen)
        {
            vResult.ret = false;
//            vResult.msg = tipText+"不能小于"+MinLen.toString()+"个字符"
//            if(/title/i.test(id)){
            vResult.msg = tipText+"不能小于"+MinLen+"个字"
//            }
        }
        else if(strLen > MaxLen)
        {
            vResult.ret = false;
//            vResult.msg = tipText+"不能大于"+MaxLen.toString()+"个字符"
//            if(/title/i.test(id)){
            vResult.msg = tipText+"不能大于"+MaxLen+"个字"
//            }
        }
        else
        {
            vResult.ret = true;
            vResult.msg = "";
        }

        OM.util.dealTips(vResult.ret,vResult.msg,tipDom);

        return vResult;
        //var vResult = {"ret": "", "msg": ""};
        //var strLen = OM.util.getTextLength(v_Dom.val());
        //if (strLen < MinLen) {
        //    vResult.ret = false;
        //    vResult.msg = tipText + "不能小于" + MinLen.toString() + "个字符"
        //}
        //else if (strLen > MaxLen) {
        //    vResult.ret = false;
        //    vResult.msg = tipText + "不能大于" + MaxLen.toString() + "个字符"
        //}
        //else {
        //    vResult.ret = true;
        //    vResult.msg = "";
        //}
        //
        //OM.util.dealTips(vResult.ret, vResult.msg, tipDom);
        //
        //return vResult;
    };
    valid.notEmpty=function (v_Dom, tipText, tipDom) {

        var vResult = {"ret": "", "msg": ""};
        if (v_Dom.length > 0 && OM.util.isNull(v_Dom.val())) {
            vResult.ret = false;
            vResult.msg = tipText + "不能为空";
        }
        else {
            vResult.ret = true;
            vResult.msg = "";
        }

        OM.util.dealTips(vResult.ret, vResult.msg, tipDom);

        return vResult;
    };
    return valid;
});