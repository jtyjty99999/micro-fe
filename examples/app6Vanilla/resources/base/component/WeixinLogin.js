define(function(require,exports,module){
    //redirectUrl 微信登录成功后，调整url
    function WeixinLogin(redirectUrl){
        //在新窗口打开微信登录
        this.openLoginNewWindow=function(type){
            var url=redirectUrl||'/userAuth/WxLogin?source='+type;
            window.open(url);
        };
    }
    return WeixinLogin;
});
