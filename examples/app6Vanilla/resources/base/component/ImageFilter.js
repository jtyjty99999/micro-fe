define(function(require, exports, module) {
    var uploadImageSimple = require('base/component/UploadImageSimple');
    var videoapi = require('base/api/video');
    var acceptExtensions = "png,jpg,jpeg,webp";
    var componentTemplate = require('base/component/template');
    var omui = window.omui;
    var imgfilter;
    if (omui) {
        imgfilter = omui.imgfilter;
    }

    function load() {
        return $.getScript(location.protocol + "//om.gtimg.cn/om/omui/lib/5ca4d7cd.imgfilter.js");
    }

    // exports = module.exports =  function(src, width, height, max) {
    exports.run = function(opt) {
        var option = $.extend({}, {
            src: '',
            hight: 0,
            width: 0,
            max: 0.2, //最大打码面积
            task: "editor|base64|cover"
        }, opt)
        return $.Deferred(function(defer) {
            if (!omui || !imgfilter) {
                load()
                    .then(function() {
                        omui = window['omui'];
                        imgfilter = omui.imgfilter;
                        return ImageFilter(option)
                            .then(defer.resolve)
                            .fail(defer.reject);
                    })
            } else {
                return ImageFilter(option)
                    .then(defer.resolve)
                    .fail(defer.reject);
            }
        }).promise();
    };

    exports.support = function() {
        return $.Deferred(function(defer) {
            // 最新chrome 不支持马赛克工具
            // var flag = navigator.userAgent.match(/chrome\/(64)\./i);
            // if (flag && +flag[1] > 63) {
            //     return defer.reject({});
            // }
            if (!omui || !imgfilter) {
                load()
                    .then(function() {
                        omui = window['omui'];
                        imgfilter = omui.imgfilter;
                        return defer.resolve(imgfilter.support);
                    })
            } else {
                return defer.resolve(imgfilter.support);
            }
        }).promise();
    }

    /**
     * 马赛克滤镜
     */
    function ImageFilter(option) {

        var src = option.src;
        var width = option.width;
        var height = option.height;
        var max = option.max;
        var task = option.task || 'base64';

        //弹窗是动态高度，否则可以不用传 宽 高
        if (!src || !width || !height) {
            return layer.msg('参数传递错误!', { icon: 2 });
        }

        var cw = width;
        var ch = height;
        if (ch < 440) {
            ch = 440;
        }

        return $.Deferred(function(defer) {
            var filter;
            layer.open({
                type: 1,
                title: ['马赛克工具', 'border-bottom:1px solid #e9eef4;'],
                closeBtn: 1,
                shadeClose: true,
                skin: 'layer-ext-om mosaic',
                area: ['800px', (ch + 240) + 'px'],
                // area: ['800px', 'auto'],
                content: componentTemplate('imagefilter', {
                    width: cw,
                    height: ch
                }),
                btn: ['确定', '取消'],
                success: function(container, index) {
                    //图片url转64
                    $.ajax({
                        url: '/image/convertBase64',
                        data: {
                            url: src
                        }
                    }).then(function(base64data) {
                        var coele = $(container).find('.filter-con').html('');
                        var base64 = base64data.data;
                        base64 = 'data:image/jpg;base64,' + base64;
                        filter = imgfilter(coele, base64, width, height, max);
                        filter.onMaxAreaLimit = function(flag) {
                            if (flag == true) {
                                layer.msg('再打马赛克就看不清图了', { icon: 3 })
                            }
                        }

                    });
                },
                yes: function(index, container) {

                    var base64 = filter.getDataURL().replace(/^data:image[/]jpeg;base64,/, '');
                    var uploadurl = location.protocol + '//' + (location.hostname || location.host) + '/image/archscaleupload?isRetImgAttr=1&relogin=1'
                    switch (task) {
                        case 'base64':
                            defer.resolve(base64);
                            break;
                        case 'cover':
                            uploadurl = location.protocol + '//' + (location.hostname || location.host) + '/image/exactupload?appkey=1&opCode=157&isUpOrg=1&relogin=1'
                            uploadIMG(function(data) {
                                defer.resolve(data['1']);
                            })
                            break;
                        case 'editor':
                            uploadurl = location.protocol + '//' + (location.hostname || location.host) + '/image/archscaleupload?isRetImgAttr=1&relogin=1'
                            uploadIMG(function(data) {
                                defer.resolve(data.url.size['641'].imgurl);
                            });
                            break;
                        default:
                            defer.resolve(filter.getDataURL());
                    }

                    function uploadIMG(cb) {
                        $(container).find('.layui-layer-btn0').html('<i class="icon-loader"></i>提交中')
                        //图片上传到架平
                        $.ajax({
                            url: uploadurl,
                            type: "POST",
                            dataType: "json",
                            // contentType: "multipart/form-data",
                            data: {
                                base64: filter.getDataURL().replace(/^data:image[/]jpeg;base64,/, '')
                            }
                        }).then(function(res) {
                            if (res.response && res.response.code === 0) {
                                cb(res.data);
                                layer.close(index);
                            } else {
                                var msg = '提交异常'
                                if (res.response && res.response.code && res.response.msg) {
                                    msg += ' : (' + res.response.code + ')' + res.response.msg;
                                }
                                var code = res.response
                                $(container).find('.layui-layer-btn0').html('确定')
                                layer.msg(msg, { icon: 2 });
                                defer.reject(err);
                            }
                        }).fail(function(res) {
                            $(container).find('.layui-layer-btn0').html('确定')
                            layer.msg('提交过程发生异常', { icon: 2 });
                            defer.reject(err);
                        })
                    }
                }
            });
        }).promise();
    }
});