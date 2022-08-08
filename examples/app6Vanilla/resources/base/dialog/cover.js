define(function(require, modules, exports) {
    var visualChinaComponent = require('base/component/visualChina/Index');
    var UploadCropImageSimple = require('base/component/UploadCropImageSimple');
    var api = require('base/api/image');
    var magicDialog = require('base/dialog/magic');

    var omtemplate = require('base/dialog/template');
    var uploader; //上传操作手柄
    var layerId;
    var selectedData = {};
    var pageNum = 1,
        maxSelected = 1,
        loading = false,
        visualChinaImage;
    DialogCover = function(params) {
        this.config = {
            reportData: { //上报数据

            }
        };
        $.extend(true, this.config, params);
    };
    
    DialogCover.prototype = {
        show: function(callback, num) {
            var self = this;
            pageNum = 1;
            maxSelected = num || 1;
            $("body").css("overflow", "hidden");
            layerId = layer.open({
                type: 1,
                title: self.config.title || "上传封面",
                content: omtemplate("art-dialog-cover", {
                    isShowRedDot: window.isShowRedDot === '1' //&& $('ul.tab li[data-id="normal"]').hasClass('active')
                }),
                area: ['800px', '614px'],
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    selectedData = {};
                    initTabs($container);

                    initCrop($container, self);
                    initPage($container);
                    initVisualChina($container);
                    initGuildPage()
                },
                yes: function(index, $container) {
                    var visualChinaImageDfd;
                    var $btn = $container.find(".layui-layer-btn0");
                    $btn.addClass("btn-primary");
                    if ($btn.hasClass("btn-loading")) {
                        // 处理中 防止重复请求
                        return;
                    }

                    $btn.addClass("btn-loading").html('<i class="icon-loader"></i>处理中');
                    var data = {};
                    var isCrop = $container.find("[data-id='crop']").hasClass("active");
                    var type = self.config.type || "normal";
                    var opCode = self.config.opCode || "151";
                    var netapi, params, origin;

                    var $selected = $page.find(".upload-cover-block.active")
                    if (isCrop) {
                        if (!$container.find("[data-action='convas']>img").attr("src")) {
                            $btn.removeClass("btn-loading").html("确定");
                            layer.msg("未上传");
                            return;
                        }
                        params = uploader.getCropData();
                        params.opCode = opCode;
                        $.extend(true, params, self.config.reportData);
                        netapi = api.getCoverFromCrop;
                        origin = uploader.getOriginData();
                    } else if ($selected.length > 1) {
                        var res = [];
                        $selected.each(function() {
                            res.push(JSON.parse($(this).attr("data-info")));
                        });
                        callback && callback(res);
                        // 粗糙处理
                        // 不是太优雅
                        return;
                    } else if (selectedData.url0) {
                        params = {
                            url: selectedData.url0
                        };
                        params.opCode = opCode;
                        $.extend(true, params, self.config.reportData);
                        netapi = api.getCoverFromOrigin;
                    } else if ($container.find("[data-id='visualChina']").hasClass("active")) { //视觉中国的
                        params = {
                            url: '' //此时url还没有生成留空吧
                        };
                        params.opCode = opCode;
                        $.extend(true, params, self.config.reportData);
                        netapi = api.getCoverFromOrigin;
                        visualChinaImageDfd = visualChinaImage.getData();
                        if (!visualChinaImageDfd.noPic) { //选中了图片，且图片有效
                            if (visualChinaImageDfd.left == 0) {
                                layer.msg("高级图库图片本月已用完");
                                return;
                            }
                        } else {
                            layer.close(index)
                            return;
                        }
                    }



                    if (!isCrop && type == "coral") {
                        // 直接生成评论图片
                        if (selectedData.url0) {
                            api.getCoralFromURL({
                                url: selectedData.url0
                            }).then(function(resp) {
                                $btn.removeClass("btn-loading").html("确定");
                                if (resp.response.code == 0) {
                                    callback && callback(resp.data);
                                } else {
                                    layer.msg("请重试");
                                }
                            });
                            return;
                        } else {
                            layer.msg("请选择");
                            $btn.removeClass("btn-loading").html("确定");
                            return;
                        }
                    } else if (typeof netapi == "function") {
                        function process() {
                            try {
                                netapi(params)
                                    .then(function(resp) {
                                        if (resp.response.code == 0) {
                                            if (type == "coral") {
                                                api.getCoralFromURL({
                                                    url: resp.data["1"]
                                                }).then(function(resp) {
                                                    if (resp.response.code == 0) {
                                                        $btn.removeClass("btn-loading").html("确定");
                                                        callback && callback(resp.data);
                                                    } else {
                                                        layer.msg("请重试");
                                                        $btn.removeClass("btn-loading").html("确定");
                                                        return;
                                                    }
                                                });
                                            } else {
                                                $btn.removeClass("btn-loading").html("确定");
                                                callback && callback(resp.data);
                                            }

                                        } else {
                                            $btn.removeClass("btn-loading").html("确定");
                                            if (resp.response.code == -7003) {
                                                layer.msg("纯色图片不能使用")
                                            } else {
                                                layer.msg("接口出错" + resp.response.msg);
                                            }
                                            callback && callback({});
                                        }
                                    });
                            } catch (e) {}
                        }
                        if (!isCrop) {
                            if (visualChinaImageDfd) { //有visualChinaImageDfd说明是视觉中国的
                                if (!visualChinaImageDfd.noPic) { //选中了图片，且图片有效
                                    visualChinaImageDfd.progress(function(visualChinaImgData) {
                                        console.log('visualChinaData', visualChinaImgData);
                                        if (visualChinaImgData) { //如果视觉中国图片上传到素材库成功
                                            params.url = visualChinaImgData.size[0].imgurl;
                                            magicDialog.show(params.url)
                                                .then(function(url) {
                                                    params.url = url;
                                                    process();
                                                })
                                                .fail(function() {
                                                    layer.close(index);
                                                });
                                        } else {
                                            layer.msg("图片加载失败");
                                        }
                                    });
                                }
                            } else {
                                // 直接选择的
                                magicDialog.show(params.url)
                                    .then(function(url) {
                                        params.url = url;
                                        process();
                                    })
                                    .fail(function() {
                                        layer.close(index);
                                    });
                            }
                        } else {
                            // 上传的 
                            magicDialog.show(params.url)
                                .then(function(url) {
                                    if (params.url == url) {
                                        process();
                                    } else {
                                        params.url = url;
                                        console.log(origin);
                                        if (origin.width > 640) {
                                            joker = 640 / origin.width;
                                            params.cropX = joker * params.cropX;
                                            params.cropY = joker * params.cropY;
                                            params.cropWidth = joker * params.cropWidth;
                                            params.cropHeight = joker * params.cropHeight;
                                        }
                                        process();
                                    }
                                })
                                .fail(function() {
                                    layer.close(index);
                                });
                        }
                    } else {
                        $btn.removeClass("btn-loading").html("确定");
                        callback && callback({});
                    }
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

    function initTabs($container) {
        $container.on('click', '.tab>li', function(event) {
            var $this = $(this);
            var dataId = $this.data("id");
            $container.find(".tab>li").removeClass("active");
            $container.find("[data-content]").hide();
            $container.find("[data-content='" + dataId + "']").show();
            $this.addClass("active");
            pageNum = 1;
            switch (dataId) {
                case 'visualChina':
                    visualChinaImage.render();
                    visualChinaImage.getVCGPicMonthLeftData().then(function(resp) { //拉取会员图片个数成功后重新渲染
                        visualChinaImage.render();
                    });
                    break;
            }
        });

        $container.find('[data-id="page"]').addClass('active');
        $container.find('[data-content="page"]').show();

        $container.find('[data-id="crop"],[data-id="visualChina"]').removeClass('active');
        $container.find('[data-content="crop"],[data-content="visualChina"]').hide();

    }

    function initCrop($container, self) {
        var area = self.config.area;
        var cropHeight = area ? parseInt(180 * area[1] / area[0]) : (180 * 2 / 3);
        $container.find('[data-action="preview"]').css({
            height: cropHeight
        });
        uploader = new UploadCropImageSimple({
            box: $container.find('[data-action="convas"]>img').hide(),
            btn: $container.find('[data-action="upload"]'),
            preview: $container.find('[data-action="preview"]>img').hide(), //使用回调处理更合适
            // 预览目标
            cropWidth: 180,
            cropHeight: cropHeight,
            // 容器
            boxWidth: 381,
            boxHeight: 254,
            reportData: self.config.reportData
        });
    }

    function initVisualChina($container) {
        visualChinaImage = new visualChinaComponent({
            wrap: $container.find("[data-content='visualChina']"),
            showType: 'scroll'
        });
        visualChinaImage.init();
    }

    function initPage($container) {
        $page = $container.find('[data-content="page"]');

        $page.on('click', '.upload-cover-block', function(e) {
            if (maxSelected == 1) {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                    selectedData = {};
                } else {
                    $page.find(".upload-cover-block").removeClass("active");
                    $(this).addClass("active");
                    selectedData = JSON.parse($(this).attr("data-info"));
                }
            } else {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                } else {
                    $selected = $page.find(".upload-cover-block.active");
                    if ($selected.length == maxSelected) {
                        layer.msg("最多选" + maxSelected + "张");
                    } else {
                        $(this).addClass("active");
                        selectedData = JSON.parse($(this).attr("data-info"));
                    }
                }
            }
        });

        $page.find("ul").on('scroll', function(e) {
            var panel = this;
            if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                if (pageNum != 0 && !loading) {
                    loadData(++pageNum);
                }
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        function renderPage(data) {
            var html = omtemplate('dialog-cover-image', data);
            $page.html(html);

        }

        function loadData(page, callback) {
            loading = true;
            api.getImages({
                    page: page
                })
                .then(function(resp) {
                    callback && callback(resp);
                    var list = resp.data.list;
                    var html = "";
                    for (var i = 0, e; e = list[i++];) {
                        e.data = JSON.stringify(e);
                        html += omtemplate("art-dialog-cover-image-item", e);
                    };
                    // var html = list.map(function(e) {
                    //     e.data = JSON.stringify(e);
                    //     return omtemplate("art-dialog-cover-image-item", e);
                    // }).join("");
                    // 为了那些循环
                    if (list && list.length) {
                        $page.find('#image-empty').hide();
                        $page.find('.upload-cover-list').append(html).show();
                    } else {
                        $page.find('.upload-cover-list').hide();
                        $page.find('#image-empty').show();
                    }
                    if (list.length < 12) {
                        // pageNum = 0;//修复无法滚动的bug http://tapd.oa.com/OMQQ/bugtrace/bugs/view?bug_id=1010116611065105199
                    }
                    loading = false;
                }).fail(function() {
                    loading = false;
                });
        }

        loadData(1, function(resp) {
            var total = resp.data.total;
            var pageTotal = parseInt(total / 12) + ((total % 12 == 0) ? 0 : 1);
            if (pageTotal > 1) {

            } else {

            }
        });
    }

    /* 热点图库引导页 */
    function initGuildPage () {
        if (window.isShowGuildPage === '0') { //不显示引导页
            return
        } else if (window.isShowGuildPage === '1' && window.location.pathname==='/article/articlePublish'){
            setTimeout(function () {
                var tempHtml = omtemplate('art-publish-guide-visualchina', {})
                $('body').append(tempHtml);
                $('.layer-guide').css('display','block');
                var originalGallery = $("li[data-id='visualChina']");
                console.log(originalGallery)
                elemOffset(originalGallery, '.pop-guide1-imgs');
                function elemOffset(elem, guide) {
                    var left = 0, top = 0;
                    var temp = elem.offset()
                    left = temp.left - $(document).scrollLeft();
                    top = temp.top - $(document).scrollTop(); 
                    $(guide).css({
                        'top': top+"px",
                        'left': left-17+"px"
                    })      
                }
                $(window).resize(function(){
                    elemOffset(originalGallery, '.pop-guide1-imgs');
                 
                })
                $('.layer-guide').click(function(e){
                    $(this).hide();
                    window.isShowGuildPage = '0'
                })
                $(".pop-guide1-imgs").click(function(e){
                    e.stopPropagation();
                    $('.layer-guide').hide();
                    window.isShowGuildPage = '0'
                    originalGallery.click()
                })                                                        
            }, 0)
        }
    }

    return DialogCover;
});