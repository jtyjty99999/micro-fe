
define(function (require, exports, module) {
    var user=require('base/user/user');
    var statistics={};
    statistics.getRealData=function(param,callback){
        param.media = user.mediaId;
        return $.ajax({
            type: "get",
            //url:'/statistic/rtList?media=10002&page=1&num=9'
            url: '/statistic/rtList?media=' + param.media+'&article_type='+param.article_type+'&page='+ param.index + '&num='+param.num,
            dataType: "json"
        });
    };
    return statistics;
});