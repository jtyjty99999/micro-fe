define(function(require, modules, exports){
    var utils = require('base/trackReport/utils');

    //普通文章发文
    !function(){
        var editorWrap = $("#om-art-normal-editor");
        var selectorMap = {
            "click #om-art-normal-editor .edui-for-bold":"bold",
            "click #om-art-normal-editor .edui-for-removeformat":"clear",
            "click #om-art-normal-cover label.ui-radio[data-id='single']":"onecover",
            "click #om-art-normal-cover label.ui-radio[data-id='multi']":"threecover",
            "click #om-art-normal-cover label.ui-radio[data-id='auto']":"autocover",
            "click #om-art-normal-cover label.ui-radio[data-id='hd']":"hdcover",
            "click #om-art-normal-original label.ui-checkbox":"originaltag"
        }

        utils.listen(selectorMap, 'article_publish', 'article_publish').addToTest('NormalArtPub', selectorMap);
    }()

    //组图文章发文页行为上报
    !function(){
        var selectorMap = {
            "click #om-art-images #btn-upload-images0":"insertpic",
            "click #om-art-images .add-media-action .uploadPlaceholder":"addpic",
            "click #om-art-images .zutu-item .link[data-id=replace]":"changepic",
            "click #om-art-images #om-art-images-cover [data-id=multi]":"3piccover",
            "categoryclick #om-art-images .categoryselect .ui-select-control":"classification",
            "click #om-art-images #om-art-normal-original .ui-radio":"original",
            "click #om-art-images-cover label.ui-radio[data-id='single']":"onecover",
            "click #om-art-images-cover label.ui-radio[data-id='multi']":"threecover",
            "click #om-art-images-cover label.ui-radio[data-id='auto']":"autocover",
            "click #om-art-images-cover label.ui-radio[data-id='hd']":"hdcover"
        }
        utils.listen(selectorMap, 'pics_publish', 'pics_publish').addToTest('ImagesArtPub', selectorMap);
    }()


    //视频文章发文页行为上报
    !function(){
        var selectorMap = {
            "click #om-art-videos #btn-upload-video":"uploadvideo",
            "categoryclick #form-video-category .chosen-single":"selectcategory",
            "click #om-art-videos .action-select":"selectvideo",
            "click #om-art-videos #om-art-videos-chosen .resetVideoBtn":"linkreset",
            "click #om-art-videos .video-realtime-action .action-cover":"setcover"
        }

        utils.listen(selectorMap, 'video_publish', 'video_publish').addToTest('VideoArtPub', selectorMap);
    }()

})