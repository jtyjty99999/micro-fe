define(function(require, modules, exports) {
    var api = require('base/api/article');
    var omtemplate = require('base/dialog/template');

    var layerId;
    var selectedData = {};

    var pageNum = 1,
        loading = false;

    var linkUrl = "",
        selectedText = "";

    var typeApi = {
        'om': 'getArticleHyperLinkList',
        'outlink': 'getOutLinkList',
        'gongyi': 'getDonationList'
    };
    var outlink = [];

    function updateText($input, text) {
        if (!text) {
            return;
        }
        $("#dialogLinkInput").show();
        $input.val(text);
        var inputLength = $input.val().replace(/(^\s*)|(\s*$)/g, "").replace(/[\u200B-\u200D\uFEFF]/g, '').length;
        if (inputLength > 40 || inputLength < 1) {
            $input.siblings('.count').addClass('error');
        } else {
            $input.siblings('.count').removeClass('error');
        }
        $input.siblings('.count').find('em').text(inputLength);
        $input.siblings('.placeholder').hide();
    }

    DialogLink = function(params) {
        var config = {};
        this.config = $.extend(true, config, params);
    };

    DialogLink.prototype = {
        show: function(callback, selectionText) {
            var _this = this;
            var overflow = $("body").css("overflow");
            $("body").css("overflow", "hidden");
            layerId = layer.open({
                type: 1,
                title: ['插入超链接'],
                content: omtemplate("art-dialog-link", {}),
                area: ['800px', '690px'],
                move: false,
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    loading = false;
                    pageNum = 1;
                    //数据初始化
                    if (selectionText) {
                        selectedText = selectionText;
                        updateText($("#linktitle"), selectionText)
                    } else {
                        selectedText = "";
                    }
                    if (window['isInGongyiWhiteList'] == '1') {
                        $("#linktab .tab li[rel='gongyi']").show();
                    }
                    if (window.g_userStatus.ad_outlink == '1') {
                        $("#linktab .tab li[rel='outlink']").show();
                    }
                    $("#linktitle").focus();
                    linkUrl = "";
                    initList($container);
                    if (_this.config.type == "outlink") {
                        $("#linktab .tab li[rel='outlink']").click();
                        $("#linktab").hide();
                    }
                },
                yes: function(index, $container) {
                    var data = {};
                    data = selectedData;
                    if ($("#linktab li.active").attr("rel") != "outlink") {
                        data.title = $("#linktitle").val();
                        if ($("#dialogLinkInput").is(':visible')) {
                            if (data.title.length === 0) {
                                layer.msg("超链接文本不能少于1个字");
                                return;
                            }
                            if (data.title.length > 40) {
                                layer.msg("超链接文本不能大于40个字");
                                return;
                            }
                            if (!/^http.*/.test(linkUrl)) {
                                layer.msg("未指定任何文章链接");
                                return;
                            }
                        }
                    }
                    data.link = linkUrl;

                    console.log(data);
                    callback && callback(data);
                    selectedData = {};
                },
                no: function(index, $container) {

                },
                end: function() {
                    $("body").css("overflow", overflow);
                    loading = false;
                    pageNum = 1;
                }
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };


    function initList($container) {
        $container.find(".null-loading").show();
        var kw;
        $list = $container.find('#con-normal tbody');
        $list.on("click", "a.btn", function() {
            $list.find("i.icon-ok-blue").hide();
            $list.find("a.btn").show();
            $("#dialogLinkInput").show();
            $(this).hide();
            $(this).siblings("i.icon-ok-blue").show();
            var data = $(this).parents("tr").data("article");
            //if (selectedText == "") {
            updateText($("#linktitle"), data.title || "")
            //}
            selectedData = data;
            linkUrl = data.url;
        });
        $("#con-outlink").on("click", "a.btn", function() {
            $("#con-outlink").find("i.icon-ok-blue").hide();
            $("#con-outlink").find("a.btn").show();
            $(this).hide();
            $(this).siblings("i.icon-ok-blue").show();
            var index = $(this).parents("tr").data("index");
            selectedData = outlink[index];
            linkUrl = outlink[index].url;
        });
        $("#linktab").on("click", ".tab li", function() {
            $(this).siblings("li").removeClass("active");
            $(this).addClass("active");
            pageNum = 1;
            $list.html('');
            $container.find(".null-mod").hide();
            $container.find(".null-loading").show();
            var type = $(this).attr('rel');
            $("#dialogLinkInput").hide();
            if (type == "outlink") {
                $("#con-outlink").show();
                $("#con-normal").hide();
                var html = omtemplate("art-dialog-link-outlink", { loading: false, list: [] })
                $("#con-outlink").html(html);

                api.getOutLinkList().then(function(resp) {
                    console.log(resp);
                    if (resp.response.code == 0) {
                        outlink = resp.data.list.map(function(e) {
                            return {
                                resourceid: e.resourceid,
                                title: e.name,
                                url: e.link,
                                endtime: e.endtime,
                                type: "outlink"
                            }
                        })
                        html = omtemplate("art-dialog-link-outlink", {
                            loading: false,
                            list: outlink
                        })
                    } else {
                        html = omtemplate("art-dialog-link-outlink", {
                            loading: false,
                            list: []
                        })
                    }
                    $("#con-outlink").html(html);
                })
            } else {
                $("#con-outlink").hide();
                $("#con-normal").show();
                loadData(type, pageNum, function(resp) {
                    $container.find(".null-loading").hide();
                    var list = resp.list || resp.data.articles || resp.data.list;
                    if (list.length == 0) {
                        $container.find(".null-mod").show();
                    } else {
                        $container.find(".insert-url-body").show();
                    }
                });
            }
        });

        $("#linktab").on("click", ".icon-clear", function() {
            $('#linktab .input-text').val('');
            $('#linktab .placeholder').show();
            $('#linktab .icon-clear').hide();
        });
        $("#linktab").on("click", ".btn", function() {
            pageNum = 1;
            $list.html('');
            $container.find(".null-mod").hide();
            $container.find(".null-loading").show();
            loadData($('#linktab .tab li.active').attr('rel'), pageNum, function(resp) {
                $container.find(".null-loading").hide();
                var list = resp.list || resp.data.articles || resp.data.list;
                if (list.length == 0) {
                    $container.find(".null-mod").show();
                } else {
                    $container.find(".insert-url-body").show();
                }
            });
        });
        $('#linktab .input-text').on("keydown keyup change", function() {
            if ($.trim($(this).val()).length > 0) {
                $('#linktab .icon-clear').show();
            } else {
                $('#linktab .icon-clear').hide();
            }
            $(this).siblings(".placeholder").hide();
        }).on("blur", function() {
            if ($(this).val().length > 0) return false;
            $(this).siblings(".placeholder").show();
        }).on("focus", function() {
            $(this).siblings(".placeholder").hide();
        });

        $("#linktitle").on("keydown keyup change", function() {
            $(this).siblings(".placeholder").hide();

            var inputLength = $(this).val().replace(/(^\s*)|(\s*$)/g, "").replace(/[\u200B-\u200D\uFEFF]/g, '').length;
            if (inputLength > 40 || inputLength < 1) {
                $(this).siblings('.count').addClass('error');
            } else {
                $(this).siblings('.count').removeClass('error');
            }
            $(this).siblings('.count').find('em').text(inputLength);
        }).on("blur", function() {
            if ($(this).val().length > 0) return false;
            $(this).siblings(".placeholder").show();
        }).on("focus", function() {
            $(this).siblings(".placeholder").hide();
        });

        function loadData(type, page, callback) {
            loading = true;
            api[typeApi[type]]({
                    curpage: page,
                    keyword: $.trim($('#linktab .input-text').val()),
                    perpage: 10
                })
                .then(function(resp) {
                    if (resp.response.code != 0) return;
                    callback && callback(resp);
                    var list = resp.list || resp.data.articles || resp.data.list || [];
                    for (var i = 0; e = list[i++];) {
                        e.datetime = e.pub_time;
                        e.source_cn = e.source_name || "未知来源";
                        var $item = $(omtemplate("art-dialog-link-list-item", e));
                        $item.data("article", e);
                        $list.append($item);
                    }

                    if (list.length < 10) {
                        pageNum = 0;
                    }
                    if (list.length == 0)
                        $("#dialogLinkInput").hide();
                    //                    else
                    //                        $("#dialogLinkInput").show();
                    loading = false;
                }).fail(function() {
                    loading = false;
                });
        }

        $container.find(".insert-url-body.scroll-theme").on('scroll', function(e) {
            var panel = this;
            if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                var type = $('#linktab .tab li.active').attr('rel');
                if (pageNum != 0 && !loading) {

                    loadData(type, ++pageNum);
                }
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        loadData('om', 1, function(resp) {
            $container.find(".null-loading").hide();
            var list = resp.list || resp.data.articles || resp.data.list;
            if (list.length == 0) {
                $container.find(".null-mod").show();
            } else {
                $container.find(".insert-url-body").show();
            }
        });
    }
    return DialogLink;
});