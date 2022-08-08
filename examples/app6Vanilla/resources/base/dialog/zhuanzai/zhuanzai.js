define(function(require, exports, module) {
    // var base = require('base/base');
    var omtemplate = require('base/dialog/template');
    var omlayer = layer;
    var service = require('base/dialog/zhuanzai/service');

    var reasons = [{
        code: '-500002',
        desc: '允许文章转载',
        id: 'allowArticle'
    },{
        code: '-500001',
        desc: '禁止文章转载',
        id: 'notAllowArticle'
    },{
        code: '-500004',
        desc: '禁止文章转载',
        id: 'allowPicture'
    },{
        code: '-500003',
        desc: '禁止文章转载',
        id: 'notAllowPicture'
    }];


    function find(collection, index) {
        for (var i = 0, l = collection.length; i < l; i++) {
            var v = collection[i];
            var equalkeys = [];
            var allkeys = [];
            for(var x in index) {
                allkeys.push(x);
                if(v[x] === index[x]) {
                    equalkeys.push(x);
                }
            }
            if(equalkeys.length === allkeys.length) {
                return v;
            }
        }
    }

    exports.show = function (code, data, cb) {
        code = code + '';
        omlayer.open({
            type: 1,
            title:['温馨提示','border-bottom:1px solid #e9eef4;'],
            closeBtn:1,
            shadeClose: true,
            area: ['660px', 'auto'],
            shadeClose: true, //点击遮罩关闭
            content: omtemplate('zhuanzai/zhuanzai', {
                reason: find(reasons, { code: code}),
                data: data
            }),
            success: function($container, index) {

                //返回修改
                $('.pop-body .back-modify').on('click', function() {
                    omlayer.close(index);
                    if(!/articlePublish/.test(location.href)) {
                        window.open('/article/articlePublish?articleId='+ data.articleId +'&atype=' + data.articleType);
                    }
                })

                //继续发布
                $('.pop-body .pub-go-on').on('click', function() {
                    service.refArticlePublish({
                        articleId: data.articleId,
                        simiArticleId: data.simiArticleId,
                        publishTime: data.publishTime
                    }).then(function(resp){
                        omlayer.close(index);
                        if (resp.response.code == 0) {
                            // _OMReport(self.type, "timerelease", "success");
                            // self.publishSuccess();
                            layer.msg("发布成功", {
                                time: 1000,
                                icon: 1,
                                end: function() {
                                    // 不再提示
                                    window.onbeforeunload = function() {};
                                    top.location.href = "/article/articleManage";
                                }
                            });

                        } else {
                            if(cb) {
                                cb(resp);
                                // cb(resp.response.code, resp.response.msg, resp.data);
                            }
                        }
                    }).fail(function(){
                        layer.msg('继续发布失败!',{icon:1});
                    })
                })

                //文章申诉
                $('.pop-body .article-shensu').on('click', function() {
                    omlayer.close(index);
                    window.open("/article/articleFeedbackOriginal?article_id=" + data.simiArticleId, "_blank");
                })

                //图片申诉
                $('.pop-body .img-shensu').on('click', function() {
                    omlayer.close(index);
                    alert('TBD:  ...');
                })
            }
        });

    }
})
