/**
 * Created by xiabingwu on 2016/3/23.
 * 第三方库 cmd封装
 */
define(function(require,exports,module){
    var plugin={};
    plugin.get$=function(){
        var $;
        //如果使用了视频的基础库
        if(typeof $j!='undefined'){
            $=$j;
        }
        //如果使用了jQuery
        if(typeof jQuery!='undefined'){
            $=jQuery;
        }
        //如果使用了Zepto
        if(typeof Zepto!='undefined'){
            $=Zepto;
        }
        return $;
    };
    return plugin;
});