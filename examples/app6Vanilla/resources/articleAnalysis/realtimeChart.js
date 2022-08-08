
define(function (require, exports, module) {
    let base = require('OM_BASE');
    let $ = base.$;
    let omapi = require('service/articleStatistic');
    let template = require('biz/article/articleAnalysis/template');
    let filter = require('biz/article/articleAnalysis/filter');
    let trendChart = require('biz/article/articleAnalysis/trendChart');
    let currentFilterConfig = filter.currentFilterConfig;
    let lineData = null; // 右侧线状图数据
    let pieData = null; // 左侧饼状图数据
    let readMap = {
        kuaibao_read: '天天快报',
        inews_read: '腾讯新闻',
        qqBrowser_read: 'QQ浏览器',
        mobileQQ_read: 'QQ看点',
        wx_read: '微信看一看'
    };
    let vvMap = {
        total_kuaibao_play_pv: '天天快报',
        total_inews_play_pv: '腾讯新闻',
        total_live_play_pv: '腾讯视频',
        total_qb_play_pv: 'QQ浏览器',
        total_kandian_play_pv: 'QQ看点',
        total_wx_play_pv: '微信看一看',
        total_weishi_play_pv: '微视',
        new_total_other_play_pv: '其他'
    };
    function realtimeChartUpdate(articleId, titleType, container) {

        container.html(template('realtimeChart', { data: { type: currentFilterConfig.type == 'article' ? '阅读量' : '播放量' }}));
        let api = filter.getRealTimeConfig()['realtimeApi'];
        let totalApi = filter.getRealTimeConfig()['realtimeTotalApi'];
        lineData = null;
        pieData = null;
        drawlineChart();
        omapi[totalApi]({ article: articleId, titleType: titleType }).done(function(res) {
            if (res.response.code == '0') {
                if (res.data) {
                    pieData = res.data;
                    container.find('#pieState').hide();
                    container.find('#pieChart').show();
                    if (currentFilterConfig.type == 'article') {
                        container.find('.chart-num').html('<p class="text">总阅读量</p>' + res.data['total_read']);
                    } else {
                        container.find('.chart-num').html('<p class="text">总播放量</p>' + res.data['new_total_play_pv']);
                    }
                    drawPieChart();
                }
            } else {
                window.popAlert && window.popAlert('error', '实时分析获取失败，请刷新后再试');
            }
        });
        omapi[api]({ article: articleId, titleType: titleType }).done(function(res) {
            if (res.response.code == '0') {
                if (res.data) {
                    lineData = res.data;
                    drawlineChart();
                }
            } else {
                window.popAlert && window.popAlert('error', '实时分析获取失败，请刷新后再试');
            }

        });
    }
    function drawPieChart() {
        let param = {
            name: currentFilterConfig.type == 'video' ? '总播放量' : '总阅读量',
            seriesdata: []
        };
        let map = currentFilterConfig.type == 'video' ? vvMap : readMap;
            for (let key in map) {
                param.seriesdata.push({ value: pieData[key], name: map[key] });
            }
        trendChart.updatePieChart(param, 'pieChart');
        
    }
    function drawlineChart() {
        let param = {
            legend: {
                orient: 'horizontal',
                top: '5px',
                x: 'left'
            },
            grid: {
                left: '3%',
                top: '20%',
                right: '3%',
            },
            orient: 'horizontal',
            type: 'realtime',
            xcategory: [],
            seriesdata: [],
        };
        if (!lineData || lineData == null || lineData.length == 0) {
            trendChart.updateChart(param, 'lineChart');
        } else {
            let channels = filter.getRealTimeConfig()['channels'];
            let xdata = lineData[channels[0]['type']]['detail'] || lineData[channels[0]['type']];
            for (let i = 0; i < xdata.length; i++) {
                param.xcategory.push(xdata[i]['time']);
            }
            for (let j = 0, len = channels.length; j < len; j++) {
                let obj = {
                    name: channels[j].name,
                    type: currentFilterConfig.type == 'article' ? 'read' : 'play',
                    arr: []
                };
                let detail = lineData[channels[j]['type']]['detail'] || lineData[channels[j]['type']];
                for (let k = 0, len1 = detail.length; k < len1; k++) {
                    obj.arr.push(detail[k][obj.type]);
                }
                obj.arr.reverse();
                param.seriesdata.push(obj);
            }
            param.xcategory.reverse();
            trendChart.updateChart(param, 'lineChart');
        }
    }
    return {
        update: realtimeChartUpdate,
    };
});