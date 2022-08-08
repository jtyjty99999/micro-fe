/**
 * Created by Jonahnzhang on 2016/8/10.
 */
define(function (require, exports, module) {

    var base=require('base/base');
    var $ = window.jQuery;

    /**
     * Tooltip
     *
     * selector [string] selector 目标选择器 -- 触发事件的元素
     * tooltipClass [string] tooltip  类名 -- 要隐藏、展示的元素
     * tooltipClass 的dom结构需要在selector内部
     */
    function Tooltip (selector, tooltipClass, $container, getAsyncCall, funel) {
        selector = selector || '.tooltip-inlineblock';
        tooltipClass = tooltipClass || ".tooltip";
        var funel = funel || 300;
        $container = $container || $('body');
        var asyncTimeout;
        $container.on('mouseenter', selector, function (e) {
            e.stopPropagation();
            var self =  $(this)
            var h = self.height(),
                vh = $(window).height() - $('.viewpage>.footer').height() - 10
            if(getAsyncCall){
                if(!self.next(tooltipClass).is(':visible')){
                    clearTimeout(asyncTimeout);
                    asyncTimeout = setTimeout(function () {    
                        getAsyncCall(self).then(function(content){
                            if(content!=''){
                                var $inner = self.find('.tooltip-inner', tooltipClass)
                                $inner.html(content);
                                self.find(tooltipClass).show();
                                 if( vh < parseInt($inner.height(),10) + parseInt(self.offset().top,10) + h - $(window).scrollTop()){
                                    self.find(tooltipClass).removeClass('tooltip-top').addClass('tooltip-bottom').css('top', parseInt($inner.height()+h)*(-1)+'px')
                                }else{
                                    self.find(tooltipClass).removeClass('tooltip-bottom').addClass('tooltip-top').css('top', h+'px')
                                }
                            }
                        })
                    }, funel);
                }
            }else{
                $(this).find(tooltipClass).show();
            }
        })
        $container.on('mouseleave', selector, function (e) {
            e.stopPropagation();
            var ele = $(this);
            var dd = setTimeout(function(){
                ele.find(tooltipClass).hide();
                clearTimeout(asyncTimeout);
            }, 50);
            $container.find(selector).unbind('mouseenter');
            $container.find(selector).bind('mouseenter', function() {
                ele.find(tooltipClass).hide();
                clearTimeout(dd);
                $container.find(selector).unbind('mouseenter');
            });
            ele.find(tooltipClass).unbind('mouseenter');
            ele.find(tooltipClass).bind('mouseenter',function(){
                clearTimeout(dd);
                ele.find(tooltipClass).unbind('mouseenter');
            });
        })
    }

    module.exports = Tooltip;
});

