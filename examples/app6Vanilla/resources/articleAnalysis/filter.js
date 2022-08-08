/**
 * Created by chuangwang on 2019/8/31.
 * 条件过滤
 */
define(function (require, exports, module) {
    // 渠道配置
    let channelConfig = {
        total: {
            name: 'total',
            ptflag: 0
        },
        kuaibao: {
            name: 'kuaibao',
            ptflag: 1
        },
        news: {
            name: 'news',
            ptflag: 2
        },
        qqBrowser: {
            name: 'qqBrowser',
            ptflag: 3
        },
        qq: {
            name: 'qq',
            ptflag: 4
        },
        wx: {
            name: 'wx',
            ptflag: 5
        },
        live: {
            name: 'live',
            ptflag: 0
        },
        qb: {
            name: 'qb',
            ptflag: 0
        },
        qzone: {
            name: 'qzone',
            ptflag: 0
        },
        kandian: {
            name: 'kandian',
            ptflag: 0
        },
        weishi: {
            name: 'weishi',
            ptflag: 0
        },
        other: {
            name: 'other',
            ptflag: 6
        },
        tencentvideo: {
            name: 'other',
            ptflag: 7
        },
    };
    // 类型配置
    let typeConfig = {
        // 单篇统计
        article: {
            tableTbodyConfig: {// table展示配置
                total: {
                    tpl: 'artStatisticList', // 模板
                    api: 'getArticleReal',
                    errorWord: '获取单篇分析数据失败，请刷新后再试'
                },
            }
        },
        // 整体统计
        media: {
            tableTbodyConfig: {// table展示配置
                total: {
                    tpl: 'mediaStatisticList', // 模板
                    // api:'getMediaAnalyze',
                    api: 'getMediaDailyStatistic', // api
                    yearApi: 'getMediaYearlyStatistic',
                    totalapi: 'getMediaTotalStatistic', // 总数据的api
                    errorWord: '获取整体分析数据失败，请刷新后再试'
                },
            }
        },
        // 订阅数统计
        subscribe: {
            tableTbodyConfig: {// table展示配置
                total: {
                    tpl: 'subscribeStatisticList', // 模板
                    api: 'getSubscribeDailyStatistic', // api
                    totalapi: 'getSubscribeTotalData',
                    errorWord: '获取订阅数据失败，请刷新后再试'
                },
            }
        },
        // 单视频统计
        video: {
            tableTbodyConfig: {// table展示配置
                total: {
                    tpl: 'artStatisticList', // 模板
                    api: 'getMediaVideoList',
                    // api:'getArticleStatistic',//api
                    errorWord: '获取单视频统计数据失败，请刷新后再试'
                },
            }
        },
        // 视频整体统计
        videomedia: {
            tableTbodyConfig: {// table展示配置
                total: {
                    tpl: 'videoMediaStatisticList', // 模板
                    // api:'getMediaAnalyze',
                    totalapi: 'getVideoTotalData',
                    api: 'getVideoMediaDaily', // api
                    yearApi: 'getVideoMediaYearly',
                    errorWord: '获取整体分析数据失败，请刷新后再试'
                },
            }
        }
    };
    // 当前筛选配置（动态变化的）
    let currentFilterConfig = {
        type: 'article', // （单篇分析、整体分析、单视频分析、视频整体分析、用户分析）
        // subType:'',
        clientType: '', // （渠道）
        // chartDataType:'',
        channel: { // （渠道）

        },
        time: {
            btime: '',
            etime: ''
        },
        thead: [],
        timeSelect: '0' // （日期选择，1：“年”选择，绘制柱形图）
    };
    let chartDataConfig = {
        'videomedia': {
            play: '播放量'
        },
        'subscribe': {
            subs_cnt_total: '订阅量'
        }
    };
    let videoMediaField = {
        total: 'new_daily_play_pv',
        kuaibao: 'kuaibao_play_pv',
        news: 'inews_play_pv',
        live: 'live_play_pv',
        qzone: 'qzone_play_pv',
        weishi: 'weishi_play_pv',
        kandian: 'kandian_play_pv',
        wx: 'wx_play_pv',
        qb: 'qb_play_pv',
        other: 'o_other_play_pv'
    };
    let subscribeField = {
        total: 'subs_cnt_total',
        kuaibao: 'kuaibao_play_pv',
        news: 'inews_play_pv',
        live: 'live_play_pv',
        qzone: 'qzone_play_pv',
        weishi: 'weishi_play_pv',
        kandian: 'kandian_play_pv',
        wx: 'wx_play_pv',
        qb: 'qb_play_pv',
        other: 'o_other_play_pv'
    };
    let realtimeConfig = {
        article: {
            realtimeApi: 'getRealTimeReadArticle',
            realtimeTotalApi: 'getArticleReadDistribution',
            channels: [{ type: 'total', name: '全部' }, { type: 'kuaibao', name: '天天快报' }, { type: 'inews', name: '腾讯新闻' }, { type: 'qqBrowser', name: 'QQ浏览器' }]// ,{type:'mobileQQ',name:"QQ看点"}
        },
        video: {
            realtimeApi: 'getVideoRealInfo',
            realtimeTotalApi: 'getVideoTotalVV',
            channels: [{ type: 'total', name: '全部' }, { type: 'kuaibao', name: '天天快报' }, { type: 'news', name: '腾讯新闻' }, { type: 'live', name: '腾讯视频' },
                { type: 'qb', name: 'QQ浏览器' }]// ,{type:'qzone',name:"QQ空间"},{type:'other',name:"其他"}
        }
    };
    return {
        currentFilterConfig: currentFilterConfig,
        change: function (obj) { // 改变筛选条件
            if (!obj) {
                return;
            }
            obj.type && (currentFilterConfig.type = obj.type);
            // obj.subType&&(currentFilterConfig.subType=obj.subType);
            obj.clientType && (currentFilterConfig.channel = channelConfig[obj.clientType]);
            obj.btime && (currentFilterConfig.btime = obj.btime);
            obj.etime && (currentFilterConfig.etime = obj.etime);
            // obj.chartDataType &&  (currentFilterConfig.chartDataType = chartDataConfig[obj.chartDataType]);
            obj.clientType && (currentFilterConfig.clientType = obj.clientType);
            obj.thead && (currentFilterConfig.thead = obj.thead);
        },
        getFilterTableTbodyConfig: function () { // 获取过滤后的和table主体展示相关的配置
            return typeConfig[currentFilterConfig.type]['tableTbodyConfig']['total'];
        },
        getChartDataConfig: function () {
            return chartDataConfig[currentFilterConfig.type];
        },
        getRealTimeConfig: function () {
            return realtimeConfig[currentFilterConfig.type];
        },
        getVideoMediaFields: function() {
            console.log('currentFilterConfig:', currentFilterConfig);
            return videoMediaField[currentFilterConfig.channel.name || 'total'];
        },
        getSubscribeFields: function() {
            console.log('currentFilterConfig:', currentFilterConfig);
            return subscribeField[currentFilterConfig.channel.name || 'total'];
        }

    };

});