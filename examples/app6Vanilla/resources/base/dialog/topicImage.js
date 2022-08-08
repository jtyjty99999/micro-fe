define(function (require, modules, exports) {
    let TopicImagesComponent = require('base/component/topicImages/Index');
    let omtemplate = require('base/dialog/template');
    let visualChinaApi = require('base/api/visualChina');
    let omlayer = require('layer/layer');
    let layerId;
    const isNewImgCopyrightWhiteList = typeof window.g_userStatus !== 'undefined' && window.g_userStatus.isNewImgCopyrightWhiteList;
    const vcg_charge = typeof window.g_userStatus !== 'undefined' && window.g_userStatus.vcg_charge;
    console.log('base.dialog.topicImage vcg_charge isNewImgCopyrightWhiteList: ', vcg_charge, isNewImgCopyrightWhiteList);

    const DialogImage = function (params) {
        this.config = {
            reportData: {}
        };
        $.extend(true, this.config, params);
    };
    function newOMReport(pageid, type = null, event) {
        try {
            window.newOMReport({
                pageid: pageid,
                type: type,
                event: event
            });
        } catch (e) {}
    }

    DialogImage.prototype = {

        // 监听事件
        handleCreateSubmit: function (callback) {
            const self = this;

            return function (target) {
                console.log('target: ', target);
                const $btn = $(target);
                if ($btn.hasClass('btn-loading')) {
                    // 处理中 防止重复请求
                    return;
                }

                console.log('1111111');

                $btn.addClass('btn-loading').html('<i class="icon-loader"></i>处理中');

                const imgData = self.topicImages.getData() || [];
                const imgNum = imgData.length;  // 选择的图片数
                let failLen = 0;       // 添加失败的个数
                let completeLen = 0;   // 用来标志请求已有response的个数
                let result = [];

                console.log(imgData);

                console.log('22222');

                if (!imgNum) {
                    layer.msg('未选择图片');
                    $btn.removeClass('btn-loading').html('创作组图');
                    return;
                }
                layer.msg('组图正在创建中');

                $.each(imgData, function (i, img) {
                    const addEach = function (_img) {
                        visualChinaApi.addVCGGroupPicToGallery({
                            vcgpicid: _img.res_id,
                            vcgpictitle: _img.caption
                        }).then(function (resp) {
                            completeLen++;

                            if (resp.response.code == 0) {
                                /* eslint-disable guard-for-in */
                                for (let key in resp.data) {
                                    if (key != 'vcgpicid') {
                                        result.push({
                                            src: resp.data[key].size[641].imgurl,
                                            title: _img.caption,
                                            source: 'topic',
                                            copyright: (isNewImgCopyrightWhiteList || !vcg_charge) ? 0 : _img.copyright,
                                        });
                                    }
                                    break;
                                }
                            } else {
                                failLen++;
                            }

                            if (completeLen === imgNum) { // 所有add请求已经完成
                                // 全部失败
                                if (failLen === imgNum) {
                                    newOMReport(31200, 8, 'click_fail');
                                    omlayer.msg('图片处理失败');
                                    $btn.html('创作组图').removeClass('btn-loading');
                                } else {
                                    newOMReport(31200, 7, 'click_suss');
                                    callback && callback(result);
                                }
                            }
                        }, function () {   // 请求失败
                            failLen++;
                            completeLen++;
                            newOMReport(31200, 8, 'click_fail');
                            if (completeLen === imgNum) { // 所有add请求已经完成
                                // 全部失败
                                if (failLen === imgNum) {
                                    omlayer.msg('图片处理失败');
                                    $btn.html('创作组图').removeClass('btn-loading');
                                } else {
                                    callback && callback(result);
                                }
                            }
                        });
                    };

                    addEach(img);
                });
            };
        },

        // 监听组图创作事件
        bindCreateClick: function(callback) {
            const self = this;
            $('body')
                .off('click', '#zutuCreateWrap', function () {
                    console.log('off click #zutuCreateWrap');
                })
                .on('click', '#zutuCreateWrap .createZutu', function() { self.handleCreateSubmit(callback)(this) });
        },

        // 展示选取图片组件，以普通列表页展示
        showPage: function(callback, options = {}) {
            const self = this;
            const $container = options.$container;  // 获取列表Dom的容器Dom
            $container.append(omtemplate('art-dialog-topicimage', { isPage: true }));

            self.topicImages = new TopicImagesComponent({
                wrap: $container.find("[data-content='topicImages']"),
                showType: 'topics',   // 展示界面类型  topics-专题列表  list--图片列表
                isPage: true
            });

            // 向viewpage中插入创建组图bottom
            $('.viewpage').append(omtemplate('zutu-create-fixed-bottom'));

            self.topicImages.init({
                onShowTypeChange: function(type) {  // 切换界面事件
                    if (type === 'topics') {
                        // hide footer dom
                        $('#zutuCreateWrap').hide();
                        $container.find('.specialPhotosList').attr('infinityScroll', true);
                    } else if (type === 'list') {
                        // show footer dom
                        $('#zutuCreateWrap').show();
                        $container.find('.specialPhotosList').removeAttr('infinityScroll');
                        self.bindCreateClick(callback);
                    }
                }
            });
        },

        // 展示选取图片组件，以对话框形式展示
        show: function (callback, options) {
            const _this = this;
            layerId = layer.open({
                type: 1,
                title: ['选取图片'],
                content: omtemplate('art-dialog-topicimage', {}),
                move: false,
                area: ['820px', '740px;'],
                btn: ['创作组图', '取消'],
                success: function ($container, index) {
                    $container.find('.layui-layer-btn').hide();

                    _this.topicImages = new TopicImagesComponent({
                        wrap: $container.find("[data-content='topicImages']")
                    });
                    _this.topicImages.init({
                        onShowTypeChange: function (type) {
                            if (type === 'topics') {
                                $container.find('.layui-layer-btn').hide();
                                $container.find('.specialPhotosList').attr('infinityScroll');
                            } else {
                                $container.find('.layui-layer-btn').show();
                                $container.find('.specialPhotosList').removeAttr('infinityScroll');
                            }
                        }
                    });

                    if (_this.config.success) {
                        _this.config.success($container);
                    }
                },
                yes: function (index, $container) {
                    newOMReport(31200, 6, 'click');
                    _this.handleCreateSubmit(callback)($container.find('.layui-layer-btn0'));
                },
                end: function () { }
            });
        },
        createArt: function () {

        },
        hide: function () {
            layer.close(layerId);
        }
    };

    function initTabs($container) {

    }


    return DialogImage;
});
