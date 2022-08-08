
define(function (require, exports, module) {
    let base = require('../base/base');

    let $ = base.$;
    let coreConfig = {
        colorList: ['#76ccf7', '#f89d80', '#f8bd57', '#d48de9', '#e98dc1', '#918de9', '#8de9db', '#8bdaad',
            '#b3e3fa', '#c2e9fb', '#caebfc', '#d1eefc', '#d9f1fd']
    };
    function parseDateString(dateStringInRange) { // dateStringInRange格式为yyyy-MM-dd hh:mm:ss
        let t = new Date();
        let day = new Date().Format('yyyy-MM-dd');
        let time = dateStringInRange.substring(0);
        let days = day.split('-') || [];
        let times = time.split(':') || [];
        t.setFullYear(days[0], days[1] - 1, days[2]);
        t.setHours(times[0], times[1], times[2], 0);
        return t;
    }
    function setPieChart(params, id) {
        let pieChart = echarts.init(document.getElementById(id));
        let option = {
            color: coreConfig.colorList.slice(1),
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} {c} ({d}%)'
            },
            calculable: false,
            series: [
                {
                    name: params.name,
                    type: 'pie',
                    radius: ['25%', '55%'],
                    labelLine: {
                        normal: {
                            show: true,
                            length: 20,
                            lineStyle: {
                                color: '#D9DEE0'
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{b} {d}%',
                                textStyle: {
                                    color: '#696969',
                                    fontSize: 12
                                }
                            }
                        }
                    },
                    data: []
                }
            ]
        };
        !!params.seriesdata && (option.series[0].data = params.seriesdata);
        pieChart.setOption(option);
    }

    function setLineData(params, id) {
        let lineChart = echarts.init(document.getElementById(id));
        let me = this;
        let option = {
            color: coreConfig.colorList,
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.5)',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#75DAFB',
                        width: 1,
                        type: 'solid'
                    }
                }
            },
            legend: {
                orient: 'vertical', // 'vertical'
                x: 'right', // 'center' | 'left' | {number},
                // y: 'center', // 'center' | 'bottom' | {number}
                padding: 0,    // [5, 10, 15, 20]
                top: '10px',
                itemGap: 20,
                selected: {
                },
                inactiveColor: ['#76ccf7', '#f89d80', '#f8bd57', '#d48de9', '#e98dc1', '#918de9', '#8de9db', '#8bdaad',
                    '#b3e3fa', '#c2e9fb', '#caebfc', '#d1eefc', '#d9f1fd'],
                data: []
            },

            grid: {
                left: '3%',
                top: '10px',
                right: '13%',
                borderWidth: 0,
                containLabel: true
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
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    axisLine: {
                        lineStyle: {
                            color: '#ccc',
                            width: 0.5
                        }
                    },
                    splitLine: { show: false },
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        formatter: function(val) {
                            val = val >= 100000000 ? new Number(val / 100000000) + '亿' : val >= 10000 ? new Number(val / 10000) + '万' : val;
                            return val;
                        }
                    }
                }
            ],
            series: []
        };
        if (!!params.type && params.type == 'realtime') {
            option.xAxis[0].axisLabel = {
                interval: 46,
                formatter: function (category) {
                    if (!category) {
                        return;
                    }
                    return category.substring(category.indexOf(' ') + 1);

                }
            };
        }
        if (params.legend) {
            option.legend = $.extend(option.legend, params.legend);
        }
        if (params.grid) {
            option.grid = $.extend(option.grid, params.grid);
        }
        !!params.xcategory && (option.xAxis[0].data = params.xcategory);
        if (params.seriesdata) {
            for (let i = 0, len = params.seriesdata.length; i < len; i++) {
                let obj =  {
                    name: params.seriesdata[i].name,
                    type: 'line',
                    symbol: 'circle',
                    symbolSize: 0.5,
                    data: params.seriesdata[i]['arr'],
                    itemStyle: {
                        normal: {
                            // color: '#FD8472',
                            lineStyle: {        // 系列级个性化折线样式
                                width: 2
                            }
                        }
                    }
                };
                option.legend.data.push(obj.name);
                // option.legend.selected[params.seriesdata[i].name] = false;

                option.series.push(obj);
            }
        }
        // !!params.seriesdata && (option.series[0].data = params.seriesdata);
        lineChart.setOption(option);
    }

    function setBarData(params, id) {
        let barChart = echarts.init(document.getElementById(id));
        let me = this;
        let option = {
            color: coreConfig.colorList,
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.5)',
                axisPointer: {
                    type: 'shadow',
                }
            },
            legend: {
                orient: 'vertical', // 'vertical'
                x: 'right', // 'center' | 'left' | {number},
                padding: 0,    // [5, 10, 15, 20]
                itemGap: 20,
                selected: {
                },
                inactiveColor: ['#76ccf7', '#f89d80', '#f8bd57', '#d48de9', '#e98dc1', '#918de9', '#8de9db', '#8bdaad',
                    '#b3e3fa', '#c2e9fb', '#caebfc', '#d1eefc', '#d9f1fd'],
                data: []
            },

            grid: {
                left: '3%',
                top: '5px',
                right: '13%',
                borderWidth: 0,
                containLabel: true
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
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    axisLine: {
                        lineStyle: {
                            color: '#ccc',
                            width: 0.5
                        }
                    },
                    splitLine: { show: false },
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        formatter: function(val) {
                            val = val >= 100000000 ? new Number(val / 100000000) + '亿' : val >= 10000 ? new Number(val / 10000) + '万' : val;
                            return val;
                        }
                    }
                }
            ],
            series: []
        };
        if (params.legend) {
            option.legend = $.extend(option.legend, params.legend);
        }
        if (params.grid) {
            option.grid = $.extend(option.grid, params.grid);
        }
        !!params.xcategory && (option.xAxis[0].data = params.xcategory);
        if (params.seriesdata) {
            for (let i = 0, len = params.seriesdata.length; i < len; i++) {
                let obj =  {
                    name: params.seriesdata[i].name,
                    type: 'bar',
                    barWidth: 30,
                    data: params.seriesdata[i]['arr'],
                    itemStyle: {
                        normal: {
                            // color: '#FD8472',
                            lineStyle: {        // 系列级个性化折线样式
                                width: 2
                            }
                        }
                    }
                };
                option.legend.data.push(obj.name);
                // option.legend.selected[params.seriesdata[i].name] = false;

                option.series.push(obj);
            }
        }
        barChart.setOption(option);
    }
    return {
        updateChart: setLineData,
        updatePieChart: setPieChart,
        updateBarChart: setBarData,
    };
});