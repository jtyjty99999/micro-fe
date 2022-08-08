define(function(require, modules, exports){
    var utils = require('base/trackReport/utils');

    !function(){
        //热门文章列表
        var selectorMap = {
            "nextclick #ArticleHotManage .paginationholder .next":"next_page",
            "prevclick #ArticleHotManage .paginationholder .prev":"last_page",
            "goclick #ArticleHotManage .paginationholder .go":"jump_button"
        }

        utils.listen(selectorMap, 'hotarticle_manage', 'hotarticle_manage').addToTest('ArticleHotManage', selectorMap);
    }()
})