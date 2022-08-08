define(function(require, modules, exports) {
    let VisualChinaComponent = require('base/component/visualChina/Index');
    let api = require('base/api/image');
    let omtemplate = require('base/dialog/template');

    let uploader; // 上传操作手柄
    let layerId;
    let maxSelected = 100;
    let maxPicNum = 100;  // 最大输出图片个数，可在组件打开(show)时改写
    let selectedData = {};
    let currentFileNum = 0;
    let currentFileId = '';
    let currentUploaded = 0;
    let uploadImageInstance;
    let hasError = false;

    let onlineImage;


    let uploadImage;


    let visualChinaImage;
    let acceptExtensions = '';
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
        'uploadPreview': '预览中',
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
        'searchRetry': ' :( ，抱歉，没有找到图片！请重试一次！',
        'onlyOne': '一次只能发布一张图片'
    };

    let DialogImage = function(params) {
        this.config = {
            reportData: {
                subModule: 'wenda_zhengwen'// 添加来源：默认是问答正文上传，有新的上传业务请联系leozhengliu(刘峥)协议上传来源
            }
        };
        $.extend(true, this.config, params);
    };

    DialogImage.prototype = {
        show: function(callback, options) {
            let _this = this;

            if (options && options.maxnum) {
                maxPicNum = options.maxnum;
            }

            layerId = layer.open({
                type: 1,
                title: '插入图片',
                content: omtemplate('art-dialog-image', {}),
                move: false,
                area: ['800px', '614px;'],
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    acceptExtensions = _this.config.acceptExtensions || 'png,jpg,jpeg';

                    selectedData = {};
                    uploadImage = new UploadImage($container.find("[data-content='form']"), _this.config.reportData);
                    onlineImage = new OnlineImage($container.find("[data-content='list']"));
                    /* 视觉中国初始化开始 */
                    visualChinaImage = new VisualChinaComponent({
                        wrap: $container.find("[data-content='visualChina']"),
                        showType: 'scroll'
                    });
                    visualChinaImage.init();
                    /* 视觉中国初始化结束 */
                    initTabs($container);

                    if (_this.config.success) {
                        _this.config.success($container);
                    }
                },
                yes: function(index, $container) {
                    let $btn = $container.find('.layui-layer-btn0');
                    $btn.addClass('btn-primary');
                    if ($btn.hasClass('btn-loading')) {
                        // 处理中 防止重复请求
                        return;
                    }

                    $btn.addClass('btn-loading').html('<i class="icon-loader"></i>处理中');

                    let data = [];
                    let returnData = [];
                    let tabType = 'list';
                    // eslint-disable-next-line
                    $container.find('[data-id]').filter(function() {
                        let $this = $(this);
                        if ($this.hasClass('active')) {
                            tabType = $this.attr('data-id');
                        }
                    });
                    switch (tabType) {
                        case 'form':
                            if (uploadImage.getQueueCount() > 0) {
                                layer.msg('图片上传处理中');
                                $btn.removeClass('btn-loading').html('确定');
                                return;
                            }
                            data = uploadImage.getInsertList();
                            dataHandler(data);
                            break;
                        case 'list':
                            data = onlineImage.getInsertList();
                            dataHandler(data);
                            break;
                        case 'visualChina':
                            // eslint-disable-next-line
                            let dataDfd = visualChinaImage.getData();
                            if (!dataDfd.noPic) { // 选中了图片，且图片有效
                                if (dataDfd.left == 0) {
                                    layer.msg('高级图库图片本月已用完');
                                    return;
                                }
                                layer.msg('图片处理中,请耐心等待');
                                dataDfd.progress(function(visualChinaImgData) {
                                    console.log('visualChinaData', visualChinaImgData);
                                    if (visualChinaImgData) { // 如果视觉中国图片上传到素材库成功
                                        data = [{
                                            url: visualChinaImgData.size[641].imgurl// todo
                                        }];
                                        dataHandler(data);
                                        layer.closeAll('dialog');
                                    } else {
                                        layer.msg('图片加载失败');
                                    }
                                });
                            } else {
                                $btn.removeClass('btn-loading').html('确定');
                                layer.msg('请选择');
                            }
                            break;
                    }
                    function dataHandler(data) {
                        if (data.length > 0) {
                            if (data.length > maxPicNum) {
                                $btn.removeClass('btn-loading').html('确定');
                                layer.msg('最多选择' + maxPicNum + '张图片');
                                return;
                            }
                            $.each(data, function(index, vl) {
                                let params = {
                                    url: vl.url
                                };
                                $.extend(true, params, _this.config.reportData);
                                api.getCoralFromURL(params).then(function(resp) {
                                    if (resp.response.code == 0) {
                                        returnData.push(resp.data);
                                        if (returnData.length == data.length) {
                                            callback && callback(returnData);
                                        }
                                    } else {
                                        layer.msg('请重试');
                                    }
                                    $btn.removeClass('btn-loading').html('确定');
                                });
                            });

                        } else {
                            $btn.removeClass('btn-loading').html('确定');
                            layer.msg('请选择');
                            return;
                        }
                    }

                },
                end: function() {}
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };

    function initTabs($container) {
        $container.on('click', '.tab>li', function(event) {
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
                    visualChinaImage.getVCGPicMonthLeftData().then(function(resp) { // 拉取会员图片个数成功后重新渲染
                        visualChinaImage.render();
                    });
                    break;
            }
        });

        if (!((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0))) {
            let tempWidth = $('#filePickerReady').width();
            let tempHeight = $('filePickerReady').height();
            $("input[name='file']").parent().width(tempWidth).height(tempHeight);
            $('#upload').find('.help-block').text('支持：jpg、jpeg、png，单张图片大小2M以内');
        }

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
    UploadImage.prototype = {
        init: function() {
            this.imageList = [];
            this.initContainer();
            this.initUploader();
        },
        initContainer: function() {
            this.$queue = this.$wrap.find('.filelist');
        },
        /* 初始化容器 */
        initUploader: function() {
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
                    multiple: true,
                    id: '#filePickerBtn'
                },
                accept: {
                    title: 'Images',
                    extensions: 'jpg,jpeg,png',
                    mimeTypes: 'image/jpg,image/jpeg,image/png'
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
                $('#upload-image-init').hide();
                $('#filePickerBtn').parents('li').append('<p class="help-block">支持：jpg、jpeg、png <br>单张图片大小2M以内</p>');
            }

            setTimeout(function() {
                $('#filePickerBtn>.webuploader-pick').siblings().css({
                    width: '100%',
                    height: '100%'
                });
            }, 1000);



            setState('pedding');

            // // 当有文件添加进来时执行，负责view的创建
            function addFile(file) {
                $('#queueList').show();
                $('#upload-image-init').hide();
                // 修复添加图片按钮没有填充满问题
                if ($('#filePickerBtn')) {
                    let tempWidth = $('#filePickerBtn').width();
                    let tempHeight = $('filePickerBtn').height();
                    if ($("input[name='file']") && $("input[name='file']").parent()) $("input[name='file']").parent().width(tempWidth).height(tempHeight);
                }

                let tempFileLi = $('#queueList li');
                // 留心标签闭合关系，不严谨的闭合会导致IE8 执行异常
                let $li = $('<li id="' + file.id + '">' +
                        '<div class="upload-cover-block">' +
                        '<span class="pic">' +
                        '<img src="//om.gtimg.cn/om/om_2.0/images/cover_default_150x120.png">' +
                        '</span>' +
                        '<div class="upload-mask"><em class="base"></em><em class="item-progress" style="width:0%;"></em><em class="percent"></em></div>' +
                        '</div>' +
                        '<div class="upload-cover-desc"><p>' + file.name.replace(/(\.jpg)|(\.png)|(\.gif)|(\.bmp)$/i, '') + '</p></div>' +
                        '</li>');



                let $progress = $li.find('div.upload-mask em');


                let $wrap = $li.find('span.pic');


                let $info = $('<p class="error"></p>').hide().appendTo($li);

                let text;

                let showError = function(code) {
                    switch (code) {
                        case 'exceed_size':
                            hasError = true;
                            text = lang.errorExceedSize;
                            break;
                        case 'interrupt':
                            hasError = true;
                            text = lang.errorInterrupt;
                            break;
                        case 'http':
                            hasError = true;
                            text = lang.errorHttp;
                            break;
                        case 'not_allow_type':
                            hasError = true;
                            text = lang.errorFileType;
                            break;
                        default:
                            hasError = true;
                            text = lang.errorUploadRetry;
                            break;
                    }
                    $li.find('.upload-mask').html('<em class="error">' + text + '</em>');
                };
                if (file.getStatus() === 'invalid') {
                    showError(file.statusText);
                } else {
                    // $wrap.text(lang.uploadPreview);
                    percentages[file.id] = [file.size, 0];
                    file.rotation = 0;

                    /* 检查文件格式 */
                    if (!file.ext || acceptExtensions.indexOf(file.ext.toLowerCase()) == -1) {
                        showError('not_allow_type');
                        uploader.removeFile(file);
                    }
                    // 文件大小限制
                    if (file.size > 2 * 1024 * 1024) {
                        showError('exceed_size');
                        uploader.removeFile(file);
                    }
                }

                file.on('statuschange', function(cur, prev) {
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
                        let tt = percentages[file.id];
                        percentages[file.id][1] = 0;
                    } else if (cur === 'progress') {
                        $info.hide();
                        $progress.css('display', 'block');
                    } else if (cur === 'complete') {
                        // 这里为啥什么也不做
                    }

                    $li.removeClass('state-' + prev).addClass('state-' + cur);
                });
                // Here we need to judge the file uploaded
                // if (tempFileLi && tempFileLi.length == 2)
                //     $li.insertBefore($filePickerBlock);
                // else if (tempFileLi && tempFileLi.length >2) {
                //     // at first, we need to remove the first one li and insert the second li
                //     var tempFileId = tempFileLi[1].id;
                //     var tempFile = {};
                //     tempFile.id = tempFileId;
                //     removeFile(tempFile);

                // then we need to add the latest one
                $li.insertBefore($filePickerBlock);
                // }
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

                $.each(percentages, function(k, v) {
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
                // $processBar.find("em").html(currentUploaded + "/1");
            }

            uploader.on('fileQueued', function(file) {
                // if (currentFileNum == 1) {
                fileCount++;
                fileSize = file.size;
                currentFileId = file.id;
                addFile(file);
                // }
                // else {
                //     uploader.removeFile(file);
                // }
            });

            uploader.on('fileDequeued', function(file) {
                // if (currentFileId === file.id) {
                fileCount--;
                fileSize -= file.size;
                removeFile(file);
                updateTotalProgress();
                // }
            });

            uploader.on('filesQueued', function(file) {
                if (!uploader.isInProgress() && (state == 'pedding' || state == 'finish' || state == 'confirm' || state == 'ready')) {
                    // setState('ready');
                    setState('uploading');
                    uploader.upload();
                }
                updateTotalProgress();
            });

            uploader.on('all', function(type, files) {
                switch (type) {
                    case 'uploadFinished':
                        currentFileNum = 0;
                        currentFileId = '';
                        if (hasError) currentUploaded = 0;
                        else currentUploaded = 1;
                        setState('confirm', files);
                        break;
                    case 'startUpload':
                        /* 添加额外的GET参数 */
                        setState('uploading', files);
                        break;
                    case 'stopUpload':
                        setState('paused', files);
                        break;
                    case 'beforeFileQueued':
                        currentFileNum = currentFileNum + 1;
                        currentUploaded = 0;
                        hasError = false;
                        break;
                }
            });

            uploader.on('uploadBeforeSend', function(file, data, header) {
                data.Filename = data.name;
                data.Filedata = data.file;
                try {
                    delete data.size;
                } catch (e) {}
            });

            uploader.on('uploadProgress', function(file, percentage) {
                let $li = $('#' + file.id);


                let $progress = $li.find('.upload-mask .item-progress');


                let $percent = $li.find('.upload-mask .percent');

                $progress.css('width', percentage * 100 + '%');
                $percent.html((percentage == 1 ? '99' : Math.round(percentage * 100)) + '%');

                percentages[file.id][1] = percentage;
                updateTotalProgress();
            });

            uploader.on('uploadSuccess', function(file, ret) {
                let $file = $('#' + file.id);


                let $progress = $file.find('.upload-mask .item-progress');


                let $percent = $file.find('.upload-mask .percent');
                try {
                    let responseText = (ret._raw || ret);


                    let json = utils.str2json(responseText);

                    if (json.response.code == 0) {
                        let url; let width; let height;
                        if (ret.data.url.type == '1') {
                            url = ret.data.url.size[0].imgurl;
                            width = ret.data.url.size[0].width;
                            height = ret.data.url.size[0].height;
                        } else {
                            url = ret.data.url.size[641].imgurl;
                            width = ret.data.url.size[641].width;
                            height = ret.data.url.size[641].height;
                        }

                        let data = {
                            url: url,
                            width: width,
                            height: height
                        };
                        // 顺序乱了
                        _this.imageList.push(data);

                        $file.find('span.pic').empty().append('<img src="' + data.url + '" data-id="' + data.width + ':' + data.height + '"/>');
                        $progress.css('width', '100%');
                        $percent.html('上传成功');

                        $file.append('<span class="success"></span>');
                    } else {
                        $file.find('.error').text(json.state).show();
                    }
                } catch (e) {
                    $file.find('.error').text('上传失败').show();
                }
            });

            uploader.on('uploadError', function(file, code) {});
            uploader.on('error', function(code, file) {
                if (code == 'Q_TYPE_DENIED' || code == 'F_EXCEED_SIZE') {
                    addFile(file);
                }
            });
            uploader.on('uploadComplete', function(file, ret) {});

            updateTotalProgress();
        },

        getQueueCount: function() {
            let file; let i; let status; let readyFile = 0;


            let files = this.uploader.getFiles();
            // eslint-disable-next-line
            for (i = 0; file = files[i++];) {
                status = file.getStatus();
                if (status == 'queued' || status == 'uploading' || status == 'progress') readyFile++;
            }
            return readyFile;
        },

        destroy: function() {
            this.$wrap.remove();
        },

        getInsertList: function() {
            let i; let data; let
                list = [];

            // this.imageList = this.imageList.sort(function(a, b) {
            //     return a.url < b.url ? -1 : 1;
            // });
            // for (i = 0; i < this.imageList.length; i++) {
            //     data = this.imageList[i];
            //     list.push({
            //         src: data.url,
            //         title: data.title,
            //         alt: data.original
            //     });
            // }
            this.$wrap.find('li.state-complete').each(function() {
                let url = $(this).find('span.pic>img').attr('src');
                let tempWidthHeight = $(this).find('span.pic>img').attr('data-id');
                let tempArr = tempWidthHeight.split(':');
                let tempWidth = 0;
                let tempHeight = 0;
                if (tempArr && tempArr.length == 2) {
                    tempWidth = tempArr[0];
                    tempHeight = tempArr[1];
                }
                let title = $(this).find('.upload-cover-desc').text();
                list.push({
                    url: url,
                    title: title,
                    alt: title,
                    width: tempWidth,
                    height: tempHeight
                });
            });
            return list;
        }
    };


    /* 在线图片 */
    function OnlineImage(target) {
        this.$wrap = utils.isString(target) ? document.getElementById(target) : target;
        this.init();
    }
    OnlineImage.prototype = {
        init: function() {
            this.reset();
            this.initEvents();
        },
        /* 初始化容器 */
        initContainer: function() {
            // this.$wrap.html("<ul></ul>");
            this.$wrap.find('.upload-cover-list').empty();
        },
        /* 初始化滚动事件,滚动到底部自动拉取数据 */
        initEvents: function() {
            let _this = this;
            /* 滚动拉取图片 */
            this.$wrap.find('ul').on('scroll', function(e) {

                let panel = this;
                if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                    _this.getImageData();
                }
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            /* 选中图片 */
            this.$wrap.on('click', '.upload-cover-block', function(e) {
                if (maxSelected == 1) {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                    } else {
                        $('#image-list').find('.upload-cover-block').removeClass('active');
                        $(this).addClass('active');
                        selectedData = JSON.parse($(this).attr('data-info'));
                    }
                }
                else {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                        // 需要删除数据
                    } else {
                        $(this).addClass('active');
                        selectedData = JSON.parse($(this).attr('data-info'));
                    }
                }
            });
        },
        /* 初始化第一次的数据 */
        initData: function() {

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
        reset: function() {
            this.initContainer();
            this.initData();
        },
        /* 向后台拉取图片列表数据 */
        getImageData: function() {
            let _this = this;

            if (!_this.listEnd && !this.isLoadingData) {
                this.isLoadingData = true;
                api.getImageList({
                    types: acceptExtensions || '', // 输出所有类型 包括动图
                    page: ++this.pageNum
                    // page: parseInt(this.listIndex / 12) + 1
                })
                    .then(function(resp) {
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
                            list.push(e);
                        }

                        _this.pushData(list);
                        _this.listIndex = parseInt(_this.listIndex) + parseInt(resp.data.list.length);

                        if (resp.data.list.length < 12) {
                            // _this.listEnd = true;//修复无法滚动的bug http://tapd.oa.com/OMQQ/bugtrace/bugs/view?bug_id=1010116611065105199
                        }

                        if (_this.listIndex >= resp.data.total) { // 修复代码错误，原为resp.total
                            _this.listEnd = true;
                        }
                        _this.isLoadingData = false;
                    }).fail(function() {
                        _this.isLoadingData = false;
                    });
            }
        },
        /* 添加图片到列表界面上 */
        pushData: function(list) {
            let html = '';
            let e;
            // eslint-disable-next-line
            for (let i = 0; e = list[i++];) {
                if (e.url) {
                    e.data = JSON.stringify(e);
                    console.log('wendaimage 插入图片 从素材中选择');
                    html += omtemplate('art-dialog-image-list-item', e);
                }
            }
            this.$wrap.find('.upload-cover-list').append(html);
        },

        getInsertList: function() {
            let i; let lis = this.$wrap.find('.upload-cover-block.active');


            let list = [];

            for (i = 0; i < lis.length; i++) {
                let src = $(lis[i]).find('img').attr('src');
                let title = $(lis[i]).find('div.upload-cover-desc p').text();
                list.push({
                    url: src,
                    title: title
                });
            }
            return list;
        }
    };

    return DialogImage;
});
