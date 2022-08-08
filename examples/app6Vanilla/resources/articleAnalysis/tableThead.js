
define(function (require, exports, module) {
    let base = require('../base/base');
    var $ = base.$;
    var template = require('./template');
    var filter = require('./filter');
    var currentFilterConfig = filter.currentFilterConfig;
    var $thead = $('#tableList thead');
    var $total = $('#mediaStatisticTotal');
    var tableTheadTpFolder = 'tableThead/';//thead模板目录
    function tableTheadUpdate(){
        $thead.html(template(tableTheadTpFolder+currentFilterConfig.type+'/tableThead',{currentFilterConfig:currentFilterConfig}));
    }
    return {
        update:tableTheadUpdate
    };
});