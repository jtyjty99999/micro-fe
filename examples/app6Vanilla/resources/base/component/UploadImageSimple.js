/**
 * 图片上传封装
 * 1. 上传服务接口
 * 
 */
define(function(require, exports, module) {
    var omlayer = require('layer/layer');
    var picApi = require('base/api/pic');
    var mess = require('base/tool/mess');

    function UploadImage(params, callback) {
        var config = { //定义参数配置对象
            // 选完文件后，是否自动上传。
            auto: true,
            timeout: 60000,
            // swf文件路径
            swf: '//om.gtimg.cn/om/om_2.0/libs/webuploader/Uploader.swf',
            // 文件接收服务端。上传素材并同步至素材库
            server: '/image/archscaleupload?isRetImgAttr=1&relogin=1',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: '#picker'
            },
            disableGlobalDnd: true,
            fileNumLimit: 100000, //上传个数设置为10万来表示无限上传
            fileVal: 'Filedata',
            fileSingleSizeLimit: 5 * 1024 * 1024,
            duplicate: true, //保证可以上传重复
            threads: 5,
            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'jpg,jpeg,png',
                mimeTypes: 'image/jpg,image/jpeg,image/png'
            },
            thumb: {
                width: 150,
                height: 120,
                crop: false,
                type: 'image/png'
            },
            compress:false
        };
        $.extend(true, config, params);
        if (!$.isFunction(callback)) {
            callback = function() {};
        }
        var uploader;
        //添加参数
        function uploadBeforeSend(obj, data, header) {
            data.appkey = 1;
            data.isRetImgAttr = 1;
            data.from = 'user';
            try {
                delete data.size;
            } catch (e) {}
        }
        //上传成功
        function uploadSuccess(file, data) {
            // data = data.data;

            if (!data) {
                omlayer.msg('图片上传失败', {
                    icon: 2
                });
                callback({
                    imageResultUrl: null
                });
                return;
            }
            if (data.response["code"] == -7001) {
                omlayer.msg("图片不能大于5MB", {
                    icon: 2
                });
                callback({
                    imageResultUrl: null
                });
                return;
            }
            if (data.response["code"] != 0) {
                omlayer.msg('图片上传失败', {
                    icon: 2
                });
                callback({
                    imageResultUrl: null
                });
                return;
            }
            if (!!data.data.url.isqrcode && data.data.url.isqrcode == '1') {
                return omlayer.msg('图片包含二维码，请重新上传', {
                    icon: 2
                });
                // callback({
                //     imageResultUrl: null,
                //     data: data.data.url
                // });
                // return;
            }

            var imageUrl = data.data.url.url;
            callback({
                imageResultUrl: imageUrl,
                data: data.data.url
            });
        }

        function uploadError(file, reason) {
            omlayer.msg("上传图片发生异常", {
                icon: 2
            });
        }

        function error(type) {
            switch (type) {
                case 'Q_TYPE_DENIED':
                    omlayer.msg("上传图片类型不正确", {
                        icon: 2
                    });
                    break;
                case 'F_EXCEED_SIZE':
                    omlayer.msg("上传图片超过大小" + mess.formatBytes(config.fileSingleSizeLimit, 'MB') + "限制", {
                        icon: 2
                    });
                    break;
                case 'Q_EXCEED_NUM_LIMIT':
                    omlayer.msg("上传图片超过个数限制", {
                        icon: 2
                    });
                    break;
                default:
                    break;
            }
        }

        function uploadProgress(file, percentage) {
            //console.log(percentage);
        }

        //销毁
        this.destroy = function() {
            uploader.destroy();
        }

        this.show = function() {
            if (typeof WebUploader.Base.browser.ie != 'undefined') {
                if (!mess.detectFlash()) {
                    omlayer.open({
                        type: 1,
                        title: [' '],
                        closeBtn: 1,
                        shadeClose: true,
                        area: ['200px', '200px'],
                        content: '<div style="text-align:center;height:35px;">请安装<a href="//get.adobe.com/cn/flashplayer/" target="_blank">flash插件</a></div>',
                        btn: ['确定']
                    });
                    return;
                }
            }

            uploader = WebUploader.create(config);
            uploader.on("uploadBeforeSend", uploadBeforeSend);
            uploader.on("uploadProgress", uploadProgress);
            uploader.on("uploadSuccess", uploadSuccess);
            uploader.on("uploadError", uploadError);
            uploader.on("error", error);
        };
        this.show();
        return uploader;
    }
    return UploadImage;
});
