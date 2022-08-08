/**
 * Created by jonahnzhang on 2016/4/7.
 */
define(function (require, exports, module) {

    var base = require('base/base');
    var $ = window.jQuery;

    function Placeholder(selector) {
        selector = (selector || '.placeholder')+':not(.clearSideEffect)';

        function unselect(e){ e.preventDefault(); return false; }

        $(selector).unbind('selectstart', unselect);
        $(selector).unbind('mousedown', unselect);
        $(selector).bind('selectstart', unselect);
        $(selector).bind('mousedown', unselect);
        // $(selector).addClass('disabled').prop('disabled',true);
        $(selector).each(function(index,ele) {
            var target = $(ele);
            target.on('click',function(e){
                target.prev().trigger('focus')
            })
        })

        $(selector).prev().each(function(index,ele) {
            var target = $(ele);
            if(target.val()) {
                target.next().hide();
            }
            if(target.data('evt') !== 'focus') {
                var pid;
                target.data('evt','focus');
                target.on('focus',function(){
                    var input = $(this);
                    var placeholder = $(this).next();
                    var clearIcon = $(this).parent().siblings('.input-clear-btn');
                    pid = setInterval(function() {
                        var last;
                        var cv = input.val();
                        if(last!==cv) { last = cv; }
                        if(last) {
                            placeholder.hide();
                            clearIcon.show();
                        } else {
                            placeholder.show();
                            clearIcon.hide();
                        }
                    }, 30);
                }).on('blur', function(){
                    clearInterval('pid');
                })
            }
        });
    };

    return Placeholder;
});
