//此文件为废弃文件--老中医勘察结果
define(function(require, modules, exports) {
    var api = require('base/api/article');
    var omtemplate = require('base/dialog/template');
    var tooltip = require('base/component/tooltip');
    var layerId;
    var iszzuser = window['iszzuser'];

    DialogOriginal = function(params) {
        var config = {};
        $.extend(true, config, params);
    };

    DialogOriginal.prototype = {
        show: function(callback) {
            var _this = this;
            $("body").css("overflow", "hidden");
            layerId = layer.open({
                type: 1,
                title: "原创声明",
                content: omtemplate("art-dialog-original", {iszzuser:iszzuser}),
                area: ['660px', '610px'],
                move: false,
                success: function($container, index) {
                    initContainer($container);
                    $container.on("click", "[data-action='confirm']", function() {
                        if (verify()) {
                            callback && callback(getData());
                        }
                    });

                    $container.on("click", "[data-action='cancel']", function() {
                        // 取消
                        layer.close(layerId);
                    });

                    tooltip('.tooltip-inlineblock','.tooltip', $container);
                },
                end: function() {
                    $("body").css("overflow", "auto");
                }
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };

    OriginalForm = function() {
        this.init();
    };
    OriginalForm.prototype = {
        init: function() {

        }
    };

    function verify() {
        var error = [];

        if ($('#infoNo').hasClass('radio-active')) { //选择了否

            if ($('#original_shoufa_platform').val() == '') {
                error.push("平台名称不得为空");
            }

            if ($('#original_shoufa_url').val() == '') {
                error.push("链接不得为空");
            } else {
                var re = new RegExp("[a-zA-z]+://[^s]*");
                if (!re.test($('#original_shoufa_url').val())) {
                    error.push("链接格式错误");
                }
            }

            if ($("#original_shoufa_author").val() == '') {
                error.push("作者不得为空");
            }
            if (error.length > 0) {
                layer.msg(error[0]);
            }
            return (error.length === 0);
        } else {
            return true;
        }
    }

    function getData() {
        var originalFlags = { //原创标签申请默认值
            Fshoufa_platform: "",
            Fshoufa_url: "",
            Fshoufa_title: "",
            Fshoufa_author: "",
            user_original: 0,
            Fshoufa_ref_allowed: 0
        };
        if ($('#infoNo').hasClass('radio-active')) {
            originalFlags.Fshoufa_platform = $("#original_shoufa_platform").val();
            originalFlags.Fshoufa_url = $("#original_shoufa_url").val();
            originalFlags.Fshoufa_author = $("#original_shoufa_author").val();
            originalFlags.user_original = 1;
        } else {
            originalFlags.user_original = 1;
        }

        if(iszzuser) {
            var zhuanzaiok = $('.zz-radio-group .radio-active').data().s
            if(zhuanzaiok === 'ok') {
                originalFlags.Fshoufa_ref_allowed = 1;
            } else {
                originalFlags.Fshoufa_ref_allowed = 0;
            }
        }

        return originalFlags;
    }

    function initContainer($container) {

        $container.find("#original-init").show();
        $container.find("#original-next").hide();
        $container.on("click", "[data-action='next']", function() {
            // 下一步
            $container.find("#original-init").hide();
            $container.find("#original-next").show();
        });

        $container.on("click", ".ui-radio", function() {
            // 下一步
            if ($(this).find(".icon-radio").hasClass("radio-active")) {
                // $(this).find(".icon-radio").removeClass("radio-active");
                // $(this).siblings().find(".icon-radio").addClass("radio-active");
            } else {
                $(this).find(".icon-radio").addClass("radio-active");
                $(this).siblings().find(".icon-radio").removeClass("radio-active");
            }

            $("#original_shoufa_url").val('');
            $("#original_shoufa_platform").val('');

            if ($('#infoNo').hasClass('radio-active')) {
                $("#original_shoufa_url").removeClass("disabled").prop("disabled", false);
                $("#original_shoufa_platform").removeClass("disabled").prop("disabled", false);

                $("#original_shoufa_url").siblings('.placeholder').html('该文在其他首发平台的文章地址').show();
                $("#original_shoufa_platform").siblings('.placeholder').html('其他首发平台名称').show();
            } else {
                $("#original_shoufa_url").addClass("disabled").prop("disabled", true);
                $("#original_shoufa_platform").addClass("disabled").prop("disabled", true);

                $("#original_shoufa_url").siblings('.placeholder').html('该文在腾讯内容开放平台的文章地址').show();
                $("#original_shoufa_platform").siblings('.placeholder').html('腾讯内容开放平台').show();
            }
            // 防止事件冒泡
            // 目前会触发多次
            return false;
        });

        var domainDB = '';
        var loopid = 0;
        $.ajax({
            url : "/staticdata/domain.js", //请确保UTF－8
            dataType: "text",
            success : function (data) {
                domainDB = data;
            }
        });

        $container.on('focus', '#original_shoufa_url', function() {
            var ele = $(this);
            var lastlink = ele.val();
            loopid = setInterval(function(){
                var link = ele.val();
                if(lastlink !== link) {
                    lastlink = link;
                    autoPlatform(link);
                }
            }, 500)
        }).on('blur', '#original_shoufa_url', function() {
            clearInterval(loopid);
        });


        function autoPlatform(link) {
            if(!domainDB) {
                return
            }
            var thedomain = '';
            var result = '';
            if(/^https?:\/\/[^/]*\//.test(link)) {
                result = link.match(/https?:\/\/([^.]*[.][^/]*).*/) || []
            } else if(/[^.]*[.][^/]*\/.*/.test(link)) {
                result = link.match(/([^.]*[.][^/]*).*/) || []
            }

            if(result && result[1]) {
                var reg = new RegExp('.*' + result[1] + '.*');
                var theMatchedline = domainDB.match(reg) || [];
                if(theMatchedline && theMatchedline[0]) {
                    thedomain = theMatchedline[0].replace(/(\S*).*/, '$1');
                }
            }


            if(thedomain) {
                $container.find('#original_shoufa_platform').val(thedomain);
                $container.find('#original_shoufa_platform + .placeholder').hide();
            } else {
                $container.find('#original_shoufa_platform').val('');
                $container.find('#original_shoufa_platform + .placeholder').show();
            }
        }


        $container.on("blur", "input", function() {
            if (!$(this).val()) {
                $(this).siblings(".placeholder").show();
            }
            return false;
        });

        $container.on("focus", "input", function() {
            $(this).siblings(".placeholder").hide();
            return false;
        });


        $("#original_shoufa_author").val(g_userInfo.nick);

        $("#original_shoufa_url").addClass("disabled").prop("disabled", true);
        $("#original_shoufa_platform").addClass("disabled").prop("disabled", true);
    }
    return DialogOriginal;
});
