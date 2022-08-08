
define(function (require, exports, module) {

    let base = require('../base/base');
    let $ = base.$;
    let omapi = require('./articleStatistic');
    let newPaging = base.component.newPaging;
    let template = require('./template');
    let filter = require('./filter');
    let trendChart = require('./trendChart');
    let tableThead = require('./tableThead');
    let currentFilterConfig = filter.currentFilterConfig;
    let $tbody = $('#tableList tbody');
    let $thead = $('#tableList thead');
    let tableTbodyTpFolder = 'tableTbody/';// 模板目录
    /* 分页组件配置开始 */
    let newPagingConfig = {
        currentPage: 1,
        totalPage: 0,
        perNum: 8,
        paginationholder: $('.paginationholder'),
        okfunc: renderlist,
        nofunc: nolist,
        wraper:''
    };
    let statisticData = ''; // 整体分析中用于保存数据画图,一次拉取所有数据，前端分页
    let currentFields = null;
    let reg = /(<tr>[\s\S]*?<\/tr>)/g;
    let limit = 8;
    let pages = [];
    function splicePage(lastPages) {
        pages.push(lastPages.splice(0, limit).join(''));
        if (lastPages.length) {
            splicePage(lastPages);
        }
    }

    // 将过滤器上的信息同步到分页组件上
    function newPagingConfigUpdateFromFilter() {
        let sel = filter.getFilterTableTbodyConfig();
        newPagingConfig.api = currentFilterConfig.timeSelect == '1' ? omapi[sel.yearApi] : omapi[sel.api];
        newPagingConfig.tpl = sel.tpl;
        newPagingConfig.errorWord = sel.errorWord;
        if (currentFilterConfig.timeSelect == '1') {
            newPagingConfig.getlistparam = {
                btime: currentFilterConfig.btime,
                etime: currentFilterConfig.btime,
                ptflag: currentFilterConfig.channel.ptflag,
                channelname: currentFilterConfig.channel.name
            };
        } else {
            newPagingConfig.getlistparam = {
                btime: currentFilterConfig.btime,
                etime: currentFilterConfig.etime,
                ptflag: currentFilterConfig.channel.ptflag,
                channelname: currentFilterConfig.channel.name
            };
        }
        if (currentFilterConfig.type == 'media' || currentFilterConfig.type == 'videomedia' || currentFilterConfig.type == 'subscribe') {
            newPagingConfig.perNum = 1000;
        }
    }
    function renderlist(data) {
        let totalPage = 0;
        let dataStatistic;
        try {
            totalPage = data.data.totalPage || data.data.total / newPagingConfig.perNum;
        } catch (e) {}
        try {
            dataStatistic = data.data.statistic || data.data.list;
        } catch (e) {

        }
        if (totalPage) {
            pageingShow();
        } else {
            pageingHide();
        }
        if (!dataStatistic || dataStatistic == null || dataStatistic.length == 0) {
            dataEmpty();
        } else {
            dataOk();
            statisticData = dataStatistic;
            if (currentFilterConfig.type == 'media' || currentFilterConfig.type == 'videomedia' || currentFilterConfig.type == 'subscribe') {
                if (currentFilterConfig.type == 'media') {
                    currentFields = data.data.fields || [];
                }
                if (currentFilterConfig.timeSelect == '1') {
                    drawBarChart();
                } else {
                    drawlineChart();
                }
            }
            updateThead();
            tableTbodyList(newPagingConfig.tpl, dataStatistic);
        }


    }
    function updateThead() {
        let theads = filter.getChartDataConfig() || currentFields;
        let xhead = [];
        if (theads) {
            for (let key in theads) {
                let h = {
                    name: theads[key],
                    type: key
                };
                if (currentFilterConfig.type == 'videomedia') {
                    h.type = filter.getVideoMediaFields();
                }
                if (currentFilterConfig.type == 'subscribe') {
                    h.type = 'subs_cnt_total';
                }
                xhead.push(h);
            }
        }
        filter.change({
            thead: xhead
        });
        tableThead.update();
    }

    function nolist() {
        popAlert('error', newPagingConfig.errorWord);
        dataEmpty();
    }
    /* 分页组件配置结束 */

    // 表单主体更新
    function tableTbodyUpdate(box) {
        console.log(box);
        dataLoading();
        /* 将过滤器配置，更新到关联的分页组件开始 */
        newPagingConfigUpdateFromFilter();
        /* 将过滤器配置，更新到关联的分页组件结束 */
        newPagingConfig.wraper = box;
        let listpaging = new newPaging(newPagingConfig);
        listpaging.getList(1);
    }
    // 表格填充
    function tableTbodyList(tpl, dataStatistic) {
        let html = template(tableTbodyTpFolder + currentFilterConfig.type + '/' + tpl, { dataStatistic: dataStatistic, currentFilterConfig: currentFilterConfig });
        if (currentFilterConfig.type == 'media' || currentFilterConfig.type == 'videomedia' || currentFilterConfig.type == 'subscribe') {
            let data = html.match(reg);
            pages = [];
            splicePage(data);

            $tbody.html(pages[0]);
            $('.paginationholder').html('<ul class="pagination"></ul>');
            $('.pagination').twbsPagination({
                totalPages: pages.length,
                visiblePages: pages.length,
                onPageClick: function (event, pageIndex) {
                    $tbody.html(pages[pageIndex - 1]);
                }
            });
            $thead.show();
        } else {
            $('#'+ newPagingConfig.wraper).html(html);
        }
    }
    // 数据加载中
    function dataLoading() {
        $('.null-loading').show();
        $('#nullChartbox').hide();
        $('#nullDetail').hide();
        $('#chartBox').hide();
        $('#tableList').hide();
        $('.paginationholder').hide().empty();
    }
    function dataEmpty() {
        $('.null-loading').hide();
        $('#nullChartbox').show();
        $('#nullDetail').show();
        $('#chartBox').hide();
        $('#tableList').hide();
        pageingHide();
    }
    function dataOk() {
        $('.null-loading').hide();
        $('#nullChartbox').hide();
        $('#nullDetail').hide();
        $('#chartBox').show();
        $('#tableList').show();
        pageingShow();
    }
    // 页码显示
    function pageingShow() {
        $('.paginationholder').show();
    }
    // 页码隐藏
    function pageingHide() {
        $('.paginationholder').hide().empty();
    }
    function drawlineChart() {
        let param = {
            xcategory: [],
            seriesdata: []
        };
        let chartData = filter.getChartDataConfig() || currentFields;
        let xfield = currentFilterConfig.type == 'videomedia' ? 'date' : currentFilterConfig.type == 'subscribe' ? 'fdate' : 'statistic_date';
        if (chartData) {
            for (let key in chartData) {
                let obj = {
                    name: chartData[key],
                    type: currentFilterConfig.type == 'videomedia' ? filter.getVideoMediaFields() : key,
                    arr: []
                };
                param.seriesdata.push(obj);
            }
        }
        if (!statisticData || statisticData == null || statisticData.length == 0) {
        } else {
            // param.name = currentFilterConfig.chartDataType.name;
            for (let i = statisticData.length - 1; i >= 0; i--) {
                param.xcategory.push(statisticData[i][xfield]);
                for (let j = 0, len = param.seriesdata.length; j < len; j++) {
                    param.seriesdata[j]['arr'].push(statisticData[i][param.seriesdata[j].type]);
                }
            }
        }
        trendChart.updateChart(param, 'chartBox');
    }

    function drawBarChart() {
        let param = {
            xcategory: [],
            seriesdata: []
        };
        let chartData = filter.getChartDataConfig() || currentFields;
        let xfield = currentFilterConfig.type == 'videomedia' ? 'date' : 'statistic_date';
        if (chartData) {
            for (let key in chartData) {
                let obj = {
                    name: chartData[key],
                    type: currentFilterConfig.type == 'videomedia' ? filter.getVideoMediaFields() : key,
                    arr: []
                };
                param.seriesdata.push(obj);
            }
        }
        if (!statisticData || statisticData == null || statisticData.length == 0) {
        } else {
            // param.name = currentFilterConfig.chartDataType.name;
            for (let i = statisticData.length - 1; i >= 0; i--) {
                param.xcategory.push(statisticData[i][xfield]);
                for (let j = 0, len = param.seriesdata.length; j < len; j++) {
                    param.seriesdata[j]['arr'].push(statisticData[i][param.seriesdata[j].type]);
                }
            }
        }
        trendChart.updateBarChart(param, 'chartBox');
    }
    function updateTbody() {
        if (!statisticData || statisticData == null || statisticData.length == 0) {
            dataEmpty();
        } else {
            dataOk();
            let sel = filter.getFilterTableTbodyConfig();
            updateThead();
            tableTbodyList(sel.tpl, statisticData);
        }
    }
    return {
        update: tableTbodyUpdate,
        drawlineChart: drawlineChart,
        drawBarChart: drawBarChart,
        updateTbody: updateTbody
    };
});