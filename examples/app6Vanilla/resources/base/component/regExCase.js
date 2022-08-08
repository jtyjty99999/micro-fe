/**
 * Created by xiabingwu on 2016/5/31.
 */
define(function(require,exports,module){
    var regExCase={};
    //邮箱验证
    regExCase.email=/^\w+([._-]\w+)*@([\w-]+\.)+\w+$/;
    //phone验证

    regExCase.phone=/^1\d{10}$/;
    
    //url验证
    regExCase.url=/^(?:(?:(?:https?|ftp|rtmp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    //新浪微博地址验证
    //regExCase.sinaWeibo=/^http[s]?:\/\/(?:www\.)?weibo\.com(?:\/u)?\/(\d+)/;
    regExCase.sinaWeibo=/^http[s]?:\/\/(?:www\.)?weibo\.com\//;

    //是否为中文
    regExCase.notChinese = /[u00-uff]/
    
    //身份证号格式验证
    regExCase.isIDCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    
    return regExCase;
});