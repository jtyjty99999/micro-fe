
define(function (require, exports, module) {
    var login={};
    login.randomCode=function(params){
        return $.ajax({
            type:"get",
            url:'/userAuth/randomCode',
            data:params,
            dataType: "json"
        });
    };
    //om email 登录接口
    login.signIn=function(params){
        return $.ajax({
            type:"post",
            url:'/userAuth/SignIn',
            data:params,
            dataType: "json"
        });
    };
    //邮箱换随机数，以后新业务尽量用user/GenerateLoginRandom这个接口，而不是/userAuth/randomCode，具体原因咨询nicojtchen(陈江涛)
    login.generateLoginRandom=function(params){
        return $.ajax({
            type:"get",
            url:'/user/GenerateLoginRandom',
            data:params,
            dataType: "json"
        });
    };

    // 手机号码换随机数

    login.getPhoneRandomCode=function(params){
        return $.ajax({
            type:"get",
            url:'/userAuth/getPhoneRandomCode',
            data:params,
            dataType: "json"
        });
    };

    // om手机登录

    login.signInViaPhone=function(params){
        return $.ajax({
            type:"post",
            url:'/userAuth/signInViaPhone',
            data:params,
            dataType: "json"
        });
    };

    login.getRandom = function(params){
        return $.ajax({
            type: "post",
            url: "/auth/getRandom",
            data: params,
            dataType: "json"
        })
    };

    login.doLogin = function(params){
        return $.ajax({
            type: "post",
            url: "/auth/doLogin",
            data: params,
            dataType: "json"
        })
    };

    //验证码校验 http://tapd.oa.com/10116611/prong/stories/view/1010116611062766995
    login.doPwdErrorVerify=function(params){
        return $.ajax({
            type: "post",
            url: "/userAuth/doPwdErrorVerify",
            data: params,
            dataType: "json"
        })
    };

    return login;
});