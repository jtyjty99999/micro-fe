define(function(require, exports, module) {
    let base = require('OM_BASE');
    let omapi = require('service/articleStatistic');
    let template = require('biz/article/articleAnalysis/template');
    let config = {
        chartsArr: {
            chartbox4: null,
            chartbox5: null,
            chartbox6: null
        },
        colorConfig: {
            mapColor: ['#67c7f6', '#76ccf7', '#85d2f8', '#94d8f9', '#a4ddfa', '#b3e3fa', '#c2e9fb', '#caebfc', '#d1eefc', '#d9f1fd']
        },
        attrMap: {
            'inews_kuaibao': '腾讯新闻与快报',
            'live': '腾讯视频',
            'qzone': 'QQ空间',
            'qbrowse': 'QQ浏览器',
            'kandian': 'QQ看点',
            'other': '其他'
        },
        ageHeight: $('.chartbox-age').height() - 95
    };
    function initData() {
        getUserAnalysisData();
    }
    function getUserAnalysisData() {
        let self = this;
        getVPlusUserData({}, function(data) {
            setPieData(data.sex, 'chartbox5', '性别分布');
            setProgressData(data.age, $('.age'), 'verticalprogress');
            setProgressData(data.education, $('.education'), 'verticalprogress');
            setCityMapChart(data.province, 'chartbox6');
            setCityDataList(data.province, $('.chartdetail .list'));
        });
    }
    function getVPlusUserData(param, func) {
        let self = this;
        omapi.VPlusUserDataShow(param).done(function(res) {
            if (res.response.code == '0') {
                $('.null-loading').hide();
                if (res.data) {
                    if (res.data.length == 0) {
                        $('#nullChart').show();
                        $('.panel').hide();
                    } else {
                        $('#nullChart').hide();
                        $('.panel').show();
                        !!func && func(res.data);
                    }
                }
            } else {
                layer.msg('获取用户分析数据失败');
            }
        });
    }

    function initChart(func, id) {
        let line = document.getElementById(id);
        if (!config.chartsArr[id]) {
            config.chartsArr[id] = echarts.init(line);
            config.chartsArr[id].showLoading({
                text: '正在努力的读取数据中...',
                effect: 'spin',
                textStyle: {
                    color: '#666',
                    fontSize: 15,
                    fontFamily: '"MicroSoft YaHei", tahoma, arial, "Hiragino Sans GB", sans-serif'
                },
                effectOption: {
                    backgroundColor: 'rgba(255,255,255,0.5)'
                }
            });
        }
        if (func) {
            func();
        }
    }
    function setPieData(data, id, name) {
        let me = this;

        let arr = [];
        // var max = 0;
        if (data) {
            $.each(data, function(i, el) {
                let obj = {};
                // if(i != 'total_vv'){
                //     if(el > 0){
                obj.name = config.attrMap[el.name] || el.name;
                // max = max <el? el:max;
                obj.value = el.vv;
                arr.push(obj);
                // }
                // }
            });
            // if(max == 0){
            //    arr = [];
            // }
        }

        let option = {
            color: ['#F99D7D', '#F9BE4C', '#62C6F8', '#88DBAC', '#89EADB', '#918AEC', '#EB8BC2', '#D58AEB'],
            calculable: false,
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {d}%'
            },
            noDataLoadingOption: {
                text: '暂无数据',
                textStyle: {
                    fontFamily: '"Helvetica Neue","Hiragino Sans GB","Microsoft YaHei","\u5FAE\u8F6F\u96C5\u9ED1","\u5B8B\u4F53","\u9ED1\u4F53",Arial,sans-serif',
                    fontSize: 14,
                    color: '#a7b0bc'
                },
                effect: 'bubble',
                effectOption: {
                    backgroundColor: '#fff',
                    effect: {
                        n: 0
                    }
                }
            },
            series: [
                {
                    name: name,
                    type: 'pie',
                    radius: ['30%', '60%'],
                    // avoidLabelOverlap: false,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{b} :{d}%',
                                textStyle: {
                                    color: '#696969',
                                    fontSize: 14
                                }
                            },
                            labelLine: {
                                show: true,
                                length: 50,
                                lineStyle: {
                                    color: '#D9DEE0'
                                }
                            }
                        }
                    }
                }
            ]
        };
        option.series[0].data = arr;
        if (!config.chartsArr[id]) {
            initChart(function () {
                config.chartsArr[id].hideLoading();
                config.chartsArr[id].setOption(option);
            }, id);
            config.chartsArr[id].hideLoading();
            config.chartsArr[id].clear();
            config.chartsArr[id].setOption(option);
        }
    }
    function setRadarData(data, id) {
        let me = this;

        let max = 0.5; let _data = []; let _arr = []; let _indicator = [];
        if (data) {
            $.each(data, function(i, el) {
                let obj = {
                    'text': el['name']
                };
                max = max < el['vv'] ? el['vv'] : max;
                _indicator.push(obj);
                _arr.push(el['vv']);
            });
            $.each(_indicator, function(i, el) {
                el.max = max;
            });
            _data = [{
                name: '星座',
                value: _arr
            }];
            // }
        }

        let option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            noDataLoadingOption: {
                text: '暂无数据',
                textStyle: {
                    fontFamily: '"Helvetica Neue","Hiragino Sans GB","Microsoft YaHei","\u5FAE\u8F6F\u96C5\u9ED1","\u5B8B\u4F53","\u9ED1\u4F53",Arial,sans-serif',
                    fontSize: 14,
                    color: '#a7b0bc'
                },
                effect: 'bubble',
                effectOption: {
                    backgroundColor: '#fff',
                    effect: {
                        n: 0
                    }
                }
            },
            calculable: true,
            polar: [
                {
                    indicator: [],
                    name: {
                        textStyle: { color: '#000' }
                    },
                    center: ['50%', 210],
                    radius: 140,
                    axisLine: {            // 坐标轴线
                        show: true,        // 默认显示，属性show控制显示与否
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: '#98DAFB',
                            width: 1,
                            type: 'solid'
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(103,199,246,0.2)', 'rgba(103,199,246,0.4)', 'rgba(103,199,246,0.6)', 'rgba(103,199,246,0.8)', 'rgba(103,199,246,1)']
                            // color: ['rgba(103,199,246,1)','rgba(103,199,246,0.8)','rgba(103,199,246,0.6)','rgba(103,199,246,0.4)','rgba(103,199,246,0.2)']
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            width: 1,
                            color: '#98DAFB'
                        }
                    }
                }
            ],
            series: [
                {
                    type: 'radar',
                    itemStyle: { normal: { areaStyle: { type: 'default', color: '#DDC3BF' }, color: '#FA9D7D' }}
                }
            ]
        };

        option.polar[0].indicator = _indicator;
        option.series[0].data = _data;
        if (!config.chartsArr[id]) {
            initChart(function () {
                config.chartsArr[id].hideLoading();
                config.chartsArr[id].setOption(option);
            }, id);
        } else {
            config.chartsArr[id].hideLoading();
            config.chartsArr[id].clear();
            config.chartsArr[id].setOption(option);
        }
    }
    function setProgressData(data, view, type) {
        let html = '';
        if (!data || data == null || data.length == 0) {
            if (type == 'horizontalprogress') {
                html = '<tr class="no-hover">            <td colspan="8">            <div class="null-mod">    <p>暂无数据</p>            </div>            </td>            </tr>';
            } else {
                html = '<div class="null-mod">                                <p>暂无数据</p>                </div>';
            }

        } else {
            view.css('width', 70 * data.length);
            let total = 0;// yulinyulin修复total计算bug, 原始为total=1
            let max = data[0]['vv'];
            for (var i = 0, len = data.length; i < len; i++) {
                total += data[i]['vv'];
                max = max < data[i]['vv'] ? data[i]['vv'] : max;
            }
            total = total || 1;// yulinyulin修复total计算bug
            for (var i = 0, len = data.length; i < len; i++) {
                data[i]['index'] = i;
                let _d = data[i]['vv'] / total;
                let _h = data[i]['vv'] / max;
                data[i]['percent'] = _d == 0 ? 0 : new Number(_d * 100).toFixed(1);
                data[i]['height'] = _h == 0 ? 1 : new Number(config.ageHeight * _h).toFixed(1);
                html += template(type, data[i]);
            }
        }
        view.html(html);

    }
    // 省份地图
    function setCityMapChart(data, id) {
        let arr = []; let temp = [];
        let me = this;
        if (data) {
            $.each(data, function (i, el) {
                if (el.name != '其他') {
                    temp.push(el.vv);
                }
            });

            temp.sort(function (a, b) {
                return b - a;
            });
            var total = 0;// yulinyulin修复total计算bug, 原始为total=1
            for (var i = 0, len = data.length; i < len; i++) {
                total += data[i]['vv'];
                // max = max < data[i]['vv'] ? data[i]['vv']:max;
            }
            total = total || 1;// yulinyulin修复total计算bug
            for (var i = 0, len = data.length; i < len; i++) {
                arr.push({ name: data[i].name, value: new Number(data[i].vv / total * 100).toFixed(1) });
            }
        }
        let option = {
            dataRange: {
                min: 0,
                max: temp[0] ? Math.ceil(new Number(temp[0] / total * 100)) : 0,
                x: 'left',
                y: 'bottom',
                text: ['高(%)', '低(%)'],
                calculable: true,
                color: config.colorConfig.mapColor
            },
            tooltip: {
                trigger: 'item',
                formatter: function (item) {
                    if (item.value == '-') {
                        return item.seriesName + '<br/>' + item.name + '：-';
                    }
                    return item.seriesName + '<br/>' + item.name + '：' + item.value + '%';
                }
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                x: 'left',
                y: 'center'
            },
            series: [
                {
                    name: '省份分布',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    itemStyle: {
                        normal: { label: { show: true, textStyle: { color: '#333' }}, color: '#eaeef1' },
                        emphasis: { label: { show: true }, areaStyle: { color: '#92ddff' }}
                    },
                    data: arr
                }
            ]
        };
        if (!config.chartsArr[id]) {
            initChart(function () {
                config.chartsArr[id].hideLoading();
                config.chartsArr[id].setOption(option);
            }, id);
        } else {
            config.chartsArr[id].hideLoading();
            config.chartsArr[id].clear();
            config.chartsArr[id].setOption(option);
        }


    }
    function setCityDataList(data, view) {
        let html = '';
        if (!data || data == null || data.length == 0) {
            html = '<div class="null-mod">                                <p>暂无数据</p>                </div>';
        } else {
            let total = 0;// yulinyulin修复total计算bug, 原始为total=1
            for (var i = 0, len = data.length; i < len; i++) {
                total += data[i]['vv'];
                // max = max < data[i]['vv'] ? data[i]['vv']:max;
            }
            total = total || 1;// yulinyulin修复total计算bug
            for (var i = 0, len = data.length; i < len; i++) {
                data[i]['index'] = i;
                let _d = data[i]['vv'] / total;
                // var _h = data[i]['vv'] / max;
                data[i]['percent'] = _d == 0 ? 0 : new Number(_d * 100).toFixed(1);
                // data[i]['height'] = _h==0 ? 1:new Number(config.ageHeight*_h).toFixed(1);
                html += '<li><span class="left">' + data[i].name + '</span><span class="right">' + data[i]['percent'] + '%</span></li>';
                // template(type, data[i]);
            }
        }
        view.html(html);
    }
    function main() {
        let self = this;
        let isBind = false;
        // 事件绑定
        function eventBind() {

        }
        function init() {
            initData();
        }
        this.isInit = false;
        // 业务初始化
        this.bizInit = function() {
            init();
            this.isInit = true;
            // 放数据加载
            return this;
        };
        this.render = function() {
            if (!isBind) {
                isBind = true;
                eventBind();
            }
            return this;
        };
    }
    let mainEnter = new main();
    return mainEnter;
});