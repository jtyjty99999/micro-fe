define(function (require, exports, module) {
    let ListCat = require('base/component/visualChina/category/List');
    let ScrollCat = require('base/component/visualChina/category/Scroll');
    let Content = require('base/component/visualChina/Content');
    let Filter = require('base/component/visualChina/Filter');
    let template = require('base/component/template');
    let constantVar = require('base/component/constantVar');
    let PlaceHolder = require('base/component/placeholder');
    let visualChinaApi = require('base/api/visualChina');
    let errorCode = constantVar.getErrCode() || {};
    let templateEntry = 'visualChina/index';
    let isShortContent;
    function Builder(customParams) { // wrap可以是字符串也可以是jquery对象
        let self = this;
        let showType = 'list';
        let $container = $(customParams.wrap);
        isShortContent = customParams.isShortContent;
        if (typeof customParams.template !== 'undefined') { // 如果自定义模板来源
            template = customParams.template;// 覆盖模板
        }
        if (typeof customParams.templateEntry !== 'undefined') { // 如果自定义了模板入口
            templateEntry = customParams.templateEntry;
        }
        if (typeof customParams.showType !== 'undefined') {
            showType = customParams.showType;
        }
        let defaultPagingParams = {// 默认分页参数
            searchText: '', // 搜索内容
            pageNo: 1,
            pageLimit: 12
        };
        let FREEDOMTYPE = 'freedom';// 普通图库 不受限
        let LIMITTYPE = 'limit';// 高级图库 受限，一个月30张
        let EDITTYPE = 'edit';// 编辑图库 受限，一个月30张，和高级图库一致
        let HOTSORT = 'hot';
        let LATESTSORT = 'latest';
        let isNewImgCopyrightWhiteList = (typeof g_userStatus !== 'undefined') && window.g_userStatus.isNewImgCopyrightWhiteList;
        let freedomFilter = new Filter(FREEDOMTYPE, HOTSORT, defaultPagingParams);
        let limitFilter = new Filter(LIMITTYPE, HOTSORT, defaultPagingParams);
        let editFilter = new Filter(EDITTYPE, HOTSORT, defaultPagingParams);
        let defaultCache = $.extend(true, {// cache默认数据
            tabType: FREEDOMTYPE,
            tabSort: HOTSORT,
            listCode: 0,
            listData: [],
            pageTotal: 0,
            showType: showType
        }, defaultPagingParams);
        if (window.isShowRedDot && window.isShowRedDot === '1' && window.location.pathname === '/article/articlePublish') { // 热点图库引导页$('ul.tab li[data-id="normal"]').hasClass('active')
            defaultCache.tabType = EDITTYPE;
            window.isShowRedDot = '0';
        }
        for (let i = 0, lg = defaultPagingParams.pageLimit; i < lg; i++) {
            defaultCache.listData.push({ is_local_exist: 0 });
        }
        let cache = $.extend(true, {}, defaultCache);
        let limitInfo = {
            ischarge: 0, // 是否显示具备使用会员图片
            left: 0, // 会员图片可用剩余量
            iseditor: 0// 是否显示具备使热点图片
        };
        let showCat;
        switch (showType) {
            case 'scroll':
                showCat = new ScrollCat(cache, self, $container);
                break;
            default:
                showCat = new ListCat(cache, self, $container);
                break;
        }

        let isNeedEmpty = {};
        isNeedEmpty[FREEDOMTYPE + HOTSORT] = true;
        isNeedEmpty[FREEDOMTYPE + LATESTSORT] = true;
        isNeedEmpty[LIMITTYPE + HOTSORT] = true;
        isNeedEmpty[LIMITTYPE + LATESTSORT] = true;
        isNeedEmpty[EDITTYPE + HOTSORT] = true;
        isNeedEmpty[EDITTYPE + LATESTSORT] = true;

        this.repaint = function (data, actionType) {
            !!showCat.repaintBefore && (data = showCat.repaintBefore(data, actionType));// 渲染前处理
            let key = cache.tabType + cache.tabSort;
            if (!data) {
                let emptyData = $.extend(true, {}, defaultCache);
                emptyData.tabType = cache.tabType;
                emptyData.tabSort = cache.tabSort;
                emptyData.searchText = cache.searchText;
                cache = emptyData;
                if (isNeedEmpty[key]) {
                    cache.loading = true;
                }
                showCat.updateCache(cache);// 当cache被整体替换后，需要同步下
            } else {
                if (data.loadingMoreError) { // 加载更多出错了
                    return;
                }
                if (data.listData == null) { // 数据加载失败
                    isNeedEmpty[key] = true;
                } else { // 数据加载成功
                    isNeedEmpty[key] = false;
                }
                cache.loading = false;
                cache.listData = data.listData;
                $.extend(true, cache, data);
            }
            cache.limitInfo = limitInfo; // cache在搜索的条件下会被清除数据，所以limitInfo单独出来，最后才追加上去
            cache.isNewImgCopyrightWhiteList = isNewImgCopyrightWhiteList;
            cache.vcg_free = (typeof window.g_userStatus != 'undefined') && window.g_userStatus.vcg_free;        // eslint-disable-line eqeqeq
            cache.vcg_charge = (typeof window.g_userStatus != 'undefined') && window.g_userStatus.vcg_charge;  // eslint-disable-line eqeqeq
            cache.isShortContent = isShortContent;
            $container.html(template(templateEntry, cache));
            // placeholder事件
            PlaceHolder('.placeholder');
            !!showCat.repaintAfter && (showCat.repaintAfter(data, actionType));// 渲染后处理
        };
        this.repaintError = function () { // 接口发生异常调用这个方法
            !!showCat.repaintError && showCat.repaintError();
        };
        this.getCurrentFilter = function () {
            let currrentFilter;
            switch (cache.tabType) {
                case FREEDOMTYPE:
                    currrentFilter = freedomFilter;
                    break;
                case LIMITTYPE:
                    currrentFilter = limitFilter;
                    break;
                case EDITTYPE:
                    currrentFilter = editFilter;
                    break;
            }
            return currrentFilter;
        };
        // 通用事件绑定
        function commonEventBind() {
            // 切换type事件
            $container.on('click', '[switchTabType]', function () {
                let $this = $(this);
                let type = $this.attr('switchTabType');
                if (type == cache.tabType) {
                    return;
                } else {
                    cache.tabType = type;
                    cache.listData = [];
                }
                let currrentFilter = self.getCurrentFilter();
                $.extend(true, cache, currrentFilter.getConfigData());
                self.repaint(null, 'switchTabType');// 先渲染已经改变的数据
                self.render('', 'switchTabSort');
            });
            // 切换sort事件
            $container.on('click', '[switchTabSort]', function () {
                let $this = $(this);
                let sort = $this.attr('switchTabSort');
                if (sort == cache.tabSort) {
                    return;
                }
                let currrentFilter = self.getCurrentFilter();
                currrentFilter.setTabSort(sort);
                $.extend(true, cache, currrentFilter.getConfigData());
                self.repaint(null, 'switchTabSort');// 先渲染已经改变的数据
                self.render('', 'switchTabSort');
            });
            // 清除搜索内容
            $container.on('click', '.input-clear-btn', function () {
                $container.find('.search-form input').val('');
                $(this).hide();
                let currrentFilter = self.getCurrentFilter();
                currrentFilter.cacheSearchText('');
            });
            function doSearch() {
                // 执行搜索的时候，当前两个sort都得清除
                isNeedEmpty[cache.tabType + HOTSORT] = true;
                isNeedEmpty[cache.tabType + LATESTSORT] = true;
                let currrentFilter = self.getCurrentFilter();
                currrentFilter.setSearchText();// searchText在输入的时候已经被Filter缓存起来了 这里直接执行即可
                $.extend(true, cache, currrentFilter.getConfigData());
                self.repaint(null, 'search');// 先渲染已经改变的数据
                self.render();
            }
            // 执行搜索事件
            $container.on('click', '[doSearch]', function () {
                doSearch();
            }).on('keydown', '.search-form input', function (e) {
                if (e.keyCode == 13) {
                    doSearch();
                    return false;
                }
            });
            // 接口异常重试
            $container.on('click', '.tryAgain', function () {
                isNeedEmpty[cache.tabType + cache.tabSort] = true;
                self.repaint(null, 'tryAgain');// 先渲染已经改变的数据
                self.render('', 'tryAgain');
            });
            $container.on('input', '.search-form input', function () {
                let $this = $(this);
                let searchText = $this.val();
                let currrentFilter = self.getCurrentFilter();
                currrentFilter.cacheSearchText(searchText);
            });
        }
        this.init = function () {
            self.repaint();
            commonEventBind();
        };
        //
        this.render = function (gid, actionType) {
            cache.gid = gid || self.getGid();
            (function (gid) {
                self.getCurrentFilter().getData().then(function (FilterData) {
                    if (gid == cache.gid) {
                        console.log('FilterData', FilterData);
                        self.repaint(FilterData, actionType);
                    }
                }, function () {
                    self.repaintError();
                });
            })(cache.gid);
        };
        // 获取是否显示会员页卡以及会员图片剩余张数
        this.getVCGPicMonthLeftData = function () {
            return visualChinaApi.getVCGPicMonthLeft().then(function (resp) {
                if (isNewImgCopyrightWhiteList) {
                    if (resp.response.code == 0) {
                        let data = resp.data || {};
                        limitInfo.ischarge = data.ischarge || 0;
                        limitInfo.iseditor = data.iseditor || 0;
                        limitInfo.left = data.left || 0;
                    }
                } else {
                    limitInfo.iseditor = 1;
                }
            });
        };
        // 标记图片已经被添加到素材库
        // eslint-disable-next-line
        this.setImageIsInGallery = function (index, imgIsLimit) {
            let currrentFilter = self.getCurrentFilter();
            currrentFilter.modifyListData(index, 'is_local_exist', 1);
            if (imgIsLimit == 1 && limitInfo.left > 0) {
                limitInfo.left--;
            }
            self.render();
        };
        this.getGid = (function () {
            let num = 0;
            return function () {
                return ++num;
            };
        })();
        // 获取数据
        this.getData = function () {
            let imgData = showCat.getData();
            if (typeof imgData.id === 'undefined') { // 没有选中图片或者图片资源id为空
                return {
                    noPic: true
                };
            }
            if (imgData.isLimit == 1 && imgData.islocalExist != 1 && limitInfo.left <= 0) { // 是会员图片，没有添加到素材库，判断是否还有次数
                return {
                    left: 0
                };
            }
            let dfd = $.Deferred(function (defer) {

                let result;
                visualChinaApi.addVCGPicToGallery({
                    vcgpicid: imgData.id,
                    free: imgData.isLimit, // 0:免费1:会员
                    vcgpictitle: imgData.title,
                    downloadurl: imgData.downloadurl,
                }).then(function (resp) {
                    if (resp.response.code == 0) {
                        // eslint-disable-next-line
                        for (let key in resp.data) {
                            result = { size: resp.data[key].size, info: imgData, copyright: cache.tabType === 'edit' ? '1' : '0' };
                            break;
                        }
                    }
                    defer.notify(result);
                }, function () {
                    defer.notify(null);
                });
            }).promise();
            return dfd;
        };
    }
    return Builder;
});
