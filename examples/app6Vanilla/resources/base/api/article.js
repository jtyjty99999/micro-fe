
// 文章处理接口
define(function(require, exports, module) {
    const offBlank = require('base/tool/replaceBlank');

    const article = {
        applyText2Pic: function(data) {
            let url = '/txt2Pic/convertToPic';
            return utils.request({
                type: 'POST',
                url: url,
                data: data,
                dataType: 'json'
            });

        },
        checkText2Pic: function(data) {
            let url = '/txt2Pic/checkConvertible';
            return utils.request({
                type: 'POST',
                url: url,
                data: data,
                dataType: 'json'
            });
        },
        // 视频文章批量发布
        articleBatchPublish: function(data) {
            let url = '/article/batchPublish';
            return utils.request({
                type: 'POST',
                url: url,
                data: data,
                dataType: 'json'
            });
        },
        getOutLinkList: function(data) {
            return utils.request({
                type: 'GET',
                url: '/MCNMedia/getouterlinklist',
                data: { status: 0 },
                dataType: 'json'
            });
        },
        // 视频文章批量保存
        articleBatchSave: function(data) {
            let url = '/article/batchSave';
            return utils.request({
                type: 'POST',
                url: url,
                data: data,
                dataType: 'json'
            });
        },
        'getCategoryList': (function() {
            let cache = null;

            function handler() {
                if (!cache) {
                    cache = utils.request({
                        url: '/article/categoryList'
                    });
                }
                return cache;
            }
            return handler;
        })(),
        getServerTimeUrl: function() {
            // var timeUrl = '/interface/time/getServerTime.php?t=' + new Date();
            return utils.request({
                type: 'get',
                url: '/article/serverTime',
                dataType: 'json'

            });
        },
        getArticleInfo: function(param) {
            param.media = g_userInfo.mediaId;
            return utils.request({
                type: 'get',
                url: '/article/info',
                dataType: 'json',
                data: param
            });
        },
        getArticleList: function(param, callback) {
            let url = '/article/list';

            function artListDataFilter(res) {
                return $.Deferred(function(dfd) {
                    let artsData = res;
                    let artsMapData = handleArtsData(res.data.articles);
                    if (!artsMapData.ids) {
                        dfd.resolve(artsData);
                    } else {
                        // // 粉丝必现检测
                        // $.ajax({
                        //     type: 'get',
                        //     url: '/article/getfansneedarticles',
                        //     dataType: 'json',
                        //     data: {
                        //         aid: artsMapData.ids
                        //     }
                        // }).then(function(res) {
                        //     let idsAr = artsMapData.ids.split(';');
                        //     // 更新粉丝必现字段后重写articles
                        //     let resArticleList = [];
                        //     if (res.response.code == '0') {
                        //         let fansneedData = res.data;
                        //         $.each(idsAr, function(i, id) {
                        //             artsMapData.map[id].fansneed = fansneedData[id] || -1;
                        //             resArticleList.push(artsMapData.map[id]);
                        //         });
                        //         artsData.data.articles = resArticleList;
                        //     } else {
                        //         dfd.reject();
                        //     }
                        //     console.log('artsData;;;', artsData, artsMapData);
                        //     dfd.resolve(artsData);
                        // }).fail(function() {
                        //     dfd.reject();
                        // });

                        dfd.resolve(artsData);
                    }

                    function handleArtsData(listData) {
                        let ids = [];
                        let map = {};
                        if (listData && listData.length) {
                            $.each(listData, function(i, itemrt) {
                                ids.push(itemrt.article_id);
                                map[itemrt.article_id] = itemrt;
                            });
                        }

                        return {
                            ids: ids.join(';'),
                            map: map
                        };
                    }
                }).promise();
            }
            let aa = true;
            return $.Deferred(function(dfd) {
                utils.request({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    data: param,
                    error: function(res) {

                    },
                    success: function(res) {
                        callback && callback(res);
                    }
                }).then(function(resp) {
                    if (resp.response.code == 0 && resp.data.articles.length > 0) {
                        artListDataFilter(resp)
                            .then(function(resp) {
                                dfd.resolve(resp);
                            })
                            .fail(function(err) {
                                dfd.reject(err);
                            });
                    } else {
                        dfd.resolve(resp);
                    }
                // eslint-disable-next-line
                }).fail(function(err) {
                    dfd.reject();
                });
            }).promise();

        },
        getAllArticleList: function(param, callback) {
            let url = '/article/list?index=' + param.curpage;
            let data = {
                category: 'published',
                index: param.curpage,
                num: param.perpage || 10
            };

            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: data
            });
        },
        getArticleHyperLinkList: function(param, callback) {
            let url = '/HyperLink/list?index=' + param.curpage;
            let data = {
                category: 'published',
                index: param.curpage,
                search: param.keyword,
                num: param.perpage || 10
            };

            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: data
            });
        },
        getDonationList: function(param, callback) {
            let url = '/HyperLink/DonationList?index=' + param.curpage;
            let data = {
                search: param.keyword,
                index: param.curpage
            };

            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: data
            });
        },
        /* 发文定时保存接口 */
        getArticleCache: function(param, callback) {
            param.media = g_userInfo.mediaId;
            return utils.request({
                type: 'get',
                url: '/editorCache/get?mediaid=' + param.media,
                dataType: 'json',
                // data: param,
                error: function(res) {
                    utils.ui.msg('error', '获取缓存文章失败');
                },
                success: function(res) {
                    callback && callback(res);

                }
            });
        },
        setArticleCache: function(param, callback) {
            param.mediaid = g_userInfo.mediaId;
            return utils.request({
                type: 'post',
                url: '/editorCache/update',
                dataType: 'json',
                data: $.extend({}, param, {
                    temp: null,
                    video_source_data: null
                }),
                success: function(res) {
                    callback && callback(res);
                }
            });
        },

        delArticleCache: function(param, callback) {
            param.media = g_userInfo.mediaId;
            return utils.request({
                type: 'get',
                url: '/editorCache/delete?mediaid=' + param.media,
                dataType: 'json'
            });
        },

        getPreviewData: function(param, callback) {
            param.media = g_userInfo.mediaId;
            return utils.request({
                type: 'post',
                url: '/article/saveAndPreview',
                dataType: 'json',
                data: param
            });
        },

        saveArticle: function(param) {
            if (!/typeName=videos/.test(location.hash)) {
                let title = param.title;
                title = offBlank.offStartBlank(title);
                title = offBlank.offThreeBlank(title);
                param.title = offBlank.intervalThreeBlank(title);
                let title2 = param.title2;
                title2 = offBlank.offStartBlank(title2);
                title2 = offBlank.offThreeBlank(title2);
                param.title2 = offBlank.intervalThreeBlank(title2);
            }
            return utils.request({
                type: 'post',
                url: '/article/save',
                dataType: 'json',
                data: $.extend({}, param, {
                    temp: null,
                    video_source_data: null
                })
            });
        },
        modifyArticle: function(param) {
            // 已发布文章修改接口
            return utils.request({
                type: 'post',
                url: '/ContentModify/modify',
                dataType: 'json',
                data: $.extend({}, param, {
                    temp: null,
                    video_source_data: null
                })

            });
        },
        publishArticle: function(param) {
            if (!/typeName=videos/.test(location.hash)) {
                let title = param.title;
                title = offBlank.offStartBlank(title);
                title = offBlank.offThreeBlank(title);
                param.title = offBlank.intervalThreeBlank(title);
                let title2 = param.title2;
                title2 = offBlank.offStartBlank(title2);
                title2 = offBlank.offThreeBlank(title2);
                param.title2 = offBlank.intervalThreeBlank(title2);
            }
            return utils.request({
                type: 'post',
                url: '/article/publish',
                dataType: 'json',
                data: $.extend({}, param, {
                    temp: null,
                    video_source_data: null
                })

            });
        },
        getArticlePreviewData: function(param, callback) {
            if (!/typeName=videos/.test(location.hash)) {
                let title = param.title;
                title = offBlank.offStartBlank(title);
                title = offBlank.offThreeBlank(title);
                param.title = offBlank.intervalThreeBlank(title);
                let title2 = param.title2;
                title2 = offBlank.offStartBlank(title2);
                title2 = offBlank.offThreeBlank(title2);
                param.title2 = offBlank.intervalThreeBlank(title2);
            }
            return utils.request({
                type: 'post',
                url: '/article/saveAndPreview',
                dataType: 'json',
                data: param
            });
        },
        getArticlePublishStatus: function(callback) {
            return utils.request({
                type: 'get',
                url: '/article/publishStatus',
                dataType: 'json'
            });
        },
        scheduleArticlePublish: function(param, callback) {
            if (!/typeName=videos/.test(location.hash)) {
                let title = param.title;
                title = offBlank.offStartBlank(title);
                title = offBlank.offThreeBlank(title);
                param.title = offBlank.intervalThreeBlank(title);
                let title2 = param.title2;
                title2 = offBlank.offStartBlank(title2);
                title2 = offBlank.offThreeBlank(title2);
                param.title2 = offBlank.intervalThreeBlank(title2);
            }
            return utils.request({
                type: 'post',
                url: '/article/schedulePublish',
                dataType: 'json',
                data: $.extend({}, param, {
                    temp: null,
                    video_source_data: null
                })
            });
        },
        getVideoInfo: function(param) {
            return utils.request({
                type: 'get',
                url: '/videoFormat/getSingleVideoInfoFormat',
                dataType: 'json',
                data: param
            });
        },
        /* 视频直播发布相关接口开始 */
        getLiveList: function(param) {
            return utils.request({
                type: 'get',
                url: '/liveVideo/getUserLives',
                dataType: 'json',
                data: param
            });
        },
        getLiveInfoByPid: function(param) {
            return utils.request({
                type: 'get',
                url: '/liveVideo/getLiveInfo',
                dataType: 'json',
                data: param
            });
        },
        /* 视频直播发布相关接口结束 */
        checkTitle: function(param) {
            let dfd = $.Deferred();
            let url = '/api/isheadlinewriters';
            utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: {
                    headline: param.title
                }
            }).then(function(resp) {
                if (resp.response.code == 0) {
                    dfd.resolve(resp);
                } else {
                    dfd.reject({});
                }
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        },
        /* push 相关的接口 */
        getPushArea: function() {
            return utils.request({
                type: 'get',
                url: '/pushMessage/getAllPushCityList',
                dataType: 'json'

            });
        },
        getPushType: function() {
            return utils.request({
                type: 'get',
                url: '/pushMessage/getarticletype',
                dataType: 'json'

            });

        },
        /* 视频原创申诉相关的接口 */
        submitVideoAudit: function(param) {
            // CreateAuditFailVidReport
            let url = '/report/createVidReport';
            if (param.report_type == '5') {
                url = '/report/CreateAuditFailVidReport';
            }
            return utils.request({
                type: 'post',
                url: url,
                dataType: 'json',
                data: param
            });
        },

        /* 视频原创申诉相关的接口 */
        submitVideoShaAudit: function(param) {
            return utils.request({
                type: 'post',
                url: '/report/createUploadVidSHAReport',
                dataType: 'json',
                data: param
            });
        },

        getIndexLineData: function(params) {
            return $.ajax({
                type: 'get',
                url: '/MediaIndex/GetHistoryCurve',
                data: params,
                dataType: 'json'
            });
        },
        getIndexRadarData: function(params) {
            return $.ajax({
                type: 'get',
                url: '/MediaIndex/GetMyIndex',
                data: params,
                dataType: 'json'
            });
        },
        /* 地图相关的接口 */
        getPushData: function() {
            return utils.request({
                type: 'get',
                url: '/pushMessage/getPushData',
                dataType: 'json'
            });
        },
        getPushArticles: function() {
            return utils.request({
                type: 'get',
                url: '/pushMessage/getPushArticleList',
                dataType: 'json'
            });
        },
        getProvinceNameByPoints: function(param) {
            let tempUrl = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + param[1] + ',' + param[0] + '&coord_type=3&output=jsonp&key=3HFBZ-MYHW5-TIMIS-QWXIO-TYN22-EJF73';
            return $.ajax({
                jsonp: 'callback',
                url: tempUrl,
                timeout: 30000,
                dataType: 'jsonp'
            });
        },
        delArticle: function(articleId, type) {
            return $.ajax({
                type: 'post',
                url: '/article/delete',
                dataType: 'json',
                data: {
                    articleId: articleId,
                    type
                }
            });
        },
        quickPublish: function(articleId, type) {
            return $.ajax({
                type: 'post',
                url: '/article/quickPublish',
                dataType: 'json',
                data: {
                    articleId: articleId,
                    type
                }
            });
        },
        removeVideoInArticle: function(data) {
            // ?articleId=xxxx&vid=xxxx
            return $.ajax({
                type: 'post',
                url: '/article/removeVideoInArticle',
                dataType: 'json',
                data: data
            });
        },
        getUserVisitTimes: function() {
            return $.ajax({
                type: 'get',
                url: '/article/isFirstInCommodity',
                dataType: 'json'
            });
        },
        checkTitleRepeat: function(data) {
            return $.ajax({
                type: 'get',
                url: '/article/checkTitleRepeat',
                dataType: 'json',
                data: data
            });
        },
        closeAlert1: function() {
            return $.ajax({
                url: '/alertMsg/close',
                method: 'POST',
                dataType: 'json',
                data: {
                    type: 'alert1'
                }
            });
        },
        // 获取微视红包列表接口
        getRedPacketList: function(param, callback) {
            let url = '/redPacket/getRedPacketList';
            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
            });
        },
        // 获取商业检验成功是否的接口
        businessCashCheck: function(param) {
            let url = '/businessCash/businessCashCheck';
            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: param
            });
        },
        // 获取是否是第一次进入“推送至QQ”功能的接口
        getFirstInpushqq: function(param) {
            let url = '/article/isFirstInQQPush';
            return utils.request({
                type: 'POST',
                url: url,
                dataType: 'json',
            });
        },
        // 获取是否是第一次进入含有未通过的视频的文章页面的接口
        getIsArticleFailTips: function(param) {
            let url = '/article/isArticleFailTips';
            return utils.request({
                type: 'POST',
                url: url,
                dataType: 'json',
            });
        },
        // 获取该用户今天“推送至QQ”数量的接口
        getTodayPushqqCount: function(param) {
            let url = '/article/getTodayQQPushCount';
            return utils.request({
                type: 'POST',
                url: url,
                dataType: 'json',
            });
        },
        // 内容“推送至QQ”的接口
        pushToqq: function(param) {
            let url = '/article/setQQPush';
            return utils.request({
                type: 'POST',
                url: url,
                dataType: 'json',
                data: param
            });
        },
    };
    return article;
});