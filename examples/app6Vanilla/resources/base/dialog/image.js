define(function (require, modules, exports) {
    let VisualChinaComponent = require('base/component/visualChina/Index');
    let api = require('base/api/image');
    let omtemplate = require('base/dialog/template');

    let uploader; // 上传操作手柄
    let layerId;
    let selectedData = {};
    let limit300 = false;
    let onlineImage;


    let uploadImage;


    let visualChinaImage;
    let acceptExtensions = '';
    let isNewImgCopyrightWhiteList = (typeof g_userStatus !== 'undefined') && window.g_userStatus.isNewImgCopyrightWhiteList;
    const vcg_charge = (typeof window.g_userStatus !== 'undefined') && window.g_userStatus.vcg_charge;
    console.log('base.image vcg_charge isNewImgCopyrightWhiteList: ', vcg_charge, isNewImgCopyrightWhiteList);

    let lang = {
        'uploadSelectFile': '点击选择图片',
        'uploadAddFile': '继续添加',
        'uploadStart': '开始上传',
        'uploadPause': '暂停上传',
        'uploadContinue': '继续上传',
        'uploadRetry': '重试上传',
        'uploadDelete': '删除',
        'uploadTurnLeft': '向左旋转',
        'uploadTurnRight': '向右旋转',
        'uploadPreview': '',
        'uploadNoPreview': '不能预览',
        'updateStatusReady': '选中_张图片，共_KB。',
        'updateStatusConfirm': '已成功上传_张照片，_张照片上传失败',
        'updateStatusFinish': '共_张（_KB），_张上传成功',
        'updateStatusError': '，_张上传失败。',
        'errorNotSupport': 'WebUploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器。',
        'errorLoadConfig': '后端配置项没有正常加载，上传插件不能正常使用！',
        'errorExceedSize': '文件过大',
        'errorFileType': '文件格式不允许',
        'errorInterrupt': '文件传输中断',
        'errorUploadRetry': '上传失败，请重试',
        'errorHttp': 'http请求错误',
        'errorServerUpload': '服务器返回出错',
        'remoteLockError': '宽高不正确,不能所定比例',
        'numError': '请输入正确的长度或者宽度值！例如：123，400',
        'imageUrlError': '不允许的图片格式或者图片域！',
        'imageLoadError': '图片加载失败！请检查链接地址或网络状态！',
        'searchRemind': '请输入搜索关键词',
        'searchLoading': '图片加载中，请稍后……',
        'searchRetry': ' :( ，抱歉，没有找到图片！请重试一次！'
    };

    let DialogImage = function (params) {
        this.config = {
            reportData: {
                subModule: 'normal_zhengwen' // 添加来源：默认是普通正文上传，有新的上传业务请联系leozhengliu(刘峥)协议上传来源
            },
            limit300: false
        };
        $.extend(true, this.config, params);

        limit300 = this.config.limit300;
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
        show: function (callback, isShortContent) {
            let _this = this;
            layerId = layer.open({
                type: 1,
                title: '插入图片',
                content: omtemplate('art-dialog-image', {
                    limit300: _this.config.limit300,
                    isNewImgCopyrightWhiteList: isNewImgCopyrightWhiteList,
                    vcg_charge: vcg_charge,
                    isShowRedDot: window.isShowRedDot === '1', // && $('ul.tab li[data-id="normal"]').hasClass('active')
                    isShortContent,
                }),
                move: false,
                area: ['800px', '614px'],
                btn: [
                    '确定',
                    '取消'
                ],
                success: function ($container, index) {

                    $container.find('.layui-layer-content').css('overflow', 'hidden');
                    acceptExtensions = _this.config.acceptExtensions || 'png,jpg,jpeg,gif,bmp,webp';

                    selectedData = {};
                    uploadImage = new UploadImage($container.find("[data-content='form']"), _this.config.reportData);
                    onlineImage = new OnlineImage($container.find("[data-content='list']"), isShortContent);
                    /* 视觉中国初始化开始 */
                    visualChinaImage = new VisualChinaComponent({
                        wrap: $container.find("[data-content='visualChina']"),
                        showType: 'scroll',
                        isShortContent
                    });
                    visualChinaImage.init();
                    /* 视觉中国初始化结束 */
                    initTabs($container);

                    if (_this.config.success) {
                        _this.config.success($container);
                    }
                    initGuildPage();

                },
                yes: function (index, $container) {
                    newOMReport(31200, 3, 'click');
                    let data = [];
                    let tabType = 'list';
                    // eslint-disable-next-line
                    $container.find('[data-id]').filter(function () {
                        let $this = $(this);
                        if ($this.hasClass('active')) {
                            tabType = $this.attr('data-id');
                        }
                    });
                    switch (tabType) {
                        case 'form':
                            data = uploadImage.getInsertList();
                            if (uploadImage.getQueueCount() > 0) {
                                layer.msg('图片上传处理中');
                                newOMReport(31200, 5, 'click_fail');
                                return;
                            }
                            if (data.filter(function (e) {
                                return !e;
                            }).length > 0) {
                                layer.msg('图片上传处理中');
                                newOMReport(31200, 5, 'click_fail');
                                return;
                            } else if (!data || data.length == 0) { return layer.msg('未选择任何图片') }
                            break;
                        case 'list':
                            data = onlineImage.getInsertList();
                            if (!data || data.length == 0) return layer.msg('未选择任何图片');
                            break;
                        case 'visualChina':
                            // eslint-disable-next-line
                            let dataDfd = visualChinaImage.getData();
                            if (!dataDfd.noPic) { // 选中了图片，且图片有效
                                if (dataDfd.left == 0) {
                                    layer.msg('高级图库图片本月已用完');
                                    newOMReport(31200, 5, 'click_fail');
                                    return;
                                }
                                layer.msg('图片处理中,请耐心等待');
                                dataDfd.progress(function (visualChinaImgData) {
                                    console.log('visualChinaData', visualChinaImgData);
                                    if (visualChinaImgData) { // 如果视觉中国图片上传到素材库成功
                                        callback && callback([{
                                            src: visualChinaImgData.size[641].imgurl,
                                            src0: visualChinaImgData.size[0] && visualChinaImgData.size[0].imgurl,
                                            src640: visualChinaImgData.size[640] && visualChinaImgData.size[640].imgurl,
                                            src641: visualChinaImgData.size[641] && visualChinaImgData.size[641].imgurl,
                                            src1000: visualChinaImgData.size[1000] && visualChinaImgData.size[1000].imgurl,
                                            title: visualChinaImgData.info.title,
                                            copyright: (isNewImgCopyrightWhiteList || !vcg_charge) ? 0 : visualChinaImgData.copyright // 在白名单中或者未转正的都不显示 付费版权图标签
                                        }]);
                                        layer.closeAll('dialog');
                                    } else {
                                        layer.msg('图片加载失败');
                                    }
                                });
                            } else { return layer.msg('未选择任何图片') }
                            // return ;//已经在回调里面处理了这里直接return
                            break;
                    }
                    data = data.filter(function (e) {
                        return !!e.src;
                    });
                    // 图片检测
                    if (isNewImgCopyrightWhiteList) {
                        callback && callback(data);
                    } else {
                        let uncheckCopyrightImgs = [];
                        $.each(data, function (index, d) {
                            // if (typeof d.copyright !== 'undefind' && d.copyright === '-1') {
                            // uncheckCopyrightImgs.push(d.src)
                            // }
                            if (d.copyright === '-1') {     // by chuangwang fixed codecc error 2018-12-28
                                uncheckCopyrightImgs.push(d.src);
                            }
                        });
                        if (uncheckCopyrightImgs.length) {
                            api.checkImageCopyright(uncheckCopyrightImgs.join(',')).then(function (copyrightData) {
                                $.each(data, function (index, d) {
                                    if (copyrightData.data[d.src]) {
                                        data[index].copyright = copyrightData.data[d.src].is_copyright;
                                    }
                                });
                                callback && callback(data);
                            });
                        } else {
                            callback && callback(data);
                        }
                    }


                },
                end: function () { }
            });
        },
        hide: function () {
            layer.close(layerId);
        }
    };

    function initTabs($container) {
        $container.on('click', '.tab>li', function (event) {
            $container.find('.tab>li').removeClass('active');
            $container.find('[data-content]').hide();
            $container.find("[data-content='" + $(this).data('id') + "']").show();
            $(this).addClass('active');
            switch ($(this).attr('data-id')) {
                case 'form':
                    break;
                case 'list':
                    onlineImage.reset();
                    break;
                case 'visualChina':
                    visualChinaImage.render();
                    visualChinaImage.getVCGPicMonthLeftData().then(function (resp) { // 拉取会员图片个数成功后重新渲染
                        visualChinaImage.render();
                    });
                    break;
            }
        });

        $container.find('[data-id="form"]').addClass('active');
        $container.find('[data-content="form"]').show();

        $container.find('[data-id="list"],[data-id="visualChina"]').removeClass('active');
        $container.find('[data-content="list"],[data-content="visualChina"]').hide();
    }

    /* 上传图片 */
    function UploadImage(target, reportData) {
        this.reportData = reportData || {};
        this.$wrap = target.constructor == String ? $('#' + target) : $(target);
        this.init();
    }
    /* 热点图库引导页 */
    function initGuildPage() {
        if (window.isShowGuildPage === '0') { // 不显示引导页
            return;
        } else if (window.isShowGuildPage === '1' && window.location.pathname === '/article/articlePublish') {
            setTimeout(function () {
                let tempHtml = omtemplate('art-publish-guide-visualchina', {});
                $('body').append(tempHtml);
                $('.layer-guide').css('display', 'block');
                let originalGallery = $("li[data-id='visualChina']");
                elemOffset(originalGallery, '.pop-guide1-imgs');

                function elemOffset(elem, guide) {
                    let left = 0;


                    let top = 0;
                    let temp = elem.offset();
                    left = temp.left - $(document).scrollLeft();
                    top = temp.top - $(document).scrollTop();
                    $(guide).css({
                        'top': top + 'px',
                        'left': left - 17 + 'px'
                    });
                }
                $(window).resize(function () {
                    elemOffset(originalGallery, '.pop-guide1-imgs');

                });
                $('.layer-guide').click(function (e) {
                    $(this).hide();
                    window.isShowGuildPage = '0';
                });
                $('.pop-guide1-imgs').click(function (e) {
                    e.stopPropagation();
                    $('.layer-guide').hide();
                    window.isShowGuildPage = '0';
                    originalGallery.click();
                });
            }, 0);
        }
    }
    UploadImage.prototype = {
        init: function () {
            this.imageList = [];
            this.initContainer();
            this.initUploader();
        },
        initContainer: function () {
            this.$queue = this.$wrap.find('.filelist');
        },
        /* 初始化容器 */
        initUploader: function () {
            let _this = this;


            let $ = jQuery;
            // just in case. Make sure it's not an other libaray.

            let $wrap = _this.$wrap;

            // 图片容器

            let $queue = $wrap.find('.filelist');

            // 状态栏，包括进度和控制按钮

            let $processBar = $wrap.find('.processBar');

            // 文件总体选择信息。

            let $info = $processBar.find('.info');

            // 上传按钮
            // 上传按钮

            let $filePickerBlock = $wrap.find('.filePickerBlock');

            // 没选择文件之前的内容。
            // $placeHolder = $wrap.find('.placeholder'),
            // 总体进度条

            let $progress = $processBar;

            // 添加的文件数量

            let fileCount = 0;

            // 添加的文件总大小

            let fileSize = 0;

            // 优化retina, 在retina下这个值是2

            let ratio = window.devicePixelRatio || 1;


            // 可能有pedding, ready, uploading, confirm, done.

            let state = '';

            // 所有文件的进度信息，key为file id

            let percentages = {};

            // WebUploader实例

            let uploader;

            if (!window.WebUploader.Uploader.support()) {
                $('#filePickerReady').after($('<div>').html('上传插件未安装')).hide();
                return;
            }

            uploader = _this.uploader = window.WebUploader.create({
                disableGlobalDnd: true,
                fileNumLimit: 100000, // 上传个数设置为10万来表示无限上传
                threads: 5,

                auto: true,
                timeout: 60000,
                pick: {
                    id: '#filePickerBtn',
                    multiple: true
                },
                accept: {
                    title: 'Images',
                    extensions: acceptExtensions,
                    mimeTypes: 'image/jpg,image/jpeg,image/png' + (acceptExtensions.indexOf('gif') < 0 ? '' : ',image/gif')
                },
                swf: '//om.gtimg.cn/om/om_2.0/libs/webuploader/Uploader.swf',
                server: '/image/archscaleupload?isRetImgAttr=1&relogin=1',
                fileVal: 'Filedata',
                formData: _this.reportData,
                duplicate: true,
                compress: false
            });

            if (!((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0))) {
                uploader.addButton({
                    id: '#filePickerReady'
                });
            } else {
                $('#queueList').show();
                limit300 && $('#upload-limit-tips').show();
                $('#upload-image-init').hide();
                $('#filePickerBtn').parents('li').append('<div class="upload-cover-desc"><p class="help-block">支持5M以内jpg、png、gif</p></div>');
            }

            setTimeout(function () {
                $('#filePickerBtn>.webuploader-pick').siblings().css({
                    width: '100%',
                    height: '100%'
                });
            }, 1000);

            setState('pedding');

            // // 当有文件添加进来时执行，负责view的创建
            function addFile(file) {
                $('#queueList').show();
                limit300 && $('#upload-limit-tips').show();
                $('#upload-image-init').hide();
                // 留心标签闭合关系，不严谨的闭合会导致IE8 执行异常
                let $li = $('<li id="' + file.id + '">' +
                    '<div class="upload-cover-block">' +
                    '<div class="img-pay-copyright" style="display:none"><i class="icon icon-pay"  namecopyright3="{{copyright}}"></i>付费版权图片</div>' +
                    '<span class="pic">' +
                    '<img src="//om.gtimg.cn/om/om_2.0/images/cover_default_150x120.png"/>' +
                    '</span>' +
                    '<div class="upload-mask"><em class="base"></em><em class="item-progress" style="width:0%;"></em><em class="percent"></em></div>' +
                    '</div>' +
                    '<div class="upload-cover-desc"><p>' + file.name.replace(/(\.jpg)|(\.png)|(\.gif)|(\.bmp)$/i, '') + '</p></div>' +
                    '</li>');



                let $progress = $li.find('div.upload-mask em');


                let $wrap = $li.find('span.pic');


                let $info = $('<p class="error"></p>').hide().appendTo($li);

                let text;

                let showError = function (code) {
                    switch (code) {
                        case 'exceed_size':
                            text = lang.errorExceedSize;
                            break;
                        case 'interrupt':
                            text = lang.errorInterrupt;
                            break;
                        case 'http':
                            text = lang.errorHttp;
                            break;
                        case 'not_allow_type':
                            text = lang.errorFileType;
                            break;
                        default:
                            text = lang.errorUploadRetry;
                            break;
                    }
                    $li.find('.upload-mask').html('<em class="error">' + text + '</em>');
                };

                if (file.getStatus() === 'invalid') {
                    showError(file.statusText);
                    return;
                } else {
                    // $wrap.text(lang.uploadPreview);
                    // 处于性能考虑 不再生成缩略图
                    // 产品想要不晃动，缩略图大小取消

                    // if (browser.ie && browser.version <= 7) {
                    //     $wrap.text(lang.uploadNoPreview);
                    // } else {
                    //     uploader.makeThumb(file, function(error, src) {
                    //         if (error || !src) {
                    //             $wrap.text(lang.uploadNoPreview);
                    //         } else {
                    //             var $img = $('<img src="' + src + '">');
                    //             $wrap.empty().append($img);
                    //         }
                    //     }, 1, 1);
                    // }
                    percentages[file.id] = [file.size, 0];
                    file.rotation = 0;

                    /* 检查文件格式 */
                    if (!file.ext || acceptExtensions.indexOf(file.ext.toLowerCase()) == -1) {
                        showError('not_allow_type');
                        uploader.removeFile(file);
                    }
                    // 文件大小限制
                    if (file.size > 5 * 1024 * 1024) {
                        showError('exceed_size');
                        uploader.removeFile(file);
                    }
                }

                file.on('statuschange', function (cur, prev) {
                    if (prev === 'progress') {
                        //
                    } else if (prev === 'queued') {
                        $li.off('mouseenter mouseleave');
                    }
                    // 成功
                    if (cur === 'error' || cur === 'invalid') {
                        showError(file.statusText);
                        percentages[file.id][1] = 1;
                    } else if (cur === 'interrupt') {
                        showError('interrupt');
                    } else if (cur === 'queued') {
                        percentages[file.id][1] = 0;
                    } else if (cur === 'progress') {
                        $info.hide();
                        $progress.css('display', 'block');
                    } else if (cur === 'complete') {
                        //
                    }

                    $li.removeClass('state-' + prev).addClass('state-' + cur);
                });

                $li.insertBefore($filePickerBlock);
            }

            // // 负责view的销毁
            function removeFile(file) {
                let $li = $('#' + file.id);
                delete percentages[file.id];
                updateTotalProgress();
                $li.off().find('.file-panel').off().end().remove();
            }

            function updateTotalProgress() {
                let loaded = 0;


                let total = 0;


                let spans = $progress.children();


                let percent;

                $.each(percentages, function (k, v) {
                    total += v[0];
                    loaded += v[0] * v[1];
                });

                percent = total ? loaded / total : 0;

                $('#process-total').css('width', Math.round(percent * 100) + '%');
                updateStatus();
            }

            function setState(val, files) {
                if (val != state) {
                    let stats = uploader.getStats();
                    switch (val) {
                        /* 未选择文件 */
                        case 'pedding':
                            $queue.addClass('element-invisible');
                            $info.hide();
                            uploader.refresh();
                            break;

                        /* 可以开始上传 */
                        case 'ready':
                            window.eClass('element-invisible');
                            // $progress.hide();
                            $info.show();
                            uploader.refresh();
                            break;

                        /* 上传中 */
                        case 'uploading':
                            $progress.show();
                            $info.hide();
                            break;

                        /* 暂停上传 */
                        case 'paused':
                            $progress.show();
                            $info.hide();
                            break;

                        case 'confirm':
                            $progress.show();
                            $info.hide();
                            stats = uploader.getStats();
                            if (stats.successNum && !stats.uploadFailNum) {
                                setState('finish');
                                return;
                            }
                            break;

                        case 'finish':
                            $info.show();

                            break;
                    }
                    state = val;
                    updateStatus();
                }
            }

            function updateStatus() {
                let text = '';


                let stats = {};
                if (state === 'ready') {
                    return;
                } else if (state === 'confirm') {
                    stats = uploader.getStats();
                } else {
                    stats = uploader.getStats();
                }
                $processBar.find('em').html(stats.successNum + '/' + fileCount);
            }

            uploader.on('fileQueued', function (file) {
                fileCount++;
                fileSize += file.size;
                addFile(file);
            });

            uploader.on('fileDequeued', function (file) {
                fileCount--;
                fileSize -= file.size;
                removeFile(file);
                updateTotalProgress();
            });

            uploader.on('filesQueued', function (file) {
                if (!uploader.isInProgress() && (state == 'pedding' || state == 'finish' || state == 'confirm' || state == 'ready')) {
                    // setState('ready');
                    setState('uploading');
                    uploader.upload();
                }
                updateTotalProgress();
            });

            uploader.on('all', function (type, files) {
                switch (type) {
                    case 'uploadFinished':
                        setState('confirm', files);
                        break;
                    case 'startUpload':
                        /* 添加额外的GET参数 */
                        setState('uploading', files);
                        break;
                    case 'stopUpload':
                        setState('paused', files);
                        break;
                }
            });

            uploader.on('uploadBeforeSend', function (file, data, header) {
                data.Filename = data.name;
                data.Filedata = data.file;
                try {
                    delete data.size;
                } catch (e) { }
            });

            uploader.on('uploadProgress', function (file, percentage) {
                let $li = $('#' + file.id);


                let $progress = $li.find('.upload-mask .item-progress');


                let $percent = $li.find('.upload-mask .percent');

                $progress.css('width', percentage * 100 + '%');
                $percent.html((percentage == 1 ? '处理中<i class="icon-loader"></i>' : (Math.round(percentage * 100)) + '%'));

                percentages[file.id][1] = percentage;
                updateTotalProgress();
            });

            uploader.on('uploadSuccess', function (file, ret) {
                let $file = $('#' + file.id);


                let $progress = $file.find('.upload-mask .item-progress');


                let $percent = $file.find('.upload-mask .percent');
                try {
                    let responseText = (ret._raw || ret);


                    let json = utils.str2json(responseText);

                    if (json.response.code == 0) {
                        let url;
                        let oriInfo = ret.data.url.size[0];
                        if (ret.data.url.type == '1') {
                            url = oriInfo.imgurl;
                        } else {
                            url = ret.data.url.size[641].imgurl;
                        }

                        let data = {
                            url: url
                        };
                        // 顺序乱了
                        _this.imageList.push(data);
                        $file.attr('data-copyright', ret.data.url.copyright);
                        $file.attr('data-isqrcode', ret.data.url.isqrcode);
                        $file.attr('data-src0', ret.data.url.size && ret.data.url.size[0] && ret.data.url.size[0].imgurl);
                        $file.attr('data-src640', ret.data.url.size && ret.data.url.size[640] && ret.data.url.size[640].imgurl);
                        $file.attr('data-src641', ret.data.url.size && ret.data.url.size[641] && ret.data.url.size[641].imgurl);
                        $file.attr('data-src1000', ret.data.url.size && ret.data.url.size[1000] && ret.data.url.size[1000].imgurl);
                        if (ret.data.url.copyright === 1 && !isNewImgCopyrightWhiteList && vcg_charge) {
                            $file.find('.img-pay-copyright').show();
                        }

                        $progress.css('width', '100%');
                        if (limit300 && (oriInfo.width < 300 || oriInfo.height < 300)) {
                            $file.find('.upload-mask').html('<em class="error">图片尺寸过小</em>');
                            $file.removeClass('state-complete');
                            return;
                        }

                        $file.find('span.pic').empty().append('<img src="' + data.url + '"/>');

                        $percent.html('上传成功');
                        $file.append('<span class="success"></span>');
                    } else {
                        $percent.html('上传失败');
                        // $file.find('.error').text("上传失败").show();
                    }
                } catch (e) {
                    $percent.html('上传失败');
                    // $file.find('.error').text("上传失败").show();
                }
            });

            uploader.on('uploadError', function (file, code) { });
            uploader.on('error', function (code, file) {
                if (code == 'Q_TYPE_DENIED' || code == 'F_EXCEED_SIZE') {
                    addFile(file);
                }
            });
            uploader.on('uploadComplete', function (file, ret) { });

            updateTotalProgress();
        },

        getQueueCount: function () {
            let file; let i; let status; let readyFile = 0;


            let files = this.uploader.getFiles();
            // eslint-disable-next-line
            for (i = 0; file = files[i++];) {
                status = file.getStatus();
                if (status == 'queued' || status == 'uploading' || status == 'progress') readyFile++;
            }
            return readyFile;
        },

        destroy: function () {
            this.$wrap.remove();
        },

        getInsertList: function () {
            let i;
            let data;
            let list = [];

            this.$wrap.find('li.state-complete').each(function () {
                let url = $(this).find('span.pic>img').attr('src');
                let title = $(this).find('.upload-cover-desc').text();
                let copyright = $(this).attr('data-copyright');
                let isqrcode = $(this).attr('data-isqrcode');
                let src0 = $(this).attr('data-src0');
                let src640 = $(this).attr('data-src640');
                let src641 = $(this).attr('data-src641');
                let src1000 = $(this).attr('data-src1000');
                list.push({
                    src: url,
                    title: title,
                    alt: title,
                    copyright: copyright,
                    isqrcode: isqrcode,
                    src0,
                    src640,
                    src641,
                    src1000,
                });
            });
            return list;
        }
    };


    /* 在线图片 */
    function OnlineImage(target, isShortContent) {
        this.$wrap = utils.isString(target) ? document.getElementById(target) : target;
        this.init();
        this.isShortContent = isShortContent;
    }
    OnlineImage.prototype = {
        init: function () {
            this.reset();
            this.initEvents();
        },
        /* 初始化容器 */
        initContainer: function () {
            // this.$wrap.html("<ul></ul>");
            this.$wrap.find('.upload-cover-list').empty();
        },
        /* 初始化滚动事件,滚动到底部自动拉取数据 */
        initEvents: function () {
            let _this = this;
            /* 滚动拉取图片 */
            this.$wrap.find('ul').on('scroll', function (e) {

                let panel = this;
                if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                    _this.getImageData();
                }
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            /* 选中图片 */
            this.$wrap.on('click', '.upload-cover-block', function (e) {
                if ($(this).hasClass('disable')) return;
                if ($(this).hasClass('forbid')) {
                    layer.msg('微动态暂不支持插入付费版权图', { time: 1000 });
                    return;
                }
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    // 需要删除数据
                } else {
                    $(this).addClass('active');
                }
            });
        },
        /* 初始化第一次的数据 */
        initData: function () {

            /* 拉取数据需要使用的值 */
            this.state = 0;
            this.listSize = 12;
            this.listIndex = 0;
            this.listEnd = false;
            this.pageNum = 0;
            /* 第一次拉取数据 */
            this.getImageData();
        },
        /* 重置界面 */
        reset: function () {
            this.initContainer();
            this.initData();
        },
        /* 向后台拉取图片列表数据 */
        getImageData: function () {
            let _this = this;

            if (!_this.listEnd && !this.isLoadingData) {
                this.isLoadingData = true;
                api.getImageList({
                    types: acceptExtensions || '', // 输出所有类型 包括动图
                    page: ++this.pageNum,
                    // page: parseInt(this.listIndex / 12) + 1
                })
                    .then(function (resp) {
                        let list = [];
                        let e;
                        // eslint-disable-next-line
                        for (let i = 0; e = resp.data.list[i++];) {

                            let imgurl = e.url;


                            let imgId = imgurl.split('/').reverse()[1];
                            if (imgId && parseInt(imgId) > 242143488) {
                                imgurl = imgurl.replace(/\/640$/, '/641');
                            } else {
                                imgurl = imgurl.replace(/\/640$/, '/0').replace('newsapp_bt', 'newsapp_match');
                            }
                            e.url = imgurl;

                            // 最小尺寸限制
                            if (limit300) {
                                e.limit300 = (e.width < 300 || e.height < 300);
                            }

                            list.push(e);
                        }

                        _this.pushData(list);
                        if (_this.listIndex == 0) {
                            if (list.length > 0) {
                                $('#image-list').show();
                                $('#image-empty').hide();
                            } else {
                                $('#image-list').hide();
                                $('#image-empty').show();
                            }
                        }

                        _this.listIndex = parseInt(_this.listIndex) + parseInt(resp.data.list.length);
                        if (resp.data.list.length < 12) {
                            // _this.listEnd = true;//修复无法滚动的bug http://tapd.oa.com/OMQQ/bugtrace/bugs/view?bug_id=1010116611065105199
                        }

                        if (_this.listIndex >= resp.data.total) { // 修复代码错误，原为resp.total
                            _this.listEnd = true;
                        }
                        _this.isLoadingData = false;
                    }).fail(function () {
                        _this.isLoadingData = false;
                    });
            }
        },
        /* 添加图片到列表界面上 */
        pushData: function (list) {
            if (list.length > 0) {
                $('#image-list').show();
                $('#image-empty').hide();

                let html = '';
                let e;
                // eslint-disable-next-line
                for (let i = 0; e = list[i++];) {
                    if (e.url) {
                        // console.log('base.image 插入图片 从素材中选择');
                        html += omtemplate('art-dialog-image-list-item', $.extend({}, e, { vcg_charge, isShortContent: this.isShortContent }));
                    }
                }
                this.$wrap.find('.upload-cover-list').append(html);
            } else {
                $('#image-list').hide();
                $('#image-empty').show();
            }
        },
        getInsertList: function () {
            let i; let lis = this.$wrap.find('.upload-cover-block.active');


            let list = [];

            for (i = 0; i < lis.length; i++) {
                let src = $(lis[i]).find('img').attr('src');
                let title = $(lis[i]).find('div.upload-cover-desc p').text();
                let copyright = $(lis[i]).attr('data-copyright');
                let isqrcode = $(lis[i]).attr('data-isqrcode');
                let src0 = $(lis[i]).attr('data-url0');
                let src640 = $(lis[i]).attr('data-url640');
                let src641 = $(lis[i]).attr('data-url641');
                let src1000 = $(lis[i]).attr('data-url1000');
                list.push({
                    src: src,
                    title: title,
                    copyright: copyright,
                    isqrcode: isqrcode,
                    src0,
                    src640,
                    src641,
                    src1000,
                });
            }
            return list;
        }
    };

    return DialogImage;
});