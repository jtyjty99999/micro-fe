// 我的版权素材页接口
define(function (require, exports, module) {
    return {
        // 获取素材列表
        getCreationList: function(data = {}, callback) {
            return utils.request({
                type: 'get',
                url: '/copyrightCreation/list',
                dataType: 'json',
                data,
                error: function (res) {
                    console.log('err res...', res);
                    window.popAlert('error', `获取素材列表失败${res.msg}`);
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 获取某一片单素材详情列表
        getCreationDetailList: function (data = {}, callback) {
            return utils.request({
                type: 'get',
                url: '/copyrightCreation/detailList',
                dataType: 'json',
                data,
                error: function (res) {
                    console.log('err res...', res);
                    window.popAlert('error', `获取详情列表失败${res.msg}`);
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
    };
});