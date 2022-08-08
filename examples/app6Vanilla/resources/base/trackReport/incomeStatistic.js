define(function(require, modules, exports){
    var utils = require('base/trackReport/utils');

    //收益统计--结算中心--账务管理
    !function(){
        var selectorMap = {
            "click #adSettle #binding":"binding",
            "click #adSettle #determine":"determine",
            "click #adSettle #modify":"modify"
        }
        utils.listen(selectorMap, 'supplier', 'ad_supplier').addToTest('adSettle1', selectorMap);
    }()

    //收益统计--结算中心--结算管理
    !function(){
        var selectorMap = {
            "click #adSettleManage #binding":"binding",
            "click #adSettleManage #determine":"determine",
            "click #adSettleManage #modify":"modify"
        }
        utils.listen(selectorMap, 'supplier', 'supplier').addToTest('adSettleManage', selectorMap);
    }()

})