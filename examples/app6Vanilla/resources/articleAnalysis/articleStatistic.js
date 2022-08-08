
define(function (require, exports, module) {
    let base = require('../base/base');
    let user = base.user;
    let statistics = {};
    let head = '/mstatistic';
    // 单篇统计
    statistics.getArticleStatistic = function (param) {
        param.media = user.mediaId;
        let url =  head + '/Statistic/Article?media=' + param.media + '&channel=' + param.ptflag + '&fields=title,read,exposure,relay,collect,postil,updating,comment,read_uv';
        if (param.article_type) {
            url += '&article_type=' + param.article_type;
        }
        if (param.btime) {
            url += '&btime=' + param.btime;
        }
        if (param.etime) {
            url += '&etime=' + param.etime;
        }
        url += '&page=' + param.page + '&num=' + param.num + '&merge=0';
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    // 整体统计
    statistics.getMediaDailyStatistic = function (param) {
        param.media = user.mediaId;
        let url = head + '/statistic/mediaDaily?channel=' + param.ptflag + '&btime=' + param.btime + '&etime=' + param.etime + '&page=' + param.page + '&num=' + param.num;
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    statistics.getMediaYearlyStatistic = function (param) {
        param.media = user.mediaId;
        let url = '/statistic/mediaYearly?channel=' + param.ptflag;
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    // 获取订阅统计数据
    statistics.getSubscribeDailyStatistic = function(param) {
        param.media = user.mediaId;
        return $.ajax({
            type: 'get',
            // url: '/Statistic/subscribeDaily?media=' + param.media + '&channel=' + param.ptflag + '&fields=fdate,subs_cnt_total,subs_cnt_today,unsubs_cnt_today&btime=' + param.btime + '&etime=' + param.etime + '&page=' + param.page + '&num=' + param.num + '&merge=0',
            // url: head + '/statistic/subscribeDaily?media=' + param.media + '&channel=' + param.ptflag,
            url: head + '/statistic/subscribeDaily?channel=' + param.ptflag + '&btime=' + param.btime + '&etime=' + param.etime + '&page=' + param.page + '&num=' + param.num,
            dataType: 'json'
        });
    };
    statistics.getSubscribeTotalData = function (param) {
        let params = {
            mediaid: mediaid,
        };
        return $.ajax({
            type: 'get',
            url: head + '/statistic/index',
            data: params,
            dataType: 'json'
        });
    };
    statistics.getMediaTotalStatistic = function (param) {
        param.media = user.mediaId;
        return $.ajax({
            type: 'get',
            url: head + '/statistic/getYesterdayStatistics?media=' + param.media + '&channel=' + param.ptflag,
            dataType: 'json'
        });
    };
    statistics.getArticleReadDistribution = function(param) {
        param.media = user.mediaId;
        let url = head + '/statistic/getArticleReadDistribution?article_id=' + param.article + '&titleType=' + param.titleType;
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    statistics.getArticleReal = function (param) {
        param.media = user.mediaId;
        let url = '/api?page=' + param.page + '&num=' + param.num;
        if (param.btime) {
            url += '&btime=' + param.btime;
        }
        if (param.etime) {
            url += '&etime=' + param.etime;
        }
        return $.ajax({
            type: 'get',
            url: url
        });
    };
    // 详细分析
    statistics.getSignalArticle = function (param) {
        param.media = user.mediaId;
        let url = head + '/statistic/SignalArticle?article=' + param.article + '&channel=' + param.ptflag;
        if (!!param.titleType || param.titleType == '0') {
            url += '&titleType=' + param.titleType;
        }
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    statistics.getArticleDaily = function (param) {
        param.media = user.mediaId;
        let url =  head + '/statistic/ArticleAnalyze?media=' + param.media + '&article=' + param.article + '&channel=' + param.ptflag + '&fields=title,read,exposure,relay,collect,postil,updating,comment,read_uv,vv';
        if (!!param.titleType || param.titleType == '0') {
            url += '&titleType=' + param.titleType;
        }
        if (param.btime) {
            url += '&btime=' + param.btime;
        }
        if (param.etime) {
            url += '&etime=' + param.etime;
        }
        url += '&page=' + param.page + '&num=' + param.num + '&merge=0';
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json',
        });
    };
    statistics.getRealTimeArticle = function (param) {
        param.media = user.mediaId;
        let url = '/statistic/GetArticleRealTimeStatisticScatter?article_id=' + param.article + '&channel=' + param.ptflag;
        if (!!param.titleType || param.titleType == '0') {
            url += '&titleType=' + param.titleType;
        }
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    statistics.getRealTimeReadArticle = function (param) {
        param.media = user.mediaId;
        let url = head + '/statistic/getArticleRealTimeReadScatter?article_id=' + param.article + '&titleType=' + param.titleType;
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };
    // 视频统计
    statistics.VPlusUserDataShow = function(param) {
        param.mediaid = mediaid;
        return $.ajax({
            type: 'get',
            url: '/VideoData/MediaPortrait',
            data: param,
            dataType: 'json'
        });
    };
    statistics.getVideoTotalVV = function(param) {
        let url = head + '/VideoData/SingleVideo?vid=' + param.article;
        if (mediaid) {
            url += '&mediaid=' + mediaid;
        }
        return $.ajax({
            type: 'get',
            url: url,
            dataType: 'json'
        });
    };

    statistics.getSingleVideoData = function(param, callback) {
        param.mediaid = mediaid;
        return $.ajax({
            type: 'get',
            url: '/VPlusPlayStats/VPlusVidSearch',
            data: param,
            dataType: 'json'
        });
    };
    statistics.getVideoTotalData = function (param) {
        let params = {
            mediaid: mediaid,
        };
        return $.ajax({
            type: 'get',
            url: head + '/VideoData/MediaSummary',
            data: params,
            dataType: 'json'
        });
    };
    statistics.getVideoMediaDaily = function (param) {
        let params = {
            mediaid: mediaid,
        };
        if (param.btime) {
            params.startdate = new Date(param.btime * 1000).Format('yyyy-MM-dd');
        }
        if (param.etime) {
            params.enddate = new Date(param.etime * 1000).Format('yyyy-MM-dd');
        }
        params.fields = '2|3';
        params.source = '1|2|3|4|5|-1';
        return $.ajax({
            type: 'get',
            url: head + '/VideoData/MediaDailyStatis',
            data: params,
            dataType: 'json',
        });
    };
    statistics.getVideoMediaYearly = function (param) {
        let params = {
            mediaid: mediaid,
        };
        // params.fields = '2|3'
        // params.source='1|2|3|4|5|-1'
        return $.ajax({
            type: 'get',
            url: '/VideoData/mediaYearly',
            data: params,
            dataType: 'json'
        });
    };

    statistics.getMediaVideoList = function (param) {
        let params = {
            mediaid: mediaid,
        };
        if (param.btime) {
            params.startdate = new Date(param.btime * 1000).Format('yyyy-MM-dd');
        }
        if (param.etime) {
            params.enddate = new Date(param.etime * 1000).Format('yyyy-MM-dd');
        }
        if (param.num) { params.limit = param.num }
        if (param.page) { params.page = param.page }
        params.fields = '2|3';
        params.source = '0';
        return $.ajax({
            type: 'get',
            url: head + '/VideoData/MediaVideoList',
            data: params,
            dataType: 'json',
        });
    };
    statistics.getSingleVideoTotalData = function (param) {
        let params = {
            mediaid: mediaid,
            vid: param.article,
            fields: '2|7',
            source: '0'
        };
        return $.ajax({
            type: 'get',
            url: head + '/VideoData/VideoRealStatis',
            data: params,
            dataType: 'json',
        });
    };
    statistics.getVideoRealInfo = function (param) {
        param.mediaid = mediaid;
        let params = {
            vid: param.article,
            app: param.channelName,
            mediaid: mediaid,
            fields: '2|7',
            source: '0'
        };
        return $.ajax({
            type: 'get',
            url: head + '/VideoData/VideoAllRealInfo',
            data: params,
            dataType: 'json',
        });
    };
    statistics.getVideoDailyList = function (param) {
        let params = {
            mediaid: mediaid,
            vid: param.article,
            fields: '2|7',
            source: '0'
        };

        if (param.btime) {
            params.startdate = new Date(param.btime * 1000).Format('yyyy-MM-dd');
        }
        if (param.etime) {
            params.enddate = new Date(param.etime * 1000).Format('yyyy-MM-dd');
        }
        return $.ajax({
            type: 'get',
            url: head + '/VideoData/VideoDailyList',
            data: params,
            dataType: 'json'
        });
    };
    statistics.getStatisticTip = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/statistic/userTip',
            data: {},
            dataType: 'json',
        });
    };
    statistics.getTotalStatisticTip = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/statistic/userTipTotal',
            data: {},
            dataType: 'json',
        });
    };
    statistics.getStatisticCount = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/statistic/singleCount',
            data: param,
            dataType: 'json',
        });
    };
    statistics.generateArticleDetailData = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/statistic/generateDetailData',
            data: param,
            dataType: 'json',
        });
    };
    statistics.generateArticleSingleData = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/statistic/generateSingleData',
            data: param,
            dataType: 'json',
        });
    };
    statistics.generateVideoSingleData = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/VideoData/generateSingleData',
            data: param,
            dataType: 'json',
        });
    };
    statistics.generateVideoDetailData = function (param) {

        return $.ajax({
            type: 'get',
            url: head + '/VideoData/generateDetailData',
            data: param,
            dataType: 'json',
        });
    };


    return statistics;
});