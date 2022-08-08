define(function (require, exports, module) {
    function ScrollCat(cache, indexInstance, $container) {
        let self = this;
        let currentScrollTop = 0;
        let currentSelectImg = {};
        let dataCol = {
            'freedomhot': {
                pageNo: 0,
                renderLock: false,
                noMore: false,
                listData: []
            },
            'freedomlatest': {
                pageNo: 0,
                renderLock: false,
                noMore: false,
                listData: []
            },
            'limithot': {
                pageNo: 0,
                renderLock: false,
                noMore: false,
                listData: []
            },
            'limitlatest': {
                pageNo: 0,
                renderLock: false,
                noMore: false,
                listData: []
            },
            'edithot': {
                pageNo: 0,
                renderLock: false,
                noMore: false,
                listData: []
            },
            'editlatest': {
                pageNo: 0,
                renderLock: false,
                noMore: false,
                listData: []
            }
        };
        function eventBind() {
            $container.on('click', '.pic-item', function() {
                let $this = $(this);
                currentSelectImg = {
                    id: $this.attr('imgId'),
                    isLimit: $this.attr('imgIsLimit'), // 是否是会员
                    islocalExist: $this.attr('islocalExist'), // 是否是会员
                    title: $this.attr('imgTitle'),
                    index: $this.attr('imgIndex'),
                    downloadurl: $this.attr('imgdownloadurl'),
                };
                indexInstance.render();
            });
        }
        eventBind();
        let currentKey;
        this.getData = function() {
            return currentSelectImg;
        };
        this.repaintBefore = function(data, actionType) {
            currentKey = cache.tabType + cache.tabSort;
            if (actionType == 'search') { // 动作是搜索就清空此type两个sort的内容
                for (let key in dataCol) {
                    if ((new RegExp(cache.tabType)).test(key)) {
                        dataCol[cache.tabType + 'hot'].listData = [];
                        dataCol[cache.tabType + 'hot'].pageNo = 0;
                        dataCol[cache.tabType + 'hot'].renderLock = false;
                        dataCol[cache.tabType + 'hot'].noMore = false;
                        dataCol[cache.tabType + 'latest'].listData = [];
                        dataCol[cache.tabType + 'latest'].pageNo = 0;
                        dataCol[cache.tabType + 'latest'].renderLock = false;
                        dataCol[cache.tabType + 'latest'].noMore = false;
                    }
                }
            }
            if (data) {
                if (data.listData) { // 数据正常
                    if (data.listData.length) { // 数据不为空
                        dataCol[currentKey].renderLock = false;
                    }
                    if (data.pageNo > dataCol[currentKey].pageNo) { // 数据的页码大，说明是新的，可以加入
                        dataCol[currentKey].pageNo = data.pageNo;
                        dataCol[currentKey].listData = dataCol[currentKey].listData.concat(data.listData || []);
                    }
                    if (data.pageNo >= data.pageTotal) { // 已经没有了
                        data.noMore = true;
                    }
                    data.listData = $.extend(true, [], dataCol[currentKey].listData);
                } else { // 数据不正常

                    if (data.pageNo <= 1) { // 是第一页

                    } else { // 不是第一页，标记loadingMoreError为true,主渲染函数indexInstance.repaint会读取到它
                        self.repaintError();
                        data.loadingMoreError = true;
                        $container.find('.scroll-theme').off('scroll');
                    }
                }

                data.selectImgId = currentSelectImg.id;
            }
            return data;
        };
        this.repaintAfter = function(data, actionType) {
            $container.find('.scroll-theme').scrollTop(currentScrollTop);
            // if(actionType!='scroll'){
            //     $container.find('.scroll-theme').scrollTop(currentScrollTop);
            // }else{
            //     $container.find('.scroll-theme').scrollTop(currentScrollTop+140);
            // }
            if (!data || !data.listData || !data.listData.length) { //
                return;
            }
            // 绑定滚动事件
            $container.find('.scroll-theme').off('scroll').on('scroll', function(e) {
                let panel = this;
                currentScrollTop = panel.scrollTop;
                if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                    if (!dataCol[currentKey].renderLock) {
                        dataCol[currentKey].renderLock = true;
                        let currrentFilter = indexInstance.getCurrentFilter();
                        currrentFilter.setPageNo(cache.pageNo + 1);
                        $.extend(true, cache, currrentFilter.getConfigData());
                        indexInstance.render('', 'scroll');
                    }
                }
                e.stopPropagation();
                e.preventDefault();
                return false;
            });

        };
        this.repaintError = function() {
            dataCol[currentKey].renderLock = false;
            let currrentFilter = indexInstance.getCurrentFilter();
            currrentFilter.setPageNo(cache.pageNo - 1);
            $.extend(true, cache, currrentFilter.getConfigData());
        };
        this.updateCache = function(newCache) {
            cache = newCache;
        };
    }
    return ScrollCat;
});