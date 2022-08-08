define(function(require, modules, exports){
    var utils = require('base/trackReport/utils');

    //投票管理行为上报
    !function(){
        var selectorMap = {
            "click #VoteManage .create-vote-btn":"create",
            "click #VoteManage .editVote":"edit",
            "click #VoteManage .viewVote":"check",
            "deleteVoteClick #VoteManage .deleteVote":"delete"
        }

        utils.listen(selectorMap, 'vote_manage', 'vote_manage').addToTest('VoteManage', selectorMap);

    }()

    //视频管理
    !function(){

        var selectorMap = {
            "click .videotab a":"videomanagelink",
            "click #videoPage .upload-video-btn":"uplaodvideo",
            "click #videoPage .act-del-video":"deletevideo",
            "click #videoPage .edit-video-info":"editvideoinfo",
            "click #videoPage .video-item .media-inner a.pic":"reviewvideo",
            "categoryclick #videoUploadPanel #form-video-category":"selectcategory",
            "click #videoUploadPanel .video-realtime-action .action-cover":"setcover",
            "click #videoUploadPanel #mod-actions [data-id=save]":"submitvideo",
            "click #videoUploadPanel #mod-actions [data-id=cancel]":"resetsubmit"
        }

        utils.listen(selectorMap, 'video_manage', 'video_manage').addToTest('VideoManage', selectorMap);

    }()

    //图片库
    !function(){

        var selectorMap = {
            "click #MatManage #uploadImg":"insertpic",
            "nextclick #MatManage .paginationholder .next":"next_page",
            "prevclick #MatManage .paginationholder .prev":"last_page",
            "goclick #MatManage .paginationholder .go":"jump_button"
        }

        utils.listen(selectorMap, 'pics_gallery', 'pics_gallery').addToTest('MatManage', selectorMap);

    }()
})