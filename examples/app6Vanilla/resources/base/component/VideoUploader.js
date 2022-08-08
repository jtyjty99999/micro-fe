define(function(require, exports, module) {
    var base = require('base/base');
    var template = require('base/component/template');
    var videoapi = {
        report:function(){}
    };
    var startime = 0;
    // 文档地址
    // http://tvp.oa.com/uploader/

    try {
        tvu.core.config['ftnhtml5'].maxFileSize = 8192; //8G
        // 视频侧 仅ftn模式支持8G
        // tvu.core.config['ftn'].maxFileSize = 10240; //10G
        // tvu.core.config['html5'].maxFileSize = 8192; //8G
        // tvu.core.config['flash'].maxFileSize = 10240; //10G
    } catch (e) {}
    var hasinted = false;
    
    //if(window.g_userInfo&&(window.g_userInfo.mediaId%2==1||window.g_userInfo.mediaId==8514||window.g_userInfo.mediaId==5006291)){//灰度
        window.isFtnUploader=true;
    //}else{
    //    window.isFtnUploader=false;
    //}
    function initUploader(_this) {
        tvu.cancelQueueOne=function(){}//腾讯视频上传，不能单个取消，这里让它执行一个空函数
        function getCookie(name, raw) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) {
                return raw ? arr[2] : unescape(arr[2]);
            }
            return null;
        }

        var _utype = null;
        if (browser.gecko) {
            _utype = tvu.UploadType.FLASH;
        }

        var tvuoption = {
            businessType: tvu.BusinessType.OPEN,
            businessID: 24,
            useMultiUploadType: false,
            maxQueueParallelNum: 1,
            uploadType: _utype,
            // selectButton: $("#btn-upload-video"),
            useMultiSelect: true,
            isReportBoss: true,
            uploadInfo: {
                bid: 'open_omg_video',
                platform: 'web',
                open_uid: g_userInfo.mediaId,
                open_token: getCookie('omtoken')
            },

            onFileSelect: function(fioArr) {
                startime = Date.now();
                if (fioArr && fioArr.length > 0) {
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        var maxNumber = g_userInfo.mediaLevel <= 2 ? 3 : 5
                        if (fioArr.length + $('.multivideoform').length > maxNumber) {
                            layer.msg("最多可同时上传" + maxNumber + "个视频");
                            return;
                        } else {
                            var starinfo = {
                                len: fioArr.length,
                                data: []
                            };
                            for (var i = 0, len = fioArr.length; i < len; i++) {
                                //console.log(fioArr[i]['uid']);
                                starinfo.data.push(fioArr[i]['uid']);
                            }
                            //console.log('startinfo:' + JSON.stringify(starinfo));
                            $(document).trigger("om-multivideo-publish-show");
                            $(document).trigger("om-multivideo-publish-upload-start", starinfo);

                        }
                    } else {
                        if (fioArr.length > 1) {
                            layer.msg("每次上传只能上传一个文件");
                            return;
                        }
                    }
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        _this.states = {}
                        for (var i = 0, len = fioArr.length; i < len; i++) {
                            (function(fio) {
                                if (fio.errorCode != 0) {
                                    processError(fio.errorCode, fio.errorMsg);
                                    $(document).trigger("om-multivideo-cancel-upload-start", {
                                        _fio: fio,
                                        _state: _this.states[fio.uid]
                                    });
                                } else {
                                    if (tvu.addToQueue(fio)) {
                                        tvu.startQueue();
                                        var _state = {};
                                        _state.status = "scanning";
                                        _state.percent = "0%";
                                        _state.title = fio.name;
                                        _state.showCancel = false;
                                        _state.fileSize = tvu.getSizeString(fio.size);
                                        _state.startTime = Date.now();
                                        _this.states[fio.uid] = _state;

                                        $(document).trigger("om-multivideo-publish-upload", {
                                            _fio: fio,
                                            _state: _this.states[fio.uid]
                                        });
                                        //console.log('scanning:' + JSON.stringify(_this.states[fio.uid]));
                                        _this.onstart && _this.onstart(fio);
                                        _this.update(fio);
                                    }
                                }
                            }(fioArr[i]));
                        }
                    } else {
                        // 非视频文章
                        for (var i = 0, len = fioArr.length; i < len; i++) {
                            (function(fio) {
                                if (fio.errorCode != 0) {
                                    var message = processError(fio.errorCode, fio.errorMsg);

                                    $(document).trigger("om-video-publish-upload-error", { message: message });
                                } else {
                                    if (tvu.addToQueue(fio)) {
                                        tvu.startQueue();
                                        _this.state = {};
                                        _this.state.status = "scanning";
                                        _this.state.percent = "0%";
                                        _this.state.title = fio.name;
                                        _this.state.showCancel = false;
                                        _this.state.fileSize = tvu.getSizeString(fio.size);
                                        _this.state.startTime = Date.now();

                                        $(document).trigger("om-video-publish-upload", fio);
                                        console.log('singleonstart:' + _this.onstart);
                                        _this.onstart && _this.onstart(fio);
                                        _this.update(fio);
                                    }
                                }
                            }(fioArr[i]));
                        }
                    }

                }
            },

            onFileStart: function(fio) {
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    if (!_this.states[fio.uid]) {
                        _this.states[fio.uid] = {};
                        _this.states[fio.uid].title = fio.name;
                        _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                    }
                    _this.states[fio.uid]['status'] = "scanning";
                    //console.log('scanning:' + JSON.stringify(_this.states[fio.uid]));
                } else {
                    if (!_this.state) {
                        _this.state = {};
                    }
                    _this.state.status = "scanning";
                }
                _this.update(fio);
            },

            onFileScanProgress: function(fio) { //文件扫描进度反馈时回调
                // console.log('onFileScanProgress:'+fio.uid);
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    if (!_this.states[fio.uid]) {
                        _this.states[fio.uid] = {};
                        _this.states[fio.uid].title = fio.name;
                        _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                    }
                    _this.states[fio.uid]['status'] = "scanning";
                    fio.averageSpeed = parseInt(fio.processedSize * 1000 / (Date.now() - _this.states[fio.uid].startTime));
                    _this.states[fio.uid].percent = parseInt(fio.percent) + '%';
                    _this.states[fio.uid].processedSize = tvu.getSizeString(fio.processedSize);
                    _this.states[fio.uid].instantSpeed = tvu.getSizeString(fio.instantSpeed) + '/S';
                    _this.states[fio.uid]._averageSpeed = fio.averageSpeed;
                    _this.states[fio.uid].averageSpeed = tvu.getSizeString(fio.averageSpeed) + '/S';

                    // console.log('onFileScanProgress:'+JSON.stringify(_this.states[fio.uid]));

                    // console.log(_this.states[fio.uid].averageSpeed);
                    _this.update(fio);
                    _this.onscan && _this.onscan(fio);
                } else {

                    if (!_this.state) {
                        _this.state = {};
                    }
                    _this.state.status = 'scanning';
                    fio.averageSpeed = parseInt(fio.processedSize * 1000 / (Date.now() - _this.state.startTime));
                    _this.state.percent = fio.percent + '%';
                    _this.state.processedSize = tvu.getSizeString(fio.processedSize);
                    _this.state.instantSpeed = tvu.getSizeString(fio.instantSpeed) + '/S';
                    _this.state._averageSpeed = fio.averageSpeed;
                    _this.state.averageSpeed = tvu.getSizeString(fio.averageSpeed) + '/S';


                    _this.update(fio);
                    _this.onscan && _this.onscan(fio);
                }
            },

            onFileUploadStart: function(fio) {
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    if (!_this.states[fio.uid]) {
                        _this.states[fio.uid] = {};
                        _this.states[fio.uid].title = fio.name;
                        _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                    }
                    _this.states[fio.uid].status = "uploading";
                    _this.states[fio.uid].percent = '0%';
                    console.log('onFileUploadStart:' + JSON.stringify(_this.states[fio.uid]));
                    _this.update(fio);
                } else {

                    if (!_this.state) {
                        _this.state = {};
                    }
                    _this.state.status = "uploading";
                    _this.state.percent = '0%';
                    _this.update(fio);
                }
            },

            onFileUploadProgress: function(fio) {
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    if (!_this.states[fio.uid]) {
                        _this.states[fio.uid] = {};
                        _this.states[fio.uid].title = fio.name;
                        _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                    }
                    _this.states[fio.uid]['status'] = "uploading";
                    _this.states[fio.uid].instantSpeed = tvu.getSizeString(fio.instantSpeed) + '/S';
                    _this.states[fio.uid].averageSpeed = tvu.getSizeString(fio.averageSpeed) + '/S';
                    _this.states[fio.uid].processedSize = tvu.getSizeString(fio.processedSize);
                    _this.states[fio.uid].percent = parseInt(fio.percent) + '%';
                    _this.update(fio);

                    // console.log('onFileUploadProgress:'+JSON.stringify(_this.states[fio.uid]));
                    _this.onupload && _this.onupload(fio);
                } else {

                    if (!_this.state) {
                        _this.state = {};
                    }
                    _this.state.status = 'uploading';
                    _this.state.instantSpeed = tvu.getSizeString(fio.instantSpeed) + '/S';
                    _this.state.averageSpeed = tvu.getSizeString(fio.averageSpeed) + '/S';
                    _this.state.processedSize = tvu.getSizeString(fio.processedSize);
                    _this.state.percent = fio.percent + '%';
                    _this.update(fio);

                    _this.onupload && _this.onupload(fio);
                }
            },

            onFileSuccess: function(fio) {
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    if (!_this.states[fio.uid]) {
                        _this.states[fio.uid] = {};
                        _this.states[fio.uid].title = fio.name;
                        _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                    }
                    _this.states[fio.uid].status = "successed";
                    _this.states[fio.uid].percent = '100%';
                    _this.states[fio.uid].vid = fio.vid;
                    //console.log('successed:' + JSON.stringify(_this.states[fio.uid]));
                } else {

                    if (!_this.state) {
                        _this.state = {};
                    }
                    _this.state.status = "successed";
                    _this.state.percent = '100%';
                    _this.state.vid = fio.vid;
                }
                _this.update(fio);
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    $(document).trigger("om-multivideo-publish-upload-success", {
                        _fio: fio,
                        _state: _this.states[fio.uid]
                    });
                } else {
                    $(document).trigger("om-video-publish-upload-success", fio.vid);
                }
                videoapi.report({
                    interface: "upload", // 请求的url
                    desc: "视频上传", // 描述
                    errorcode: 0, // 错误码
                    errormsg: "上传成功", //错误信息
                    params: "{}", // 请求参数
                    reponse: "{}", // 请求返回
                    vid: fio.vid,
                    timeconsume: Date.now() - startime
                });
                _this.onsuccess && _this.onsuccess(fio);

            },
            onFileError: function(fio) {
                // 火狐浏览器黑库－1014 强转4025 待 aprical
                // 上线新版flash后去掉这段代码，相关风险已告知，confirmed by @张艳
                // 2016-12-5
                if (fio.errorCode == '-1014') {
                    fio.errorCode = '4025';
                }


                // 媒资平台后台接口特殊需求,他们的错误值一直是30，并且错误码在errorMsg....需转码
                if (fio.errorCode == '30' && /\((\d*)\)/.test(fio.errorMsg)) {
                    var mt = fio.errorMsg.match(/\((\d*)\)/);
                    if (mt && mt[1]) {
                        fio.errorCode = fio.errorMsg.match(/\((\d*)\)/)[1];
                    }
                }
                var message = "",
                    code = fio.errorCode;
                // 出错了
                if (fio.errorCode != '4025') {
                    //产品需求命中黑库时不弹黑框
                    message = processError(fio.errorCode, fio.errorMsg);
                }

                var duplidata = get_dupli_info(fio);
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    if (!_this.states[fio.uid]) {
                        _this.states[fio.uid] = {};
                        _this.states[fio.uid].title = fio.name;
                        _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                    }
                    _this.states[fio.uid].status = "error";
                    _this.states[fio.uid].errorCode = fio.errorCode;
                    _this.states[fio.uid].errorMsg = fio.errorMsg;
                    _this.states[fio.uid].dupli_info = duplidata.dupli_info;
                    var errorInfo = {
                        _state: _this.states[fio.uid],
                        _fio: fio,
                        message: message,
                        code: code,
                    }

                    $(document).trigger("om-multivideo-publish-upload-error", errorInfo);

                    // if (fio.errorCode != '4025') {
                    //     $(document).trigger("om-multivideo-cancel-upload-start", {
                    //         _fio: fio,
                    //         _state: _this.states[fio.uid]
                    //     });

                    // } else {

                    // }
                } else {
                    if (!_this.state) {
                        _this.state = {};
                    }
                    _this.state.status = "error";
                    _this.state.errorCode = fio.errorCode;
                    _this.state.errorMsg = fio.errorMsg;
                    _this.state.dupli_info = duplidata.dupli_info;

                    $(document).trigger("om-video-publish-upload-error", {
                        code: code,
                        message: message,
                    });
                }
                console.log('error:' + JSON.stringify(_this.states[fio.uid]));
                _this.update(fio);
                
                if (duplidata.aimOrigin || duplidata.aimRepeat) {
                    var $copyBtn = _this.$el.find('[data-clipboard-text]');
                    ZeroClipboard.config({
                        swfPath: '//om.gtimg.cn/om/om_2.0/libs/jquery.ZeroClipBoard/ZeroClipboard20161009.swf'
                    });
                    _this.zclip = new ZeroClipboard($copyBtn);
                    _this.zclip.on("ready", function(readyEvent) {
                        _this.zclip.on("aftercopy", function(event) {
                            layer.msg('复制成功', {
                                icon: 1
                            });
                        });
                    });
                }
            },
            // 取消调试
            debug: false
        };

        if (!hasinted) {
            var uploader = tvu.init(tvuoption);
            hasinted = true;
        }
        if (browser.gecko) {
            // 需要初始化后立即绑定
            tvu.setSelectButton(_this.$button, _utype);
            $(window).resize(function() {
                if (_this.$button.is(":visible")) {
                    var position = _this.$button.offset();
                    $('#tvu_flashuploader_obj').css({
                        left: position.left + 'px',
                        top: position.top + 'px'
                    });
                }
            });
        }

        if ($("#tvu_flashuploader_obj").length) {
            $("#tvu_flashuploader_obj").css({
                position: 'absolute'
            });
        }
    }
    function initFtnUploader(_this) {

        function capacityCheck(){//上传能力检测
            //检测当前浏览器是否支持
            if(!FtnUploader.detect()){
                var  tips='当前浏览器版本太低，不支持视频上传';
                layer.open({
                    type: 1,
                    // title: "定时发布",
                    title: ['提示', 'border-bottom:1px solid #e9eef4;'],
                    height: 200,
                    content: '<div class="pop-body"> <div class="form-horizontal"><div class="alert-content alertWarningContent">' + tips+ '</div>                    </div>                    </div>',
                    area: ['500px'],
                    move: false,
                    btn: [
                        '确定'
                    ],
                    success: function($container, index) {},
                    yes: function(index, $container) {
                        layer.close(index);
                        return false;
                    },
                    end: function(index, $container) {
                        layer.close(index);
                        return false;
                    }
                });
                return false;
            }else{
                return true;
            }

        }

        function fioAdapter(ftnFile,status){
            var fio={};
            var uploadSpeed = ftnFile.get("uploadSpeed"),
            uploadRemainTime = ftnFile.get("uploadRemainTime"),
            errorCode = ftnFile.get('errorCode'),
            name = decodeURIComponent(ftnFile.get('name')),
            size = ftnFile.get('size'),
            signPercent = ftnFile.get("signPercent"),
            uploadSize =ftnFile.get("uploadSize"),
            uploadPercent = ftnFile.get("uploadPercent"),
            vid = ftnFile.get("vid");
            fio.errorCode=errorCode;
            fio.name=name;
            fio.size=size;
            fio.fileSize=FtnUploader.getSizeString(size);
            if(status=='scanning'){
                fio.percent=signPercent?signPercent:0;
                fio.processedSize=fio.percent*0.01*fio.size;
            }
            if(status=='uploading'){
                fio.percent=uploadPercent?uploadPercent:0;
                fio.averageSpeed = fio.instantSpeed =  uploadSpeed?FtnUploader.getSizeString(uploadSpeed*1024):0;
                fio.processedSize=uploadSize?FtnUploader.getSizeString(uploadSize):0;
            }
            if(status=='successed'){
                fio.vid=vid;
            }
            fio.uid=ftnFile.id;
            return fio;
        }
        var $pick=FtnUploader.generetePick();

        var ftnH5Uploader =  new FtnUploader($.extend(_this.options,{

            pick : $pick[0],//文件input按钮，可以单个dom，或者domid，也可以是数组
            //默认选择文件后自动上传
            // auto : false,

            /**
             * ie/edge必选
             * hash_worker.js的绝对地址(还必须注意跨域问题)，默认是相对地址（./hash_worker.js），
             * https://connect.microsoft.com/IE/feedback/details/801810/web-workers-from-blob-urls-in-ie-10-and-11
             */
            hashWorkerUrl : "//om.qq.com/assets/hash_worker.min.js",
            acceptExtensions:'f4v,mp4,wmv,mp3,wav,mpg,mpeg,mpe,3gp,mov,m4v,avi,dat,flv,mkv,rmvb',
            events : {
                
                /**
                 * 组件初始化回调，可选
                 */
                uploaderInit : function(initMessage){
                        console.log("uploaderInit:", initMessage);
                },

                //------------------  文件input按钮 START, 均可选----------------->
                /**
                 * 文件input按钮， change事件，可选
                 */
                change : function(){
                    return true;
                },
                //------------------  文件input按钮 END           ----------------->
                /**
                *  文件被选择操作
                */
                filesSelect :function(fioArr){
                    startime = Date.now();
                    if (fioArr && fioArr.length > 0) {
                        if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                            var maxNumber = g_userInfo.mediaLevel <= 2 ? 3 : 5
                            if (fioArr.length + $('.multivideoform').length > maxNumber) {
                                layer.msg("最多可同时上传" + maxNumber + "个视频");
                                return;
                            } else {
                                var starinfo = {
                                    len: fioArr.length,
                                    data: []
                                };
                                for (var i = 0, len = fioArr.length; i < len; i++) {
                                    //console.log(fioArr[i]['uid']);
                                    starinfo.data.push(fioArr[i]['uid']);
                                }
                                //console.log('startinfo:' + JSON.stringify(starinfo));
                                $(document).trigger("om-multivideo-publish-show");
                                $(document).trigger("om-multivideo-publish-upload-start", starinfo);
    
                            }
                        } else {
                            if (fioArr.length > 1) {
                                layer.msg("每次上传只能上传一个文件");
                                return;
                            }
                        }
                        if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                            _this.states = {}
                            for (var i = 0, len = fioArr.length; i < len; i++) {
                                (function(fio) {
                                    if (fio.errorCode != 0) {
                                        processError(fio.errorCode, FtnUploader.getErrorMsg(fio.errorCode));
                                        $(document).trigger("om-multivideo-cancel-upload-start", {
                                            _fio: fio,
                                            _state: _this.states[fio.uid]
                                        });
                                    } else {
                                        //if (tvu.addToQueue(fio)) {
                                        //    tvu.startQueue();
                                            var _state = {};
                                            _state.status = "scanning";
                                            _state.percent = "0%";
                                            _state.title = fio.name;
                                            _state.showCancel = false;
                                            _state.fileSize = fio.fileSize;
                                            _state.startTime = Date.now();
                                            _state.uid=fio.uid;
                                            _this.states[fio.uid] = _state;
    
                                            $(document).trigger("om-multivideo-publish-upload", {
                                                _fio: fio,
                                                _state: _this.states[fio.uid]
                                            });
                                            //console.log('scanning:' + JSON.stringify(_this.states[fio.uid]));
                                            _this.onstart && _this.onstart(fio);
                                            _this.update(fio);
                                        //}
                                    }
                                }(fioAdapter(fioArr[i]),'scanning'));
                            }
                        } else {
                            // 非视频文章
                            for (var i = 0, len = fioArr.length; i < len; i++) {
                                (function(fio) {
                                    if (fio.errorCode != 0) {
                                        var message = processError(fio.errorCode, FtnUploader.getErrorMsg(fio.errorCode));
    
                                        $(document).trigger("om-video-publish-upload-error", { message: message });
                                    } else {
                                        //if (tvu.addToQueue(fio)) {
                                        //    tvu.startQueue();
                                            _this.state = {};
                                            _this.state.uid=fio.uid;
                                            _this.state.status = "scanning";
                                            _this.state.percent = "0%";
                                            _this.state.title = fio.name;
                                            _this.state.showCancel = false;
                                            _this.state.fileSize = fio.fileSize;
                                            _this.state.startTime = Date.now();
    
                                            $(document).trigger("om-video-publish-upload", fio);
                                            _this.onstart && _this.onstart(fio);
                                            _this.update(fio);
                                        //}
                                    }
                                }(fioAdapter(fioArr[i])),'scanning');
                            }
                        }
    
                    }
                    return true;
                },
                /**
                *  添加文件到队列之前操作，可选
                */
                fileBeforeAdd : function(file){

                    //console.log(name, "[fileBeforeAdd]");
                    return true;
                },

                /**
                *  添加文件到队列操作，可选
                */
                fileAdd : function(ftnFile){//onFileStart
                    var fio=fioAdapter(ftnFile,'scanning');
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        if (!_this.states[fio.uid]) {
                            _this.states[fio.uid] = {};
                            _this.states[fio.uid].title = fio.name;
                            _this.states[fio.uid].fileSize = fio.fileSize;
                        }
                        _this.states[fio.uid].uid=fio.uid;
                        _this.states[fio.uid]['status'] = "scanning";
                        //console.log('scanning:' + JSON.stringify(_this.states[fio.uid]));
                    } else {
                        if (!_this.state) {
                            _this.state = {};
                        }
                        _this.state.status = "scanning";
                        _this.state.uid=fio.uid;
                    }
                    _this.update(fio);
                },

                /**
                *  文件扫描过程的不断回调，可选
                */
                fileSign: function(ftnFile) { //onFileScanProgress
                    var fio=fioAdapter(ftnFile,'scanning');
                    //console.log('fio.percent',fio.percent);
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        if (!_this.states[fio.uid]) {
                            _this.states[fio.uid] = {};
                            _this.states[fio.uid].title = fio.name;
                            _this.states[fio.uid].fileSize = fio.fileSize;
                        }
                        _this.states[fio.uid].uid=fio.uid;
                        _this.states[fio.uid]['status'] = "scanning";
                        fio.averageSpeed = FtnUploader.getSizeString(parseInt(fio.processedSize*1000  / (Date.now() - _this.states[fio.uid].startTime)));
                        _this.states[fio.uid].percent = parseInt(fio.percent) + '%';
                        _this.states[fio.uid].processedSize = FtnUploader.getSizeString(fio.processedSize);
                        _this.states[fio.uid].instantSpeed = fio.averageSpeed + '/S';
                        _this.states[fio.uid]._averageSpeed = fio.averageSpeed;
                        _this.states[fio.uid].averageSpeed = fio.averageSpeed + '/S';
    
                        // console.log('onFileScanProgress:'+JSON.stringify(_this.states[fio.uid]));
    
                        // console.log(_this.states[fio.uid].averageSpeed);
                        _this.update(fio);
                        _this.onscan && _this.onscan(fio);
                    } else {
    
                        if (!_this.state) {
                            _this.state = {};
                        }
                        _this.state.status = 'scanning';
                        _this.state.uid=fio.uid;
                        fio.averageSpeed = FtnUploader.getSizeString(parseInt(fio.processedSize*1000  / (Date.now()  - _this.state.startTime)));
                        _this.state.percent = fio.percent + '%';
                        _this.state.processedSize = FtnUploader.getSizeString(fio.processedSize);
                        _this.state.instantSpeed = fio.averageSpeed + '/S';
                        _this.state._averageSpeed = fio.averageSpeed;
                        _this.state.averageSpeed = fio.averageSpeed + '/S';
    
    
                        _this.update(fio);
                        _this.onscan && _this.onscan(fio);
                    }
                },
                /**
                *  文件扫描过程后调用ftn接口创建索引，必选
                */
               createFile : function(ftnFile, callBack){

                var self = this,
                    size = ftnFile.get("size"),
                    name = ftnFile.get("name"),
                    sha  = ftnFile.get("sha"),
                    md5  = ftnFile.get("md5"),
                    apiInitUpload=self.options.apis.initUpload,
                    uploadFileBlockSize=self.options.uploadFileBlockSize,
                    uploadSource=self.options.uploadSource;
                    sUrl = [
                        apiInitUpload,
                        "?",

                        "fileSize=", 
                        size,

                        "&fileName=", 
                        name,

                        "&fileMd5=",
                        md5,

                        "&fileSha=",
                        sha,

                        "&agreedSize=",
                        uploadFileBlockSize,

                        "&uploadSource=",
                        uploadSource

                        ].join("");
                    $.ajax(sUrl, {
                        method : "GET",
                        headers : {
                            'If-Modified-Since': '0',
                            'Cache-Control' : 'no-cache, max-age=0'
                        },
                        success : function(responseData, xhr){
                            var res = eval("("+(responseData||"{}")+")")

                            if (res && res.code == "0"){

                                callBack(true,{
                                    fileKey : res.result.uploadKey,    // 请求ftn创建的文件唯一key
                                });
                            }else{
                                console.log(FtnUploader.getErrorMsg(res.code));
                                var errorData=new Error("create fail : errcode " + res.code);
                                errorData.code=res.code;
                                callBack(false,errorData);
                            }
                        },
                        error : function(xhr, err){
                            var errorData=new Error("create fail :"+xhr.status);
                                errorData.code=xhr.status;
                            callBack(false,errorData);
                        }
                    });
                
                },

                /**
                *  文件上传过程的不断回调，可选
                */
                fileUpload : function(ftnFile){//onFileUploadProgress
                    var fio=fioAdapter(ftnFile,'uploading');
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        if (!_this.states[fio.uid]) {
                            _this.states[fio.uid] = {};
                            _this.states[fio.uid].title = fio.name;
                            _this.states[fio.uid].fileSize = fio.fileSize;
                        }
                        _this.states[fio.uid]['status'] = "uploading";
                        _this.states[fio.uid].instantSpeed = fio.instantSpeed + '/S';
                        _this.states[fio.uid].averageSpeed = fio.averageSpeed + '/S';
                        _this.states[fio.uid].processedSize = fio.processedSize;
                        _this.states[fio.uid].percent = parseInt(fio.percent) + '%';
                        _this.update(fio);
    
                        // console.log('onFileUploadProgress:'+JSON.stringify(_this.states[fio.uid]));
                        _this.onupload && _this.onupload(fio);
                    } else {
    
                        if (!_this.state) {
                            _this.state = {};
                        }
                        _this.state.status = 'uploading';
                        _this.state.instantSpeed = fio.instantSpeed + '/S';
                        _this.state.averageSpeed = fio.averageSpeed + '/S';
                        _this.state.processedSize = fio.processedSize;
                        _this.state.percent = fio.percent + '%';
                        _this.update(fio);
    
                        _this.onupload && _this.onupload(fio);
                    }
                },
                /**
                *  文件暂停时的回调，可选
                */
                filePaused : function(file){
                    var name = file.get("name");

                    console.log(name, "[filePaused]: ");
                    $("#"+file.id+"_desc").html(["暂停中"].join(""));
                },

                /**
                *  取消文件上传时的回调，可选
                */
                fileCanceled : function(file){
                    var name = file.get("name");

                    console.log(name, "[fileCanceled]: ");
                    $("#"+file.id).remove();
                },
                /**
                *  文件上传完后，给后台发送通知成功的回调，可选
                */
                fileCompleteNoticeSuc : function(ftnFile){//onFileSuccess
                    var fio=fioAdapter(ftnFile,'successed');
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        if (!_this.states[fio.uid]) {
                            _this.states[fio.uid] = {};
                            _this.states[fio.uid].title = fio.name;
                            _this.states[fio.uid].fileSize = fio.fileSize;
                        }
                        _this.states[fio.uid].status = "successed";
                        _this.states[fio.uid].percent = '100%';
                        _this.states[fio.uid].vid = fio.vid;
                        //console.log('successed:' + JSON.stringify(_this.states[fio.uid]));
                    } else {
    
                        if (!_this.state) {
                            _this.state = {};
                        }
                        _this.state.status = "successed";
                        _this.state.percent = '100%';
                        _this.state.vid = fio.vid;
                    }
                    _this.update(fio);
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        $(document).trigger("om-multivideo-publish-upload-success", {
                            _fio: fio,
                            _state: _this.states[fio.uid]
                        });
                    } else {
                        $(document).trigger("om-video-publish-upload-success", fio.vid);
                    }
                    videoapi.report({
                        interface: "upload", // 请求的url
                        desc: "视频上传", // 描述
                        errorcode: 0, // 错误码
                        errormsg: "上传成功", //错误信息
                        params: "{}", // 请求参数
                        reponse: "{}", // 请求返回
                        vid: fio.vid,
                        timeconsume: Date.now() - startime
                    });
                    _this.onsuccess && _this.onsuccess(fio);
    
                },
                /**
                *  文件上传过程中错误的回调，可选
                */
                fileError: function(ftnFile) {//onFileError
                    var fio=fioAdapter(ftnFile,'error');
                    // 火狐浏览器黑库－1014 强转4025 待 aprical
                    // 上线新版flash后去掉这段代码，相关风险已告知，confirmed by @张艳
                    // 2016-12-5
                    if (fio.errorCode == '-1014') {
                        fio.errorCode = '4025';
                    }
    
    
                    // 媒资平台后台接口特殊需求,他们的错误值一直是30，并且错误码在errorMsg....需转码
                    if (fio.errorCode == '30' && /\((\d*)\)/.test(fio.errorMsg)) {
                        var mt = fio.errorMsg.match(/\((\d*)\)/);
                        if (mt && mt[1]) {
                            fio.errorCode = fio.errorMsg.match(/\((\d*)\)/)[1];
                        }
                    }
                    var message = "",
                        code = fio.errorCode;
                    // 出错了
                    if (fio.errorCode != '4025') {
                        //产品需求命中黑库时不弹黑框
                        message = processError(fio.errorCode, FtnUploader.getErrorMsg(fio.errorCode));
                    }
    
                    var duplidata = get_dupli_info(fio);
                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                        if (!_this.states[fio.uid]) {
                            _this.states[fio.uid] = {};
                            _this.states[fio.uid].title = fio.name;
                            _this.states[fio.uid].fileSize = tvu.getSizeString(fio.size);
                        }
                        _this.states[fio.uid].status = "error";
                        _this.states[fio.uid].errorCode = fio.errorCode;
                        _this.states[fio.uid].errorMsg = fio.errorMsg;
                        _this.states[fio.uid].dupli_info = duplidata.dupli_info;
                        var errorInfo = {
                            _state: _this.states[fio.uid],
                            _fio: fio,
                            message: message,
                            code: code,
                        }
    
                        $(document).trigger("om-multivideo-publish-upload-error", errorInfo);
    
                        // if (fio.errorCode != '4025') {
                        //     $(document).trigger("om-multivideo-cancel-upload-start", {
                        //         _fio: fio,
                        //         _state: _this.states[fio.uid]
                        //     });
    
                        // } else {
    
                        // }
                    } else {
                        if (!_this.state) {
                            _this.state = {};
                        }
                        _this.state.status = "error";
                        _this.state.errorCode = fio.errorCode;
                        _this.state.errorMsg = fio.errorMsg;
                        _this.state.dupli_info = duplidata.dupli_info;
    
                        $(document).trigger("om-video-publish-upload-error", {
                            code: code,
                            message: message,
                        });
                    }
                    console.log('error:' + JSON.stringify(_this.states[fio.uid]));
                    _this.update(fio);
                    
                    if (duplidata.aimOrigin || duplidata.aimRepeat) {
                        var $copyBtn = _this.$el.find('[data-clipboard-text]');
                        ZeroClipboard.config({
                            swfPath: '//om.gtimg.cn/om/om_2.0/libs/jquery.ZeroClipBoard/ZeroClipboard20161009.swf'
                        });
                        _this.zclip = new ZeroClipboard($copyBtn);
                        _this.zclip.on("ready", function(readyEvent) {
                            _this.zclip.on("aftercopy", function(event) {
                                layer.msg('复制成功', {
                                    icon: 1
                                });
                            });
                        });
                    }
                }
            }
        }));
        //console.log('ftnH5Uploader',ftnH5Uploader);
        ftnH5Uploader.pleaseSelectFile=function(){
            if(capacityCheck()){
                $pick.val('');//每次清空，确保可以继续上传同一个文件
                $pick[0].click();
            }
        };
        //适配腾讯视频上传方法
        window.tvu={
            cancelQueue:function(){
                ftnH5Uploader.cancelAll();
            },
            cancelQueueOne:function(fileId){
                ftnH5Uploader.cancel(fileId);
            },
            openSelectFileWindow:function(){
                ftnH5Uploader.pleaseSelectFile();
            }
        };
        _this._uploader=ftnH5Uploader;
        return ftnH5Uploader;
    }

    function get_dupli_info(fio) {
        // var dupli_info = null;
        var aimOrigin = false;
        var aimRepeat = false;
        var dupli_info = $.extend(
            [], [{
                isblack: 1
            }], fio.dupli_info);
        var _black = [],
            _repeat = [],
            origin = [];
        for (var i = 0, l = dupli_info.length; i < l; i++) {
            var v = dupli_info[i];
            if (v.isblack) {
                _black.push(v);
            } else if (v.isori) {
                origin.push(v);
            } else if (v.vid) {
                _repeat.push(v);
            }
        };
        if (_black.length) {
            dupli_info = _black;
        } else if (origin.length) {
            dupli_info = origin;
            aimOrigin = true;
        } else if (_repeat.length) {
            aimRepeat = true;
        }
        return {
            dupli_info: dupli_info,
            aimOrigin: aimOrigin,
            aimRepeat: aimRepeat
        }
    }

    function processError(code, msg) {
        videoapi.report({
            interface: "upload", // 请求的url
            desc: "视频上传", // 描述
            errorcode: code, // 错误码
            errormsg: msg, //错误信息
            params: "{}", // 请求参数
            reponse: "{}", // 请求返回
            timeconsume: Date.now() - startime
        });
        if(window.isFtnUploader){
            layer.msg(msg, {
                icon: 2
            });
            return msg;
        }

        var ErrorCode = {
            "1001": "帐号未登录，请刷新页面重试",
            "1791": "上传服务繁忙，请稍后重试，如不能解决请联系客服，错误码1791",
            "5001": "你今天上传视频量已达上传限额，请明天再继续上传",
            "5002": "你已在1小时内上传了40个视频，上传过于频繁，请歇一歇再上传",
            "7000": "不支持所上传的视频格式，请确认选择的文件无误",
            "7001": "上传视频文件没有拓展名，请检查后重试",
            "7002": "上传文件名长度超过限制，请修改文件名长度后重新上传",
            "7003": "上传文件超过限制大小，请压缩视频至4GB以内重新上传",
            "7004": "上传视频文件为空，请检查后重试",
            "8001": "视频上传失败，请稍后重试（错误码8001）",
            "8002": "视频上传失败，请稍后重试（错误码8002）",
            "8003": "视频上传失败，请稍后重试（错误码8003）",
            "9002": "视频上传失败，请稍后重试（错误码9002）",
            "9003": "视频上传失败，请稍后重试（错误码9003）"
        };
        var Messsages = {
            "1702": "服务繁忙，请重试，如不能解决请联系客服，错误码1702",
            "1752": "flash异常，请更换浏览器，如不能解决请联系客服，错误码1752",
            "9004": "文件名含空格，请修改后重试",
            "-5987": "文件名包含特殊符号，请修改后重试",
            "-5990": "上传网络异常，请检查后重试，错误码-5990",
            "20503": "上传接口异常，请重试，如不能解决请联系客服，错误码20503",
            "-1": "上传网络异常，请检查网络后重新上传",
            "1750": "视频文件大小不正确，请检查后重试，错误码1750",
            "1751": "上传网络异常，请稍后重试，如不能解决请联系客服，错误码1751",
            "1754": "上传服务繁忙，请稍后重试，如不能解决请联系客服，错误码1754",
            "1755": "上传文件异常，请稍后重试",
            "1756": "上传文件出错，请联系客服解决，错误码1756",
            "1758": "文件大小为0，请检查后重试",
            "1759": "文件格式异常，请修改后重试，如不能解决请联系客服，错误码1759",
            "1800": "上传服务繁忙，请稍后重试，如不能解决请联系客服，错误码1800",
            "100003": "上传接口异常，请重试，如不能解决请联系客服，错误码100003",
        };
        if (ErrorCode.hasOwnProperty(code)) {
            msg = ErrorCode[code] || msg;
            layer.msg(msg + "(" + code + ")", {
                icon: 2
            });
        } else if (Messsages.hasOwnProperty(code)) {
            msg = Messsages[code] || msg;
            layer.msg(msg + "(" + code + ")", {
                icon: 2
            });
        } else {
            msg = msg || "系统出错";
            layer.msg(msg + "(" + code + ")");
        }
        return msg;
    }

    var VideoUploader = function(options) {
        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i];
            }
        }
        this.options = options;
        this.$el = this.$wrap = options.$el.constructor == String ? $('#' + options.$el) : $(options.$el);
        this.template = options.template || function(data) {
            return template("videouploader", data);
        };
        this.init(options);
    };

    VideoUploader.prototype = {
        states: {},
        state: {},
        event: {},
        init: function(options) {
            var _this = this;
            if(window.isFtnUploader){
                initFtnUploader(this);
            }else{
                initUploader(this);
            }
            // _this.$el.on("click", ".tooltip-inlineblock button", function() {
            //     if ($(this).hasClass("btn-primary")) {
            //         $(document).trigger("om-video-publish-upload-cancel");
            //         tvu.cancelQueue();
            //         _this.oncancel && _this.oncancel();
            //     }
            //     _this.state.showCancel = false;
            //     _this.update();
            //     return false;
            // });

            _this.$el.on("click", "[action='cancel']", function() {
                var content = '<div class="tooltip-confirm"><div class="tooltip-inner clearfix"><p class="text">请确认是否取消正在上传的视频？</p><div class="action"><button type="button" class="btn btn-primary btn-sm">确定</button><button type="button" class="btn btn-sm">取消</button></div></div></div>';
                var fileId = $(this).attr('data-fileId');
                layer.tips(content, $(this), {
                    tips: 3,
                    maxWidth: 300, //默认值210 出现样式错乱
                    success: function($container, index) {
                        $container
                            .on("click", ".btn", function() {
                                if ($(this).hasClass("btn-primary")) {
                                    if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                                        $(document).trigger("om-multivideo-publish-upload-cancel");
                                    } else {
                                        $(document).trigger("om-video-publish-upload-cancel");
                                    }
                                    tvu.cancelQueue();
                                    _this.oncancel && _this.oncancel();
                                }
                                layer.close(index);
                                return false;
                            });
                    },
                    time: 5000
                });
                return false;
            });


            _this.$el.on("click", "[action='reset']", function() {
                if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                    $(document).trigger("om-multivideo-publish-upload-cancel");
                } else {
                    $(document).trigger("om-video-publish-upload-cancel");
                }
                return false;
            });

            $(document).on("click", function(e, data) {
                if (_this.$el.find(".tooltip-inlineblock").is(":visible")) {
                    _this.state.showCancel = false;
                    _this.update();
                }
            });
            //只要浮层关闭，就尝试的把上传的文件取消掉吧
            $(document).on("click",".layui-layer-close",function(e,data){
                try{
                    tvu.cancelQueue();
                }catch(e){

                }
            });
        },
        render: function(fio) {
            if (location.hash == '#/!/view:article?typeName=multivideos' || location.href.indexOf('articleScope=2') >= 0) {
                this.states[fio.uid].uid = fio.uid;
                $(document).trigger("om-multivideo-publish-upload-render", this.states[fio.uid]);
            } else {
                
                $(document).trigger("om-video-publish-upload-render", this.state);
            }
        },
        update: function(fio) {

            // state 检查操作
            // 控制更新频率
            if (this.updatetime && (Date.now() - this.updatetime) < 200) {

            } else {
                this.render(fio);
                this.updatetime = Date.now();
            }
        },
        get: function() {

        },
        set: function() {

        },
        hide: function() {
            this.$el.hide();

            if (this.zclip) {
                $('.global-zeroclipboard-container').css({ zIndex: 1 });
            }
        },
        show: function() {
            this.$el.show();

            if (this.zclip && this.$el.find('[data-clipboard-text]').length) {
                $('.global-zeroclipboard-container').css({ zIndex: 999999 });
            }
        }
    };
    return VideoUploader;
});