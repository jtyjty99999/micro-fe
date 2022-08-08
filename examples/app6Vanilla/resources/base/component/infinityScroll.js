/**
 * ÎÞÏÞ¹ö¶¯
 * copy from 'biz/wenda/detail/utils/infinityscroll'
 */
define(function (require, exports, module) {

    return  function (ele, option) {
        option = $.extend(true, {
            onBottom: function() {},
            gap: 200
        }, option);
        setInterval(function(){
            var lastChild = $(ele).children().last()
            if(!lastChild) return;
            var offset = lastChild.offset();
            if(!offset) return;
            var arrivedTheBottom = offset.top < window.innerHeight + $(window).scrollTop();
            if(arrivedTheBottom) {
                option.onBottom(lastChild);
            }
        }, option.gap);
    }

})
