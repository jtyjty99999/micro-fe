/**
* 功能:此方法是用来表示当用户未登陆的时候，在页面进行操作(注册，登陆行为)生成的唯一标识该用户的id
* 时间: 2019/8/3
* 创建人: fishfan
*/
define(function (require, exports, module) {
    let randomStr = Math.random().toString(32).substring(2, 15);
    let date = new Date().getTime();
    let user_key = String(randomStr) + String(date);
    if (window.localStorage) {
        if (!window.localStorage.getItem('OM_qq_user_key')) {
            window.localStorage.setItem('OM_qq_user_key', user_key);
        }
        return window.localStorage.getItem('OM_qq_user_key');
    }
    return user_key;
});