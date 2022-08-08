
define(function (require, exports, module) {
    let base = require('OM_BASE');
    let $ = base.$;
    let omapi = require('service/articleStatistic');
    let template = require('biz/article/articleAnalysis/template');
    let filter = require('biz/article/articleAnalysis/filter');
    let currentFilterConfig = filter.currentFilterConfig;
    let tableTheadTpFolder = 'tableThead/';// thead模板目录
    let $totalData = $('#mediaStatisticTotal');

    function fixNum(num) {
        if (num == undefined) {
            num = '--';
        } else if (num > 100000000) {
            let a = num / 100000000;
            num = a.toFixed(1) + '<em>亿</em>';
        } else if (num > 10000) {
            let a = num / 10000;
            num = a.toFixed(1) + '<em>万</em>';
        }
        return num;
    }
    function updateTotalData() {
        let sel = filter.getFilterTableTbodyConfig();
        let param = {
            name: currentFilterConfig.channel.name,
            ptflag: currentFilterConfig.channel.ptflag
        };
        if (currentFilterConfig.type == 'subscribe') {
            omapi[sel.totalapi](param).done(function(res) {
                if (res.response.code == '0') {
                    if (res.data) {
                        if (res.data.total_fans > 0) {
                            $('#subscribe').html(fixNum(res.data.total_fans));
                        }
                    }
                } else {
                    popAlert('error', sel.errorWord);
                }
            });
        } else {
            $totalData.html(template(tableTheadTpFolder + currentFilterConfig.type + '/totalData', { currentFilterConfig: currentFilterConfig }));
            omapi[sel.totalapi](param).done(function(res) {
                if (res.response.code == '0') {
                    if (res.data) {
                        let numKey = ['read', 'exposure', 'subscribe', 'exposure_article', 'play_pv', 'play_video_num'];
                        res.data['format'] = '';
                        for (let i = 0, len = numKey.length; i < len; i++) {
                            if (res.data[numKey[i]]) {
                                if (res.data[numKey[i]]['yesterday_pv'] > 1000000 || res.data[numKey[i]]['yestoday'] > 1000000) {
                                    res.data['format'] = 'sm';
                                }
                            }
                        }
                        $totalData.html(template(tableTheadTpFolder + currentFilterConfig.type + '/totalData', { currentFilterConfig: currentFilterConfig, data: res.data }));
                    }
                } else {
                    popAlert('error', sel.errorWord);
                }
            });
        }
    }
    return {
        update: updateTotalData
    };
});