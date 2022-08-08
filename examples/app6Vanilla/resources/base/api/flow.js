define(function (require, exports, module) {
    var flow= {
        closeFlowSupp:function(param){//关闭流量主
            return $.ajax({
                type: "post",
                url: '/supplier/closeFlowSupp',
                data:param,
                dataType: "json"
            });
        },
        reopenFlow:function(param){//重新打开流量主
            return $.ajax({
                type: "post",
                url: '/supplier/reopenFlow',
                data:param,
                dataType: "json"
            });
        },
        ifCanOpenFlow:function(param){//申请开通流量主需要判断白名单
            return $.ajax({
                type: "post",
                url: '/supplier/ifCanOpenFlow',
                data:param,
                dataType: "json"
            });
        },
        getSubjectStatus:function(param){//获得主体状态
            return $.ajax({
                type: "post",
                url: '/supplier/getSubjectStatus',
                data:param,
                dataType: "json"
            });
        },
        adSummary: function(){//获取广告统计
            return  $.ajax({
                type: "get",
                url: '/account/adSummary',
                dataType: "json"
            });
        },
        subsidySummary: function(){//获取补贴统计
            return $.ajax({
                type: "get",
                url: '/account/subsidySummary',
                dataType: "json"
            });
        },
        videoSubsidySummary: function(){//获取视频补贴统计
            return $.ajax({
                type: "get",
                url: '/account/videoSubsidySummary',
                dataType: "json"
            });
        },
        accountSummary: function (params) {
            return $.ajax({
                type: "get",
                url: '/account/accountSummary',
                data: params,
                dataType: "json"
            });
        },
        incomeAccountSummary: function (params) {
            return $.ajax({
                type: "get",
                url: '/income/accountSummary',
                data: params,
                dataType: "json"
            });
        },
        videoSummary: function(){//视频收入
            return $.ajax({
                type: "get",
                url: '/account/videoSummary',
                dataType: "json"
            });
        },
        liveSummary: function(){//视频收入
            return $.ajax({
                type: "get",
                url: '/account/videoBroadcastSummary',
                dataType: "json"
            });
        },
        adDetail: function(param){//获取广告统计
            return $.ajax({
                type: "get",
                url: '/account/adDetail',
                data:param,
                dataType: "json"
            });
        },
        subsidyDetail: function(param){//获取补贴统计
            return $.ajax({
                type: "get",
                url: '/account/subsidyDetail',
                data:param,
                dataType: "json"
            });
        },
        videoSubsidyDetail: function(param){//获取视频补贴统计
            return $.ajax({
                type: "get",
                url: '/account/videoSubsidyDailyDetail',
                data:param,
                dataType: "json"
            });
        },
        videoDailyDetail:function(param){//获取视频收入单日收益列表
            return $.ajax({
                type: "get",
                url: '/account/videoDailyDetail',
                data:param,
                dataType: "json"
            });
        },
        videoArticleDetail:function(param){//获取视频收入视频收益列表
            return $.ajax({
                type: "get",
                url: '/account/videoArticleDetail',
                data:param,
                dataType: "json"
            });
        },
        liveDailyDetail:function(param){//获取视频收入单日收益列表
            return $.ajax({
                type: "get",
                url: '/account/videoBroadcastDailyDetail',
                data:param,
                dataType: "json"
            });
        },
        liveArticleDetail:function(param){//获取视频收入视频收益列表
            return $.ajax({
                type: "get",
                url: '/account/videoBroadcastArticleDetail',
                data:param,
                dataType: "json"
            });
        },
        saveSettleInfo:function(param,callback){//保存供应商信息
            $.ajax({
                type: "post",
                url: '/supplier/saveSettleInfo',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        rejectSubject:function(param,callback){//驳回主体
            return $.ajax({
                type: "post",
                url: '/supplier/rejectSubject',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        doModify:function(param,callback){
            return $.ajax({
                type: "post",
                url: '/supplier/doModify',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        openService:function(param,callback){//开通主体
            return $.ajax({
                type: "post",
                url: '/supplier/openService',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        quickRegister:function(param,callback){//快速注册保存供应商信息
            $.ajax({
                type: "post",
                url: '/supplier/quickRegister',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        getCityList: function (params) {
            return $.ajax({
                type: "get",
                url: '/supplier/getCityList',
                data: params,
                dataType: "json"
            });
        },
        withdrawList: function(param,callback){//提现记录
            $.ajax({
                type: "get",
                url: '/account/withdrawList',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        canWithdraw: function (params) {
            return $.ajax({
                type: "post",
                url: '/account/canWithdraw2',
                data: params,
                dataType: "json"
            });
        },
        withdraw: function (params) {
            return $.ajax({
                type: "post",
                url: '/account/withdraw2',
                data: params,
                dataType: "json"
            });
        },
        getWithdrawableAmount: function (params) {
            return $.ajax({
                type: "post",
                url: '/account/getWithdrawableAmount2',
                data: params,
                dataType: "json"
            });
        },
        updateBank: function (params) {
            return $.ajax({
                type: "post",
                url: '/supplier/updateBank',
                data: params,
                dataType: "json"
            });
        },
        ifCanOpenSubsidy:function(param,callback){//申请开通补贴
            $.ajax({
                type: "post",
                url: '/supplier/ifCanOpenSubsidy',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        openSubsidy:function(param,callback){//开通补贴
            $.ajax({
                type: "post",
                url: '/supplier/openSubsidy',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getYesterdayIncome:function(param){//获取昨日总收入
            return $.ajax({
                type: "get",
                url: '/account/yesterdayIncome',
                data:param,
                dataType: "json"
            });
        },
        getLastWeekIncome:function(param){
            return $.ajax({
                type:"get",
                url:'/income/getLastWeekIncome',
                data:param,
                dataType:"json"
            })
        },
        getIncomeDetail:function(param){//获取收入明细
            return $.ajax({
                type: "get",
                url: '/account/incomeDetail',
                data:param,
                dataType: "json"
            });
        },
        getTotalIncomeSummary:function(param){//获取总收入
            return $.ajax({
                type: "get",
                url: '/account/totalIncomeSummary',
                data:param,
                dataType: "json"
            });
        },
        getMonthlyIncomeSummary:function (param) {
            return $.ajax({
                type: "get",
                url: '/account/monthlyIncomeSummary',
                data:param,
                dataType: "json"
            });
        },
        getYearlyIncomeSummary:function (param) {
            return $.ajax({
                type: "get",
                url: '/account/yearlyIncomeSummary',
                data:param,
                dataType: "json"
            });
        },
        getUserIncomeAuthority: function (param) {
            return $.ajax({
                type: "get",
                url: '/account/userIncomeAuthority',
                data:param,
                dataType: "json"
            });
        },
        adVideoCPMSummary: function () { //获取CPM统计
            return  $.ajax({
                type: "get",
                url: '/account/videoCPMSummary',
                dataType: "json"
            });
        },
        adVideoCPMDetail: function(param){//获取CPM统计
            return $.ajax({
                type: "get",
                url: '/account/videoCPMDetail',
                data:param,
                dataType: "json"
            });
        },
        getUserIncomeAuth: function (param) {
            return $.ajax({
                type: "get",
                url: '/income/getUserIncomeAuth',
                data:param,
                dataType: "json"
            });
        },
        getNewYesterdayIncome: function(param){
            return $.ajax({
                type: "get",
                url: '/income/GetYesterdayIncome',
                data:param,
                dataType: "json"
            });
        },
        getUserIncomeList: function(param){
            return $.ajax({
                type: "get",
                url: '/income/GetUserIncomeList',
                data:param,
                dataType: "json"
            });
        },
        getNewTotalIncomeSummary: function(param){
            return $.ajax({
                type: "get",
                url: '/income/getTotalIncomeSummary',
                data:param,
                dataType: "json"
            });
        },
        getNewIncomeMonthlySummary:function (param) {
            return $.ajax({
                type: "get",
                url: '/income/GetMonthlyIncomeSummary',
                data:param,
                dataType: "json"
            });
        },
        getNewIncomeYearlySummary: function (param) {
            return $.ajax({
                type: "get",
                url: '/income/GetYearlyIncomeSummary',
                data:param,
                dataType: "json"
            });
        }
    };
    return flow;
});