
define(function (require, exports, module) {
    var filter=require('biz/article/articleAnalysis/filter');
    var currentFilterConfig = filter.currentFilterConfig;
    var BOSS_PAGETYPE_MAP = {
        "article":"article_statistic",
        "media":"media_statistic",
        "subscribe":"subscribe_statistic",
        'video':"video_statistic",
        'videoMedia':'videoMedia_statistic',
        'userAnalysis':'user_analysis'
    };
    function _OMReport( moduleName, event) {
        try {
            OMReport({
                page: 'statistic',
                omfunction: BOSS_PAGETYPE_MAP[currentFilterConfig.type],
                module: moduleName,
                event: event
            });
        } catch (e) {}
    };
    return _OMReport;
});