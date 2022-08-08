/**
 * Created by xiabingwu on 2016/4/11.
 * 自定义模板的话必须提供uploadPlaceholder作为图片上传占位符
 */
define(function(require, exports, module) {
    var picApi = require('base/api/pic');
    var UploadImage = require('base/component/UploadImage');

    function UploadCropImage(params, callback) {
        var origin = {};
        var config = {
            needUpload: true,
            cropWidth: 130,
            cropHeight: 130,
            boxWidth: 276,
            boxHeight: 190,
            reportData:{

            }
        };

        $.extend(true, config, params);
        if (!$.isFunction(callback)) {
            callback = function() {};
        }

        var imageUrl = '';

        var $imageOriginal;
        var $imagePreview;

        var jcropApi;
        var currentCoords = {};

        var uploadImageInstance;
        //初始化裁剪
        function initJcrop(url, selectArea) {
            imageUrl = url;
            var cropWidth = config.cropWidth; //裁剪宽度
            var cropHeight = config.cropHeight; //裁剪高度           
            var aspectRatio = cropWidth / cropHeight;
            var boxWidth = config.boxWidth; //画布宽度
            var boxHeight = config.boxHeight; //画布高度
            var bounds, boundx, boundy;
            $imageOriginal = config.box;
            $imagePreview = config.preview;
            $imagePreview.attr('src', imageUrl).show();
            $imageOriginal.css({
                marginLeft:'-10000px'      //防止出现原图尺寸到缩方尺的跳动问题  coreywang  2017-03-15
            })

            try {
                //连续又上传了图片，先销毁掉它
                jcropApi.destroy();
                //清除上次图片影响
                $imageOriginal.css({
                    width: 'auto',
                    height: 'auto'
                });
            } catch (e) {}

            var jcrop_config = {
                onChange: showPreview,
                onSelect: showPreview,
                addClass: 'jcrop-centered',
                boxWidth: boxWidth,
                boxHeight: boxHeight,
                aspectRatio: aspectRatio,
                minSize: [160, 90]
            };
            if (params.minSize) {
                jcrop_config.minSize = params.minSize;
            }
            // if (selectArea) {
            //     jcrop_config.setSelect = selectArea;
            //     console.log(selectArea);
            // }

            //解决mac safari下偶尔不能获取图片高度的bug  coreywang  2017-03-15
            $imageOriginal.one('load', function(){
                $imageOriginal.Jcrop(jcrop_config, function() {
                    jcropApi = this;
                    bounds = jcropApi.getBounds();
                    boundx = bounds[0];
                    boundy = bounds[1];
                    if (boxHeight >= boundy) {
                        $(".jcrop-holder").css({
                            top: (boxHeight - boundy) / 2 + "px"
                        });
                    }
                    if (!selectArea) {
                        if (boundx / boundy > aspectRatio) {
                            jcropApi.setSelect([0, 0, boundy * aspectRatio, boundy]);
                        } else {
                            jcropApi.setSelect([0, 0, boundx, boundx / aspectRatio]);

                        }
                    } else {
                        jcropApi.setSelect(selectArea);
                        console.log(selectArea);
                    }
                });
            })
            $imageOriginal.attr('src', imageUrl.replace(/^https?:/i,'')).show();

            function showPreview(coords) {
                if (parseInt(coords.w) > 0) {
                    var rx = cropWidth / coords.w;
                    var ry = cropHeight / coords.h;
                    $imagePreview.css({
                        width: Math.round(rx * boundx) + 'px',
                        height: Math.round(ry * boundy) + 'px',
                        marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                        marginTop: '-' + Math.round(ry * coords.y) + 'px'
                    });

                    if (params.onChange) {
                        params.onChange(coords);
                    }
                }
                currentCoords = coords;
            }
        }

        //初始化本地图片上传
        function initUpload() {
            var id = "btn" + parseInt(Math.random() * 1E10);
            $uploadBtn = config.btn;
            $uploadBtn.attr("id", id);
            uploadImageInstance = new UploadImage({
                pick: {
                    id: $uploadBtn,
                    multiple: false
                },
                formData: config.reportData||{},
            }, function(data) {
                if (data.imageResultUrl) {
                    origin = {
                        width: data.data.width,
                        height: data.data.height
                    };
                    imageUrl = data.imageResultUrl;
                    if (1 == data.isqrcode) {
                        layer.msg("封面不得包含二维码");
                        return;
                    }
                    if (data.data && data.data.isqrcode) {
                        layer.msg("封面不得包含二维码");
                        return;
                    }
                    if (config.onUpload) {
                        if (!config.onUpload(data.data)) {
                            return;
                        }
                    }
                    if (imageUrl) {
                        var img = new Image();
                        img.onload = function() {
                            $('.text-null').hide(); //清除没有图片的时候文字提示
                            initJcrop(imageUrl);
                        };
                        img.onerror = img.onabort = function() {}
                        img.src = imageUrl;
                    }
                }

            });
            uploadImageInstance.show();
        }
        this.getOriginData = function() {
            return origin;
        };
        this.getCropData = function() {
            return {
                url: $imagePreview.attr("src"),
                cropX: parseInt(currentCoords.x),
                cropY: parseInt(currentCoords.y),
                cropWidth: parseInt(currentCoords.w),
                cropHeight: parseInt(currentCoords.h)
            };
        };
        this.initJcrop = initJcrop;
        config.needUpload && initUpload();
    }
    return UploadCropImage;
});