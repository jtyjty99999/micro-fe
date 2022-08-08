define(function(require, modules, exports){
    var utils = require('base/trackReport/utils');

    !function(){
        //评论列表
        var commentSelectorMap = {
            "nextclick #mod-interactive[data-type=comment] .pagination .next":"next_page",
            "prevclick #mod-interactive[data-type=comment] .pagination .prev":"last_page",
            "goclick #mod-interactive[data-type=comment] .pagination .go":"jump_button",
            "filterclick #mod-interactive[data-type=comment] .filter-box li[data-type=time]":"rank_time",
            "filterclick #mod-interactive[data-type=comment] .filter-box li[data-type=article]":"rank_article",
            "click #mod-interactive[data-type=comment] #viewswitch":"selected_only",
            "click #mod-interactive[data-type=comment] .comment-item li a[action=unstar]":"selected_out",
            "click #mod-interactive[data-type=comment] .comment-item li a[action=star]":"selected_in",
            "click #mod-interactive[data-type=comment] .comment-item .action-view":"check"
        }
        utils.listen(commentSelectorMap, 'interactive', 'comment').addToTest('InteractiveComment', commentSelectorMap);
        //评论底层
        var commentManageSelectorMap = {
            "click .comment-detial-view .submit_forreport":"submit",
            "click .comment-detial-view #autoswitch":"more",
            "click .comment-detial-view .interactive-wrap .selectedIn_forreport ":"selected_in",
            "click .comment-detial-view .interactive-wrap .selectedOut_forreport":"selected_out",
            "click .comment-detial-view .comment-footer a[action=up]":"like",
            "click .comment-detial-view .comment-footer a[action=reply]":"reply",
            "commentDetailLoadmore .comment-detial-view":"loadmore"
        }
        utils.listen(commentManageSelectorMap, 'interactive', 'comment_manage').addToTest('InteractiveCommentManage', commentManageSelectorMap);

        //收藏列表
        var collectionSelectorMap = {
            "nextclick #mod-interactive[data-type=collection] #mod-pagination .next":"next_page",
            "prevclick #mod-interactive[data-type=collection] #mod-pagination .prev":"last_page",
            "goclick #mod-interactive[data-type=collection] #mod-pagination .go":"jump_button"
        }
        utils.listen(collectionSelectorMap, 'interactive', 'collection').addToTest('InteractiveCollection', collectionSelectorMap);

        //转发列表
        var forwardSelectorMap = {
            "nextclick #mod-interactive[data-type=forward] .next":"next_page",
            "prevclick #mod-interactive[data-type=forward] #mod-pagination .prev":"last_page",
            "goclick #mod-interactive[data-type=forward] #mod-pagination .go":"jump_button"
        }
        utils.listen(forwardSelectorMap, 'interactive', 'forward').addToTest('InteractiveForward', forwardSelectorMap);
    }()
})