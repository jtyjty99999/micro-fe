
define(function (require, exports, module) {
    var income={};

    /**
     * 互动收益 -> 图文直播
     *
     **/
    income.roseSummary = function(params){
        return $.ajax({
            type: "get",
            url: '/account/roseSummary',
            data:params,
            dataType: "json"
        });
    };
    income.roseDailyDetail = function(params){
        //params = $.extend({fromDays:7,page:1,pagesize:7},params);
        return $.ajax({
            type: "get",
            url: '/account/roseDailyDetail',
            data:params,
            dataType: "json"
        });
    };
    income.roseArticleDetail = function(params){
        //params = $.extend({fromDays:7,page:1,pagesize:7},params);
        return $.ajax({
            type: "get",
            url: '/account/roseArticleDetail',
            data:params,
            dataType: "json"
        });
    };
    /**
     * 互动收益 -> 赞赏
     *
     **/
    income.admireSummary = function(params){
        return $.ajax({
            type: "get",
            url: '/HDMessage/HdMediaInfo',
            data:params,
            dataType: "json"
        });
    };
    income.admireDailyDetail = function(params){
        return $.ajax({
            type: "get",
            url: '/reward/getRewardMediaInfoByMediaIdForDays',
            data:params,
            dataType: "json"
        });
    };
    income.admireArticleDetail = function(params){
        return $.ajax({
            type: "get",
            url: '/reward/getRewardMediaArticlesByDate',
            data:params,
            dataType: "json"
        });
    };

    /**
     * TBD 互动收益 -> 付费
     *
     **/
    income.paymentSummary = function(params) {
        //TBD 付费
        return $.ajax({
            type: "get",
            url: '/HDMessage/HdMediaInfo',
            data:params,
            dataType: "json"
        });
    };
    income.paymentDailyDetail = function(params){
        return $.ajax({
            type: "get",
            url: '/livepay/getPayMediaInfoByMediaIdForDays',
            data:params,
            dataType: "json"
        });
    };
    income.paymentArticleDetail = function(params){
        return $.ajax({
            type: "get",
            url: '/livepay/getPayMediaArticlesByDate',
            data:params,
            dataType: "json"
        });
    };
    /**
     * 互动收益 -> 电商
     *
     **/
     income.jdSummary = function(params){
         return $.ajax({
             type: "get",
             url: '/account/ecSummary',
             data:params,
             dataType: "json"
         });
     };
     income.jdDailyDetail = function(params){
         return $.ajax({
             type: "get",
             url: '/account/ecDetail',
             data:params,
             dataType: "json"
         });
     };

    return income;
});
