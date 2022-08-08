define(function(require, modules, exports){
    var utils = require('base/trackReport/utils');

    //腾讯指数
    !function(){
        var eyeIndex = {
            "mouseenter #eyeIndex .exponent-panel #Fhealth_ratio-wrap":"hover_health",
            "mouseenter #eyeIndex .exponent-panel #Fuser_love_ratio-wrap":"hover_love",
            "mouseenter #eyeIndex .exponent-panel #Fvertical_ratio-wrap":"hover_vertical",
            "mouseenter #eyeIndex .exponent-panel #Fmedia_dedicate_ratio-wrap":"hover_active",
            "mouseenter #eyeIndex .exponent-panel #Forigin_ratio-wrap":"hover_origin",
            "mouseenter #eyeIndex #Fscore-wrap":"hover_myindex",
            "click #eyeIndex #dimens [type=Fscore]":"trend_myindex",
            "click #eyeIndex #dimens [type=Fuser_love_ratio]":"trend_love",
            "click #eyeIndex #dimens [type=Fhealth_ratio]":"trend_health",
            "click #eyeIndex #dimens [type=Forigin_ratio]":"trend_origin",
            "click #eyeIndex #dimens [type=Fmedia_dedicate_ratio]":"trend_active",
            "click #eyeIndex #dimens [type=Fvertical_ratio]":"trend_vertical",
            "click #eyeIndex #days [rel=7]":"trend_7days",
            "click #eyeIndex #days [rel=14]":"trend_2weeks",
            "click #eyeIndex #days [rel=30]":"trend_1month",
            "click #eyeIndex #days [rel=all]":"trend_all",
            "click .main-heading .option a":"what"
        }
        utils.listen(eyeIndex, 'statistic', 'eye').addToTest('eyeIndex', eyeIndex);
    }()

    //数据统计--文章统计--单篇分析
    !function(){
        var selectorMap = {
            "click #articleStatistic .articletab":"tab",
            "click #articleStatistic .realtimeAnalysis":"realtimeAnalysis",
            "click #articleStatistic .filter-row-date .search-btn":"search",
            // "click #articleStatistic .filter-box .omPlatform ":"newskuaibao",
            // "click #articleStatistic .filter-box .mobileQQ ":"qq"
        }
        utils.listen(selectorMap, 'statistic', 'article_statistic').addToTest('articleStatistic', selectorMap);
        utils.listen({
            "click #articleStatistic .mediatab":"tab"
        }, 'statistic', 'media_statistic').addToTest('articleStatistic', selectorMap);
    }()

    //数据统计--文章统计--整体分析
    !function(){
        var selectorMap = {
            "click #mediaStatistic .mediatab":"tab",
            "click #mediaStatistic #clientTab [clientType=total] ":"total",
            "click #mediaStatistic #clientTab [clientType=kuaibao] ":"kuaibao",
            "click #mediaStatistic #clientTab [clientType=news] ":"news",
            "click #mediaStatistic #clientTab [clientType=qqBrowser] ":"qqBrowser",
            "click #mediaStatistic #clientTab [clientType=qq] ":"qq",
            "click #mediaStatistic .filter-row-date [data-id=0]":getChannelType("7day"),
            "click #mediaStatistic .filter-row-date [data-id=1]":getChannelType("2week"),
            "click #mediaStatistic .filter-row-date [data-id=2]":getChannelType("1mon"),
            "click #mediaStatistic .filter-row-date [data-id=3]":getChannelType("3mon"),
            "click #mediaStatistic .filter-row-date .search-btn":getChannelType("search"),
            // "click #mediaStatistic #omchartDataTab [chartdatatype=read]":getChannelType("read"),
            // "click #mediaStatistic #omchartDataTab [chartdatatype=vv]":getChannelType("vv"),
            // "click #mediaStatistic #omchartDataTab [chartdatatype=exposure]":getChannelType("exposure"),
            // "click #mediaStatistic #omchartDataTab [chartdatatype=relay]":getChannelType("forward"),
            // "click #mediaStatistic #omchartDataTab [chartdatatype=collect]":getChannelType("collect"),
            // "click #mediaStatistic #omchartDataTab [chartdatatype=exposure_article]":getChannelType("num")

        }
        utils.listen(selectorMap, 'statistic', 'media_statistic').addToTest('mediaStatistic', selectorMap);

        //不同渠道类型
        // var channelType = $('.filter-box .panel-tab .active').hasClass('omPlatform')?'omPlatform':'mobileQQ';
        //
        //
        utils.listen({
            "click #mediaStatistic .articletab":"tab"
        }, 'statistic', 'article_statistic').addToTest('mediaStatistic', selectorMap);

        //获取渠道类型
        function getChannelType(btnVal){
            return function(){
                var $channelActiveTab =  $('#clientTab .filter-tab .active');
                var channelVal = $channelActiveTab.attr('clientType');
                return btnVal+'_'+channelVal;
            }
        }
    }()

    //数据统计--文章统计--详细分析
    !function(){
        var selectorMap = {
            "click #detailArticleAnalysis .mediatab":"tab",
            "click #detailArticleAnalysis #clientTab [clientType=total] ":"total",
            "click #detailArticleAnalysis #clientTab [clientType=kuaibao] ":"kuaibao",
            "click #detailArticleAnalysis #clientTab [clientType=news] ":"news",
            "click #detailArticleAnalysis #clientTab [clientType=qqBrowser] ":"qqBrowser",
            "click #detailArticleAnalysis #clientTab [clientType=qq] ":"qq",
            "click #detailArticleAnalysis .filter-row-date [data-id=0]":"7day",
            "click #detailArticleAnalysis .filter-row-date [data-id=1]":"2week",
            "click #detailArticleAnalysis .filter-row-date [data-id=2]":"1mon",
            "click #detailArticleAnalysis .filter-row-date [data-id=3]":"3mon",
            "click #detailArticleAnalysis .filter-row-date .search-btn":"search",

        }
        utils.listen(selectorMap, 'statistic', 'article_statistic').addToTest('detailStatistic', selectorMap);
    }()

    //数据统计--视频统计--单篇分析
    !function(){
        var selectorMap = {
            "click #detailArticleAnalysis .mediatab":"tab",
            "click #detailArticleAnalysis #clientTab [clientType=total] ":"total",
            "click #detailArticleAnalysis #clientTab [clientType=kuaibao] ":"kuaibao",
            "click #detailArticleAnalysis #clientTab [clientType=news] ":"news",
            "click #detailArticleAnalysis #clientTab [clientType=qqBrowser] ":"qqBrowser",
            "click #detailArticleAnalysis #clientTab [clientType=qq] ":"qq",
            "click #detailArticleAnalysis .filter-row-date [data-id=0]":"7day",
            "click #detailArticleAnalysis .filter-row-date [data-id=1]":"2week",
            "click #detailArticleAnalysis .filter-row-date [data-id=2]":"1mon",
            "click #detailArticleAnalysis .filter-row-date [data-id=3]":"3mon",
            "click #detailArticleAnalysis .filter-row-date .search-btn":"search",

        }
        utils.listen(selectorMap, 'statistic', 'article_statistic').addToTest('detailStatistic', selectorMap);
    }()
})