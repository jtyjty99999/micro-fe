/**
 * Created by jonahnzhang on 2016/4/21.
 */
define(function (require, exports, module) {


    /**
     * 继续发布
     *
     * @params data {Object} data 参数
     * @params articleId {number} pageNo
     * @params simiArticleId {number} pageSize
     */
    exports.refArticlePublish = function(data) {
        return $.ajax({
            type: 'post',
            url: '/article/refArticlePublish',
            dataType: 'json',
            data: data
        })
    };

})
