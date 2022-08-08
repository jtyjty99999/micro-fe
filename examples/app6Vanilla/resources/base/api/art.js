define(function (require, exports, module) {
    var artApi = {
        picUpload: function (param, callback) {
            param.isUpOrg = 1;//添加原图
            $.ajax({
                type: "get",
                url: '/image/exactupload', data: param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error: function (res) {
                    popAlert("error", "上传失败");
                }
            });
        },
        cropUpload: function (param, callback) {
            param.isUpOrg = 1;//添加原图
            $.ajax({
                type: "get",
                url: '/image/cropupload', data: param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error: function (res) {
                    popAlert("error", "上传失败");
                }
            });
        },
        artPreview: function (param, callback) {
            $.ajax({
                type: "post",
                //url: "/article/save.php?date=" + new Date(),
                url: '/article/preview',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "预览失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        saveAndpubUrl: function (url, param, callback) {
            $.ajax({
                type: "post",
                url: url,
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "提交失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        previewUrl: function (param, callback) {
            $.ajax({
                type: "post",
                url: '/article/saveAndPreview',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "提交失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getCategoryList:(function(){
            var cacheDfd={};
            function handler(callback) {
                if(!cacheDfd['list']){
                    cacheDfd['list']=$.ajax({
                        type: "get",
                        url: "/article/categoryList",
                        dataType: "json",
                        error: function (res) {
                            popAlert("error", "获取分类失败");
                        }
                    });
                }
                callback && cacheDfd['list'].done(function(res){
                    callback(res);
                });
                return cacheDfd['list'];
            }
            return handler;
        })(),
        getArticleUrl: function (param, callback) {
            $.ajax({
                type: "get",
                url: "/article/info?articleId=" + param.articleId,
                dataType: "json",
                error: function (res) {
                    popAlert("error", "获取文章失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });

        },
        ckpicUpload: function (param, callback, err) {
            $.ajax({
                method: "post",
                url: "/image/archscaleupload?isRetImgAttr=1",
                data: param,
                dataType: "json",
                error: function (res) {
                    err && err(res);
                    popAlert("error", "粘贴失败");
                    //pageSetting.waitingLayer.close_waiting_layer();
                },
                success: function (res) {
                    callback && callback(res);
                }
            })
        },
        publishStatus: function (callback) {
            $.ajax({
                type: "get",
                url: "/article/publishStatus",
                dataType: "json",
                error: function (res) {
                    popAlert("error", "获取发布状态失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        schedulePubUrl: function (param, callback) {
            $.ajax({
                type: "post",
                url: "/article/schedulePublish",
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "定时发布失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        getServerTimeUrl: function (callback) {
            //var timeUrl = '/interface/time/getServerTime.php?t=' + new Date();
            $.ajax({
                type: "get",
                url: '/article/serverTime',
                dataType: "json",
                error: function (res) {
                    popAlert("error", "获取时间失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getQReaderVerfiyFlag: function (callback, err) {
            var qreader_flag_url = '/qzone/is_readqzone';
            $.ajax({
                type: 'get',
                url: qreader_flag_url,
                dataType: "json",
                error: function (res) {
                    err && err(res);
                    //checkdom.checked = "";
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        modifyUserBody: function(param,callback){
            $.ajax({
                type:"post",
                url:'/userAuth/modifyUserBody',
                data:param,
                dataType: "json",
                success:function(res){
                    callback && callback(res);
                }
            });
        },
        delArticle: function (param, callback) {
            $.ajax({
                type: "post",
                url: '/article/delete',
                dataType: "json",
                data: {articleId: param.articleId},
                error: function (res) {
                    popAlert("error", "删除文章失败");
                },
                success: function (res) {
                    callback && callback(res);
                    //var ret = JSON.parse(res);
                    //if (ret.response.code != 0) {
                    //    alert(ret.response.msg);
                    //    return;
                    //} else {
                    //    callback && callback(param, ret);
                    //}
                }
            });
        },
        getArticleList: function (param, callback) {
            var url = ""
            if (param.category == "") {
                url = '/article/list?index=' + param.index+'&commentflag=0&source=' + param.source||'0';

            } else {
                url = '/article/list?index=' + param.index + '&commentflag=0&category=' + param.category+'&source=' + param.source||'0';
            }
            if(!!param.startDate){
                url += '&startDate='+param.startDate+'&endDate='+param.endDate;
            }
            if(!!param.search){
                url += '&search='+param.search;
            }
            $.ajax({
                type: "get",
                url: url,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取文章失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            })
        },
        getfansneedarticles:function(params){
            return 
        },
        directPublish: function (param, callback ,errorcallback) {
            $.ajax({
                type: "post",
                url: '/article/quickPublish',
                dataType: "json",
                data: {articleId: param.articleId},
                error: function (res) {
                    popAlert("error", "发布失败");
                    errorcallback && errorcallback(res);
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getMediaInfo: function (param, callback) {
            $.ajax({
                type: "get",
                url: '/userAuth/userInfo?email=' + param.email,
                //data: param,
                error: function (res) {
                    popAlert("error", "获取个人信息失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });

        },
        /*消息接口*/
        getMessageList: function (param, callback) {
            param.media = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/MediaTip/gettips?mediaid=' + param.media + '&page=' + param.page + '&num=' + param.num,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取消息失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        messageTipack: function (param, callback) {
            param.media = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/MediaTip/tipack?mediaid=' + param.media + '&id=' + param.id,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "回调失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        messageIsNewTip: function(param,callback){ //拉取是否有新消息接口
            param.media = g_userInfo.mediaId;
            $.ajax({
                type: "get",
                url: '/MediaTip/isnewtip?mediaid='+param.media,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取消息状态失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        /*违规记录接口*/
        getPunishList: function(param,callback){
            param.media = g_userInfo.mediaId;
            $.ajax({
                type: "get",
                url: '/article/getPunishList?media=' + param.media + '&page=' + param.page + '&num=' + param.num,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取违规记录失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        /*发文定时保存接口*/
        getCacheArticle: function (param, callback) {
            param.media = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/editorCache/get?mediaid=' + param.media,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取缓存文章失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        updateCacheArticle: function (param, callback) {
            param.mediaid = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "post",
                url: '/editorCache/update',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "操作失败，请稍后重试");
                    setTimeout(function(){
                        location.reload();
                    },1000)
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        deleteCacheArticle: function (param, callback) {
            param.media = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/editorCache/delete?mediaid=' + param.media,
                dataType: "json",
                error: function (res) {
                    popAlert("error", "删除缓存文章失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        /*
         投票管理
         */
        getVoteList: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/vote/list?' + "page=" + param.index + "&limit=" + param.num + "&valid=" + param.unexpired,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取投票列表失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        getArticleVote: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/vote/getArticleVote?articleId=' + param.articleId,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取投票失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        getSingleVote: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/vote/getVoteInfo?voteid=' + param.voteId,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取投票失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        viewVoteInfo: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/vote/view?voteid=' + param.voteId,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取投票详情失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        createAndUpdate: function (param, callback) {
            param.media = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "post",
                url: '/vote/update',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "创建或修改投票失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        deleteVote: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "post",
                url: '/vote/delete?voteid=' + param.voteId,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "删除投票失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        updateVoteDeadLine: function (param, callback) {
            param.media = g_userInfo.mediaId;
            //param.media = '56';
            $.ajax({
                type: "get",
                url: '/vote/getSingleVote?mediaid=' + param.media + "&voteid=" + param.voteid,
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "更新截止日期失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        updateAvatar: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "post",
                url: '/userAuth/updateAvatar',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "头像更新失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        updateIntro: function (param, callback) {
            //param.media = '56';
            $.ajax({
                type: "post",
                url: '/userAuth/updateIntro',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "帐号介绍更新失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getCoverImgs: function(param,callback){//获取封面中我的图片列表
            var _type = param["type"]||'';
            $.ajax({
                type: "get",
                url: '/image/list?' + "page=" + param.index + "&limit=" + param.num +'&types='+_type,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取图片列表失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        getRealData : function(param,callback){
            param.media = g_userInfo.mediaId;
            //param.media = "tj";
            $.ajax({
                type: "get",
                //url:'/statistic/rtList?media=10002&page=1&num=9'
                url: '/statistic/rtList?media=' + param.media+ '&page='+ param.index + '&num='+param.num,
                error: function (res) {
                    popAlert("error", "获取实时数据失败");
                },
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getPVList: function(param,callback){ //获取每篇文章的PV列表
            param.media = g_userInfo.mediaId;
            $.ajax({
                type: "get",
                url: '/statistic/rtListData',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "获取PV列表失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        getChartData: function(param,callback){
            param.media = g_userInfo.mediaId;
            $.ajax({
                type: "get",
                url: '/statistic/rtChartsData',
                dataType: "json",
                data: param,
                error: function (res) {
                    popAlert("error", "获取图表数据失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },
        delMatImg: function(param,callback){//获取封面中我的图片列表
            $.ajax({
                type: "get",
                url: '/image/delete',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    location.reload();
                }
            });
        },
        updateTitleMatImg: function(param,callback){//获取封面中我的图片列表
            $.ajax({
                type: "post",
                url: '/image/updateTitle',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    location.reload();
                }
            });
        },
        ifCanOpenFlow:function(param,callback){//申请开通流量主需要判断白名单
            $.ajax({
                type: "post",
                url: '/supplier/ifCanOpenFlow',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        ifCanOpenSubsidy:function(param,callback){//申请开通补贴
            $.ajax({
                type: "post",
                url: '/supplier/ifCanOpenSubsidy',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        saveSettleInfo:function(param,callback){//保存供应商信息
            $.ajax({
                type: "post",
                url: '/supplier/saveSettleInfo',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        quickRegister:function(param,callback){//快速注册保存供应商信息
            $.ajax({
                type: "post",
                url: '/supplier/quickRegister',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        updateBank:function(param,callback){//修改账户信息
            $.ajax({
                type: "post",
                url: '/supplier/updateBank',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                },
                error:function(){
                    popAlert("error", "操作失败，请稍后重试");
                }
            });
        },
        closeFlowSupp:function(param,callback){//关闭流量主
            $.ajax({
                type: "post",
                url: '/supplier/closeFlowSupp',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        reopenFlow:function(param,callback){//重新打开流量主
            $.ajax({
                type: "post",
                url: '/supplier/reopenFlow',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        openSubsidy:function(param,callback){//开通补贴
            $.ajax({
                type: "post",
                url: '/supplier/openSubsidy',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getCityList: function(callback){
            $.ajax({
                type: "get",
                url: '/supplier/getCityList',
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        adSummary: function(callback){//获取广告统计
            $.ajax({
                type: "get",
                url: '/account/adSummary',
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        subsidySummary: function(callback){//获取补贴统计
            $.ajax({
                type: "get",
                url: '/account/subsidySummary',
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        accountSummary: function(callback){//财务结算金额
            $.ajax({
                type: "get",
                url: '/account/accountSummary',
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        videoSummary: function(callback){//视频收入
            $.ajax({
                type: "get",
                url: '/account/videoSummary',
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        adDetail: function(param,callback){//获取广告统计
            $.ajax({
                type: "get",
                url: '/account/adDetail',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        subsidyDetail: function(param,callback){//获取补贴统计
            $.ajax({
                type: "get",
                url: '/account/subsidyDetail',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        videoDailyDetail:function(param,callback){//获取视频收入单日收益列表
            $.ajax({
                type: "get",
                url: '/account/videoDailyDetail',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        videoArticleDetail:function(param,callback){//获取视频收入视频收益列表
            $.ajax({
                type: "get",
                url: '/account/videoArticleDetail',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        withdrawList: function(param,callback){//提现记录
            $.ajax({
                type: "get",
                url: '/account/withdrawList',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        withdraw:function(param,callback){//保存供应商信息
            $.ajax({
                type: "post",
                url: '/account/withdraw',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getWithdrawableAmount:function(param,callback){//获取提现金额
            $.ajax({
                type: "post",
                url: '/account/getWithdrawableAmount',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        canWithdraw:function(param,callback){//获取提现金额
            $.ajax({
                type: "post",
                url: '/account/canWithdraw',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        /**
         - 方法post
         - 参数
         opType  1 开通  2 关闭
         */
        setQmpSyncContent:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/qmp/SetQmpSyncContent',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        agreeBind:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/qmp/agreeBind',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        getQQbindUnique:function(param,callback){
            $.ajax({
                type: "get",
                url: '/qmp/getQQbindUnique',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        statisticsReport:function(pos){
            // try{
            //     var url='http://ping.imp.qq.com/report?project=caiyun&sBiz='+pos;
            //     var img = new Image(1, 1);
            //     img.src = url + "&r=" + Math.random();
            // }catch(e){}
        },
        getVideoList:function(param,callback){
            $.ajax({
                type:"get",
                url:'/Omvideo/GetVideoList',
                data:{
                    mediaid:param.mediaId,
                    num:param.num,
                    page:param.page
                },
                dataType: "json",
                success:function(res){
                    callback&&callback(res);
                }
            });
        },

        // 申请视频原创
        videoOriginalApply:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/VideoOrigin/Apply',
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 申请原创
        originalLabelOpen:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/mediaOriginal/ApplySubmit',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        // 举报
        reportSimilarArticle:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/Report/CreateReport',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        // 批量举报
        batchReportSimilarArticle:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/report/batchCreateReport',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },
        // 举证
        quoteSimilarArticle:function(param,callback){//
            $.ajax({
                type: "post",
                url: '/Report/CreateProof',
                data:param,
                dataType: "json",
                success: function (res) {
                    callback && callback(res);
                }
            });
        },

        // 获取相似文章列表
        getSimilarArticleList: function (param, callback) {


            //console.log(param);

            var url = ""
            url = '/ArticleOriginal/GetArticleSimilarityList?article_id=' + param.category;
            $.ajax({
                type: "get",
                url: url,
                dataType: "json",
                //data: param,
                error: function (res) {
                    popAlert("error", "获取文章失败");
                },
                success: function (res) {
                    callback && callback(res);

                }
            });
        },

        getSingleVideoInfoFormat:(function(){//获取单视频信息
            var cacheDfd={};
            function handler(param){
                param.check=true;
                param.of='jsonp';
                if(!cacheDfd[param.vid]){
                    cacheDfd[param.vid]=$.ajax({
                        type:"get",
                        url:'/videoFormat/getSingleVideoInfoFormat',
                        data:param,
                        dataType: "jsonp"
                    });
                }
                return cacheDfd[param.vid];
            }
            return handler;
        })()
    };
    return artApi;
})
