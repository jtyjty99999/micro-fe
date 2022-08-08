define(function(require, exports, module) {
    $.mixhover = function() {
        // 整理参数 $.mixhover($e1, $e2, handleIn, handleOut)
        var parms;
        var length = arguments.length;
        var handleIn = arguments[length - 2];
        var handleOut = arguments[length - 1];
        if ($.isFunction(handleIn) && $.isFunction(handleOut)) {
            parms = Array.prototype.slice.call(arguments, 0, length - 2);
        } else if ($.isFunction(handleOut)) {
            parms = Array.prototype.slice.call(arguments, 0, length - 1);
            handleIn = arguments[length - 1];
            handleOut = null;
        } else {
            parms = arguments;
            handleIn = null;
            handleOut = null;
        }

        // 整理参数 使得elements依次对应
        var elems = [];
        for (var i = 0, len = parms.length; i < len; i++) {
            elems[i] = [];
            var p = parms[i];
            if (p.constructor === String) {
                p = $(p);
            }
            if (p.constructor === $ || p.constructor === Array) {
                for (var j = 0, size = p.length; j < size; j++) {
                    elems[i].push(p[j]);
                }
            } else {
                elems[i].push(p);
            }
        }

        // 绑定Hover事件
        for (var i = 0, len = elems[0].length; i < len; i++) {
            var arr = [];
            for (var j = 0, size = elems.length; j < size; j++) {
                arr.push(elems[j][i]);
            }
            $._mixhover(arr, handleIn, handleOut);
        }
    };
    $._mixhover = function(elems, handleIn, handleOut) {
        var isIn = false,
            timer;
        $(elems).hover(function() {
                window.clearTimeout(timer);
                if (isIn === false) {
                    handleIn && handleIn.apply(elems, elems);
                    isIn = true;
                }
            },
            function() {
                timer = window.setTimeout(function() {
                    handleOut && handleOut.apply(elems, elems);
                    isIn = false;
                }, 100);
            });
    };
    exports.msg = function() {
        var iconMap = {
            "error": "2",
            "info": "3",
            "loading": "4",
            "success": "1"
        };
        var type, content, config;

        if (arguments.length == 1) {
            content = arguments[0];
            layer.msg(content, {
                icon: iconMap["info"]
            });
        } else if (arguments.length == 2) {
            if (typeof arguments[1] == "string") {
                type = arguments[0];
                content = arguments[1];
                layer.msg(content, {
                    icon: iconMap[type] || 3
                });
            } else {
                content = arguments[0];
                config = arguments[1];
                layer.msg(content, config);
            }
        }
    };
    /**
     * opt 配置
     * @param  {[type]} opt [description]
     * @return {[type]}     [description]
     */
    exports.popup = function($target, opt) {
        // autohide 是否自动隐藏
        // width 弹层宽度
        // left 偏移量
        // content 
        // success 回调函数
        // position top bottom left right auto
        // 
        positionMap = {
            "top": 1,
            "bottom": 2,
            "left": 3,
            "right": 4
        };
        // var content = '<div style="padding: 10px;border:none;" class="tooltip-inner">' + opt.content + '</div>';
        var content = opt.content;
        var layerid = layer.tips(content, $target, {
            skin: "layer-ext-om tips",
            time: 80000,
            tips: positionMap[opt.position] || 3,
            maxWidth: (opt.width || 510) + 50,
            success: function($container, index) {

                var width = $container.width();
                var left = parseInt($target.offset().left) + $target.width() / 2;
                $container.css("left", left - (width / 2) + (opt.left || 0));
                // 与 mouseenter 事件不同，不论鼠标指针穿过被选元素或其子元素，都会触发 mouseover 事件。只有在鼠标指针穿过被选元素时，才会触发 mouseenter 事件
                opt.success && opt.success($container, index);
                if (opt.autohide == "mouseleave") {
                    $.mixhover($target, $container, function() {
                        // console.log("hideIn");
                    }, function() {
                        // console.log("hideOut");
                        layer.close(index);
                    });
                } else if (opt.autohide == "click") {
                    $container.on("click", function() {
                        return false;
                    });
                    $("body").one("click", function() {
                        layer.close(index);
                    });
                } else if (opt.autohide) {
                    $target.on("mouseleave", function() {
                        layer.close(index);
                    });
                }
            }
        });
    };

    exports.tooltip = function($target, opt) {
        layerid = layer.tips(opt.title, $target, {
            time: 10000,
            tips: 1,
            success: function($container, index) {
                var width = $container.width();
                var left = parseInt($container.css("left"));
                $container.css("left", left - width / 2 + 16);
                $container.hide();
                $container.fadeIn('slow');
            }
        });
    };
    exports.dialog = function(opt) {
        return layer.open({
            type: 1,
            title: [opt.title || '标题', 'border-bottom:1px solid #e9eef4;'],
            area: opt.area || ['800px', '630px'],
            content: opt.content,
            success: function($container, index) {
                opt.success && opt.success($container, index);
            },
            btn: ['确定', '取消'],
            yes: function(index, $container) {
                opt.ok && opt.ok($container, index);
            },
            cancel: function(index, $container) {
                opt.no && opt.no($container, index);
            },
        });
    };

    exports.dropdown = function($target, config) {
        /**
         * config
         *   searchable
         *   dropdown 1为下0为上
         *   data 数据{name value py}
         *   pinyin 1为启用
         */

        function DropDown() {

        }
        DropDown.prototype = {

        };
        return new DropDown();
    };
    exports.alert = function(config) {
        layer.open({
            type: 1,
            title: [config.title || '温馨提示', 'border-bottom:1px solid #e9eef4;'],
            closeBtn: 1,
            shadeClose: true,
            area: ['660px', 'auto'],
            content: '<div class="pop-body no-tb-p">' +
                '<div class="alert">' +
                '<div class="alert-left">' +
                '<i class="icon icon-warning-xs"></i><strong class="text-title">提示：</strong>' +
                '</div>' +
                '<div class="alert-content">' +
                config.content +
                '</div>' +
                '</div>' +
                '</div>',
            btn: ['确定'],
            end: function() {
                config.callback && config.callback();
            }
        })
    }

    exports.confirm = function(config) {
        return layer.open({
            type: 1,
            title: [config.title || '温馨提示', 'border-bottom:1px solid #e9eef4;'],
            closeBtn: false,
            shadeClose: false,
            area: ['660px', 'auto'],
            content: '<div class="pop-body no-tb-p">' +
                '<div class="alert" style="margin:40px 0">' +
                '<p class="text-center">' +
                config.content +
                '</p>' +
                '</div>' +
                '</div>',
            btn: config.btn || ['确定', '取消'],
            yes: function() {
                config.ok && config.ok();
            },
            cancel: function() {
                config.no && config.no();
            }
        })
    }
});