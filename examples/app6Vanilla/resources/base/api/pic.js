
//图片处理
define(function (require, exports, module) {
    var picHandler={};
    picHandler.cropUpload=function (param) {
        return $.ajax({
            type: "get",
            url: '/image/cropupload',
            data: param,
            dataType: "json"
        });
    };
    return picHandler;

});