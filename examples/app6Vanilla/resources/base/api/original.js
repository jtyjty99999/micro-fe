// 原创接口
define(function(require, exports, module) {
    var video = {
        getVideoList: function(param) {
            var url = '/Omvideo/GetVideoList';
            // &num=6&page=1
            param.mediaid = g_userInfo.mediaId;
            return utils.request({
                type: "get",
                url: url,
                dataType: "json",
                data: param
            });
        }
    };
    return video;
});