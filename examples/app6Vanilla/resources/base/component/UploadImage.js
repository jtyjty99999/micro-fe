/**
 * Created by xiabingwu on 2016/4/12.
 * showLoading当设置为false的时候请设置uploadBeforeSendFirstStep
 */
define(function (require, exports, module) {
    var componentTemplate=require('base/component/template');
    var omlayer=require('layer/layer');
    var picApi=require('base/api/pic');
    var mess=require('base/tool/mess');

    function UploadImage(params,callback){
        var self=this;
        var customServerPath=params.serverPath||'';
        delete params.serverPath;
        var config={//定义参数配置对象
            // 选完文件后，是否自动上传。
            auto: true,
            timeout:60000,
            // swf文件路径
            swf: '//om.gtimg.cn/om/om_2.0/libs/webuploader/Uploader.swf',
            // 文件接收服务端。
            server: customServerPath||'/image/orginalupload',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id:'#picker'
            },
            disableGlobalDnd: true,
            fileNumLimit: 100000,//上传个数设置为10万来表示无限上传
            fileVal:'Filedata',
            fileSingleSizeLimit:5*1024*1024,
            duplicate:true,//保证可以上传重复
            threads:5,
            // 只允许选择图片文件。
            accept: {
                title: 'Images',
                extensions: 'jpg,jpeg,png',
                mimeTypes: 'image/jpg,image/jpeg,image/png'
            },
            thumb:{
                width:150,
                height:120,
                crop: false,
                type: 'image/png'
            },
            formData: {},
            compress:false,
            checkQrcode:false,//默认不验证二维码
            showLoading:true,//默认显示loading
            uploadBeforeSendFirstStep:function(){//uploadBeforeSend函数执行的第一步

            }
        };
        $.extend(true, config, params);
        if(!$.isFunction(callback)){
            callback=function(){};
        }
        var uploader;
        var loadingLayerIndex;
        //添加参数
        function uploadBeforeSend(obj,data,header){
            config.uploadBeforeSendFirstStep();
            if(config.showLoading){
                loadingLayerIndex=omlayer.msg('正在上传图片',{
                    icon:4,
                    time: 40000
                });
            }
            data.appkey=1;
            data.isRetImgAttr=1;
            data.from='user';

            if(config.params){
                $.extend(data,config.params);
            }

            try{
                delete data.size;
            }catch(e){}
        }
        //上传成功
        function uploadSuccess(file,data){
            if(config.showLoading){
                omlayer.close(loadingLayerIndex);
            }
            if(!data){
                callback({
                    imageResultUrl:null
                });
                omlayer.msg('图片上传失败',{
                    icon:2
                });
                return ;
            }
            if (data.response["code"] == -7001) {
                callback({
                    imageResultUrl:null
                });
                omlayer.msg("图片不能大于5MB",{
                    icon:2
                });
                return ;
            }
            //http://tapd.oa.com/OMQQ/prong/stories/view/1010116611062514087
            if (data.response["code"] == 17000) {
                callback({
                    imageResultUrl:null
                });
                omlayer.msg("您的头像不符合平台规定，请重新上传。",{
                    icon:2
                });
                return ;
            }
            if (data.response["code"] != 0) {
                callback({
                    imageResultUrl:null
                });
                omlayer.msg('图片上传失败',{
                    icon:2
                });
                return;
            }
            if(config.checkQrcode){
                if(!!data.data.url.isqrcode &&data.data.url.isqrcode == '1'){
                    callback({
                        imageResultUrl:null
                    });
                    omlayer.msg('图片包含二维码，请重新上传',{
                        icon:2
                    });
                    return;
                }
            }
            var imageUrl ;
            try{
                imageUrl = data.data.url.url;
            }catch(e){

            }
            var base64 ;
            try{
                base64 = data.data.base64;
            }catch(e){

            }
            if(imageUrl){
                callback({
                    imageResultUrl: imageUrl,
                    data: data.data.url,
                    base64: base64
                });
            }else{
                callback({
                    imageResultUrl:null
                });
                omlayer.msg('图片上传失败',{
                    icon:2
                });
            }
        }
        function uploadError(file,reason){
            omlayer.close(loadingLayerIndex);
            callback({
                imageResultUrl:null
            });
            omlayer.msg("上传图片发生异常",{
                icon:2
            });
        }
        function error(type){
            switch (type){
                case 'Q_TYPE_DENIED':
                    omlayer.msg("上传图片类型不正确",{
                        icon:2
                    });
                    break;
                case 'F_EXCEED_SIZE':
                    omlayer.msg("上传图片超过大小"+mess.formatBytes(config.fileSingleSizeLimit,'MB')+"限制",{
                        icon:2
                    });
                    break;
                case 'Q_EXCEED_NUM_LIMIT':
                    omlayer.msg("上传图片超过个数限制",{
                        icon:2
                    });
                    break;
                default:
                    break;
            }
        }
        function uploadProgress(file,percentage){
            //console.log(percentage);
        }
        this.show=function(){
            if(typeof WebUploader.Base.browser.ie != 'undefined'){
                if(!mess.detectFlash()) {
                    omlayer.open({
                        type: 1,
                        title:[' '],
                        closeBtn:1,
                        shadeClose: true,
                        area: ['200px', '200px'],
                        content:'<div style="text-align:center;height:35px;">请安装<a href="//get.adobe.com/cn/flashplayer/" target="_blank">flash插件</a></div>',
                        btn:['确定']
                    });
                    return ;
                }
            }

            uploader=WebUploader.create(config);
            uploader.on("uploadBeforeSend",uploadBeforeSend);
            uploader.on("uploadProgress",uploadProgress);
            uploader.on("uploadSuccess",uploadSuccess);
            uploader.on("uploadError",uploadError);
            uploader.on("error",error);
//            uploader.addButton({
//                id: '.opIdCardPicBlock .text-mask'
//            });
            return uploader;
        };
        //销毁
        this.destroy=function(){
            uploader.destroy();
        }
    }
    return UploadImage;
});