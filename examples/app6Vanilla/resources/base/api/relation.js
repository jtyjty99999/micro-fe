
// 账号关联接口
define(function (require, exports, module) {
    var offBlank = require('base/tool/replaceBlank');

    var relation = {
        // 获取微信公众号关联信息
        getWXGZHRelationList: function(param, callback) {
            var url = "/article/getWeixinInfo";
            return utils.request({
                type: "get",
                url: url,
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "获取微信公众号关联信息失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 获取其他第三方平台账号关联列表
        getThirdRelationList: function (param, callback) {
            var url = "/relation/list";

            return utils.request({
                type: "get",
                url: url,
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "获取第三方平台账号关联列表失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 修改当前关联账号信息
        editRelationInfo: function (params, callback) {
            return utils.request({
                type: "post",
                url: "/relation/update",
                dataType: "json",
                data: params,
                error: function (res) {
                    popAlert("error", "更新当前关联账号信息失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 新增第三方账号关联信息
        addRelationInfo: function (params, callback) {
            return utils.request({
                type: "post",
                url: "/relation/add",
                dataType: "json",
                data: params,
                error: function (res) {
                    popAlert("error", "新增关联账号信息失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 移除第三方账号关联信息
        removeRelationInfo: function (relationid, callback) {
            return $.ajax({
                type: "post",
                url: '/relation/unbind',
                dataType: "json",
                data: {
                    relationid: relationid
                },
                error: function (res) {
                    popAlert("error", "移除关联账号失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
    }

    return relation;
});