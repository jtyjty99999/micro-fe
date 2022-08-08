define(function (require, exports, module) {

    var uploadImageSimple = require('base/component/UploadImageSimple');
    var videoapi = require('base/api/video');
    var acceptExtensions = "png,jpg,jpeg,webp";
    var xiuxiu = window['xiuxiu'];

    function load() {
        // return $.getScript(location.protocol + "//om.gtimg.cn/om/om_2.0/libs/meihua/meihua.7e0e1d.js");
        return $.getScript(location.protocol + "//om.gtimg.cn/om/om_2.0/libs/meihua/xiuxiu.src.mat1.js");
    }

    exports = module.exports =  function(opt,callback) {
        return $.Deferred(function( defer ) {
            if(!xiuxiu) {
                load()
                    .then(function(){
                        xiuxiu = window['xiuxiu'];
                        xiuxiu.params['wmode'] = 'transparent';
                        return uploadFilterImage(opt,callback)
                            .then(defer.resolve)
                            .fail(defer.reject);
                    })
            } else {
                xiuxiu.params['wmode'] = 'transparent';
                return uploadFilterImage(opt,callback)
                    .then(defer.resolve)
                    .fail(defer.reject);
            }
        }).promise();
    }

    /**
     * 美图秀秀flash插件和腾讯视频，快报封面裁剪逻辑
     */
    function uploadFilterImage(opt,callback) {

        if(xiuxiu) {
            // xiuxiu._apiTrack = console.log;
            xiuxiu._apiTrack = function() {}; //这里是调统计代码的地方
            xiuxiu.setLaunchVars("sizeTipVisible", 1);
            xiuxiu.setLaunchVars("cropPresets", "16:9");
            // xiuxiu.setLaunchVars("cropPresets", "7:4");
            // xiuxiu.setLaunchVars("cropPresets", "4:3");
            xiuxiu.setLaunchVars("avatarPreview", {visible:true,large:{width:140,height:140, label:"大尺寸"}});
            xiuxiu.setLaunchVars("cameraEnabled", 0);
        }


        return $.Deferred(function( defer ) {
            var option = $.extend(true, {
                upload: {
                    server: '/image/orginalupload',
                    pick: {
                        id: '#filter-upload-picker',
                        multiple: false
                    },
                    accept: {
                        title: 'Images',
                        extensions: acceptExtensions,
                        mimeTypes: 'image/jpg,image/jpeg,image/png'
                    }
                },
                filter: {
                    dom: 'om-xiuxiu-container',
                    width: 720,
                    height: 397,
                    id: 'lite',
                    minSizeError: function(data, min) {
                        console.log(data.width,data.height,min[0],min[1]);
                    }
                },
                upvalid: function() { return true }
            }, opt)

            var uploadoption = option.upload;
            var filteroption = option.filter;
            var upvalid = option.upvalid;

            uploadImageSimple(uploadoption, function(kuaibaodata) {
                var data = kuaibaodata.data;

                if(!upvalid(data)) {
                    return;
                }
                $.ajax({
                    url: '/image/convertBase64',
                    data: {
                        url: data.url
                    }
                }).then(function(base64data) {
                    $('#upload-pic-box').hide(); //上传按钮和xiuxiu分开，修复上传按钮不显示问题
                    var base64 = base64data.data;
                    var uploadurl = location.protocol + '//' + (location.hostname || location.host) + '/image/exactupload?appkey=1&opCode=157&isUpOrg=1&relogin=1';
                    if(uploadoption.formData&&uploadoption.formData.subModule){
                        uploadurl=uploadurl+'&subModule='+uploadoption.formData.subModule;//图片上传来源
                    }
                    if(xiuxiu) {
                        xiuxiu.setUploadType(2);
                        xiuxiu.setUploadURL(uploadurl);
                        xiuxiu.embedSWF(filteroption.dom, 5, filteroption.width, filteroption.height, filteroption.id);
                        xiuxiu.onInit = function (id) {
                            xiuxiu.loadPhoto(base64, true);
                        }

                        var videominsize = { width: 640, height: 360 };
                        var coversize = {};
                        xiuxiu.onBeforeUpload = function (data, id) {
                            coversize = data;
                            var min = [480,270];
                            if(data.width < min[0] || data.height < min[1]) {
                                filteroption.minSizeError(data, min);
                                return false;
                            }
                            return true;
                        }

                        xiuxiu.onUploadResponse = function (datastring) {
                            var resdata = {}
                            try {
                                resdata = JSON.parse(datastring);
                            } catch (e) {
                                console.log(e);
                                return defer.reject(e);
                            }

                            //把快报截图先行返回
                            // defer.notify(resdata);

                            var videoneedcoverurl = resdata.data[1];
                            if(coversize.width < videominsize.width || coversize.height < videominsize.height) {
                                videoneedcoverurl = resdata.data['640360'];
                            }
                            // 开发驱动需求 from rabbitsu
                            defer.resolve({
                                video: {
                                    path:videoneedcoverurl
                                },
                                kuaibao: resdata.data
                            });

                            // videoapi.getVideoCoverFormUrl({
                            //     url: videoneedcoverurl,
                            //     x: 0,
                            //     y: 0,
                            //     height: '100',
                            //     width: 100
                            // }).then(function(videodata){
                            //     defer.resolve({
                            //         video: videodata,
                            //         kuaibao: kuaibaodata
                            //     });
                            // }).fail(function(err){
                            //     console.log(err);
                            //     defer.reject(err);
                            // });
                        }
                    }
                }).fail(function(err){
                    defer.reject(err);
                });
            });
        }).promise();
    }
});
