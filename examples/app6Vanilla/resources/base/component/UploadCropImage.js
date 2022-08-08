/**
 * Created by xiabingwu on 2016/4/11.
 * 自定义模板的话必须提供uploadPlaceholder作为图片上传占位符
 */
define(function (require, exports, module) {
    var componentTemplate=require('base/component/template');
    var omlayer=require('layer/layer');
    var picApi=require('base/api/pic');
    var UploadImage=require('base/component/UploadImage');
    function UploadCropImage(params,callback){
        var config={
            templateName:'uploadCropImage',
            omlayer:{
                width:'auto',//具体像素的话，必须带px
                height:'auto',//具体像素的话，必须带px
                title:''
            },
            jcrop:{
                cropWidth:130,
                cropHeight:130,
                boxWidth:276,
                boxHeight:190
            },
            checkQrcode:false//默认不验证二维码
        };
        $.extend(true, config, params);
        if(!$.isFunction(callback)){
            callback=function(){};
        }
        var random=Math.floor(Math.random()*10000000);
        var omlayerIndex=-1;
        var imageData={};//上传图片后，后台返回的图片数据
        var imageOriginalId='imageOriginal'+random;
        var imageSquareId='imageSquare'+random;
        var imageCircleId='imageCircle'+random;

        var $layer;
        var $imageOriginal;
        var $imageSquare;
        var $imageCircle;

        var jcropApi;
        var currentCoords={};

        var uploadImageInstance;

        var imageIsUpload=false;
        //初始化裁剪
        function initJcrop(){
            var cropWidth=config.jcrop.cropWidth;//裁剪宽度
            var cropHeight=config.jcrop.cropHeight;//裁剪高度
            var aspectRatio=cropWidth/cropHeight;
            var boxWidth=config.jcrop.boxWidth;//画布宽度
            var boxHeight=config.jcrop.boxHeight;//画布高度
            var bounds, boundx, boundy;
            var jcropHolderBgColor='black';//默认背景色
            $imageSquare.add($imageCircle).attr('src',imageData.imageResultUrl).removeAttr('style');
            try{
                //连续又上传了图片，先销毁掉它
                jcropApi.destroy();
            }catch(e){}
            try{
                //清除上次图片影响
                $imageOriginal.attr('src','').removeAttr('style');
            }catch(e){}
            if(imageData.data&&imageData.data.type==3){//如果图片类型是png
                jcropHolderBgColor='';
            }
            $imageOriginal.attr('src',imageData.imageResultUrl.replace(/^https?:/i,''));
            setTimeout(function () {
                $imageOriginal.Jcrop({
                    onChange: showPreview,
                    onSelect: showPreview,
                    bgColor:jcropHolderBgColor,
                    addClass: 'jcrop-centered',
                    boxWidth:boxWidth,
                    boxHeight:boxHeight,
                    aspectRatio: aspectRatio
                },function(){
                    jcropApi = this;
                    bounds = jcropApi.getBounds();
                    boundx = bounds[0];
                    boundy = bounds[1];
                    if(boxHeight>=boundy){
                        $layer.find(".jcrop-holder").css({
                            top : (boxHeight - boundy)/2+"px"
                        });
                    }
                    if(boundx/boundy>aspectRatio){
                        jcropApi.setSelect([0, 0, boundy*aspectRatio, boundy]);
                    }else{
                        jcropApi.setSelect([0, 0, boundx, boundx/aspectRatio]);
                    }
                });
                function showPreview(coords)
                {
                    if (parseInt(coords.w) > 0)
                    {
                        var rx = cropWidth / coords.w;
                        var ry = cropHeight / coords.h;

                        $imageSquare.add($imageCircle).css({
                            width: Math.round(rx * boundx) + 'px',
                            height: Math.round(ry * boundy) + 'px',
                            marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                            marginTop: '-' + Math.round(ry * coords.y) + 'px'
                        });
                    }
                    //console.log(coords);
                    currentCoords=coords;
                };
            },100);


        }

        //服务端裁剪URL链接图片
        function serverCropImage(){
            var params={
                appkey:1,
                opCode:150,
                url:imageData.imageResultUrl,
                cropX:parseInt(currentCoords.x),
                cropY:parseInt(currentCoords.y),
                cropWidth:parseInt(currentCoords.w),
                cropHeight:parseInt(currentCoords.h)
            };
            $.extend(true,params,config.reportData);
            //只要有一个参数异常就不提交给后台，把问题留在前端
            if(isNaN(params.cropX+params.cropY+params.cropWidth+params.cropHeight)){
                console.log('uploadcropimage:',params.cropX,params.cropY,params.cropWidth,params.cropHeight);
                omlayer.msg("图片上传失败(参数异常)",{icon: 2});
                return ;
            }
            if(!params.url){
                omlayer.msg("请选择图片",{icon: 3,time:1000});
                return ;
            }
            var loadingLayerIndex=omlayer.msg('正在裁剪',{
                icon:4,
                time: 10000
            });
            picApi.cropUpload(params).done(function(res){
                omlayer.close(loadingLayerIndex);
                omlayer.close(omlayerIndex);
                if(res.response.code!=0){
                    if(res.response.code==17000){//http://tapd.oa.com/OMQQ/prong/stories/view/1010116611062514087
                        omlayer.msg("您的头像不符合平台规定，请重新上传。",{icon: 2});
                    } else {
                        omlayer.msg("图片上传失败",{icon: 2});
                    } 
                }
                callback({
                    imageResultUrl:res['data']['200200']
                });
            }).fail(function(){
                omlayer.close(omlayerIndex);
            });
        }
        //设置浮层
        function set$Layer(){
            imageIsUpload=false;
            omlayerIndex=omlayer.open({
                type: 1,
                title:[config.omlayer.title,'border-bottom:1px solid #e9eef4;'],
                closeBtn:1,
                area: [config.omlayer.width, config.omlayer.height],
                shadeClose: true, //点击遮罩关闭
                content: componentTemplate(config.templateName,{
                    imageOriginalId:imageOriginalId,
                    imageSquareId:imageSquareId,
                    imageCircleId:imageCircleId
                }),
                btn:['确定','取消'],
                yes:function(){
                    if(imageIsUpload){
                        serverCropImage();
                    }else{
                        omlayer.msg("请上传图片",{icon: 2});
                        return ;
                    }
                },
                cancel:function(){

                },
                end:function(){
                    eventUnBind();
                }
            });
            $layer=$('#layui-layer'+ omlayerIndex);
        }
        function set$Element(){
            $imageOriginal=$('#'+imageOriginalId);
            $imageSquare=$('#'+imageSquareId);
            $imageCircle=$('#'+imageCircleId);
        }
        //事件绑定
        function eventBind(){
            return ;
            // $layer.find(".pop-close").on("click", function () {
            //     omlayer.close(omlayerIndex);
            // });

        }
        //初始化本地图片上传
        function initUpload(){
            var loadingLayerIndex;
            uploadImageInstance = new UploadImage({
                pick: {
                    id: $layer.find('.uploadPlaceholder')},
                checkQrcode: config.checkQrcode,
                showLoading: false,
                uploadBeforeSendFirstStep:function(){
                    loadingLayerIndex=omlayer.msg('正在上传图片',{
                        icon:4,
                        time: 10000
                    });
                },
                formData: config.reportData||{}
            },function(data){
                imageData=data;
                if(imageData.imageResultUrl){
                    var img = new Image();
                    img.onload = function() {
                        omlayer.close(loadingLayerIndex);
                        $('.text-null').hide();//清除没有图片的时候文字提示
                        initJcrop();
                    }
                    img.onerror = img.onabort = function() {}
                    img.src = imageData.imageResultUrl;
                    imageIsUpload=true;
                }
            });
            uploadImageInstance.show();
        }
        //事件销毁
        function eventUnBind(){
            //销毁事件
            try{
                jcropApi.destroy();
            }catch(e){}
            try{
                uploadImageInstance.destroy();
            }catch(e){}
            $layer.find(".selPic").off('click');
            $layer.find(".pop-close").off('click');
        }
        this.show=function(){
            set$Layer();
            set$Element();
            eventBind();
            setTimeout(function(){
                initUpload();
            },1);
        };
    }
    return UploadCropImage;
});