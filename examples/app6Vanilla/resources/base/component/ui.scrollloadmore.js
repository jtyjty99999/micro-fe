/**
 * Created by minggong on 2017/1/19
 */
define(function(require, exports, module) {
    var $ = window.jQuery;

    module.exports.show = function($target, _config) {
        var config = {};
        $.extend(config, {
            $target: "",
            loadingText: "",
            emptyText: "",
            onformat: function() {
                // 加工处理数据
            },
            onscroll: function(page) {

            },
            onclick: function(data) {

            }
        }, _config);



    };
});