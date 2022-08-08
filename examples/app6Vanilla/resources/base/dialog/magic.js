define(function(require, exports, module) {
    var imageapi = require('base/api/image');
    var template = require('base/dialog/template');
    var imagemagic = require('base/component/imagemagic');

    function isDataUrl(url) {
        return /^data:image/.test(url);
    }

    exports.show = function(url) {
        return $.Deferred(function(dfd) {
            function dialog(base64Url) {
                layer.open({
                    type: 1,
                    title: ['图片美化', 'border-bottom:1px solid #e9eef4;'],
                    area: ['800px', '630px'],
                    content: template("art-dialog-magic", {}),
                    success: function($container, index) {
                        if ($(".layui-layer-shade").length > 1) {
                            $("#layui-layer-shade" + index).hide();
                        }


                        $container.find('#magic-preview').one("load", function() {
                            var self = this;
                            var base64Url = $(this).attr("src");
                            var $icon = $container.find(".icon-checkbox");
                            if ($icon.hasClass("checkbox-active")) {
                                imagemagic.trans(self);
                            }

                            $container.find(".ui-checkbox")
                                .off("click")
                                .on("click", function() {
                                    if ($icon.hasClass("checkbox-active")) {
                                        $icon.removeClass("checkbox-active");
                                        imagemagic.reset(self);
                                    } else {
                                        $icon.addClass("checkbox-active");
                                        imagemagic.trans(self);
                                    }
                                    return false;
                                });
                        });

                        $container.find('#magic-preview').attr("src", base64Url);
                        $container.find('#magic-origin').attr("src", base64Url);
                    },
                    btn: ['确定', '取消'],
                    yes: function(index, $container) {
                        var $icon = $container.find(".icon-checkbox");
                        if ($icon.hasClass("checkbox-active")) {
                            try {
                                OMReport({
                                    page: "article_publish",
                                    omfunction: "cover",
                                    module: "optimize_ok",
                                    event: "other"
                                });
                            } catch (e) {}
                            dfd.resolve($container.find('#magic-preview').attr("src"));
                        } else {
                            try {
                                OMReport({
                                    page: "article_publish",
                                    omfunction: "cover",
                                    module: "optimize_no",
                                    event: "other"
                                });
                            } catch (e) {}
                            dfd.resolve(url);
                        }
                        layer.close(index);
                    },

                    cancel: function(index) {
                        dfd.reject();
                        layer.close(index);
                    },
                    no: function() {
                        dfd.reject();
                    }
                });
            }

            if (!imagemagic.check()) {
                setTimeout(function() {
                    dfd.resolve(url);
                }, 1);
            } else {
                if (isDataUrl(url)) {
                    dialog(url);
                } else {
                    imageapi.getBase64(url)
                        .then(function(base64) {
                            dialog(base64);
                        })
                        .fail(function() {
                            setTimeout(function() {
                                dfd.resolve(url);
                            }, 1);
                        });
                }
            }
        }).promise();
    };
});