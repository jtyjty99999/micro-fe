define(function (require, exports, module) {
    let Category = require('./category');
    let visualChinaApi = require('base/api/visualChina');
    let template = require('base/component/template');
    let omlayer = require('layer/layer');
    let InputSearch = require('base/component/inputSearch');
    const infinityScroll = require('base/component/infinityScroll');
    const PERPAGE = 20; // 每页数据

    function Topic() {
        this.category = new Category({
            wrap: $('#categoryWrap')
        });
        this.$container = $('#topicWrap');
        this.state = {
            keyword: '',
            channelid: '',
            page: Math.ceil(Math.random() * 10),
            limit: PERPAGE
        };
    }

    Topic.prototype = {
        renderData: {
            /* 渲染html的data */
            loading: true,  // 初始列表加载
            loadstatus: 1,  // 1：自动加载更多，-1：手动加载更多
            scrollLoading: false,  // 已有列表中自动加载更多
            isBottom: false,
            isPage: false,  // 展示为page or dialog
            group_info: [],   // 当前页面列表中的数据
            /* end */

            /* 本地储存的data */
            timestamp: Date.now(),  // 获取最新数据的时间
            /* end */
        },

        init: function (options = {}) {
            const self = this;
            self.options = options;
            self.renderData.isPage = options.isPage; // 是否以页面形式展示

            // 展示 新闻 娱乐等频道 筛选范畴
            self.category.init({
                onChange: function (data) {
                    const params = {
                        page: Math.ceil(Math.random() * 10),
                        ...self.getChannelId({
                            category: data.category,
                            subCategory: data.subCategory
                        })
                    };
                    self.setState(params).getLists(true);
                }
            });
            self.category.rend();

            // 展示 搜索输入框
            const inputSearchClassName = options.isPage ? 'search-zhuanti-form' : 'search-pic-form';
            InputSearch.init({
                container: '#searchWrap',
                className: inputSearchClassName,
                placeHolder: '请输入关键字，为您寻找相关素材'
            });

            self.setState(self.getChannelId(self.category.get())).getLists();
            self.bindEvent();
        },
        getChannelId: function(idData) {
            return { channelid: idData.subCategory || idData.category || '' };
        },
        bindEvent: function () {
            let self = this;
            self.$container.on('click', '.changeBtn', function () {
                self.setState({
                    page: self.state.page + 1
                });
                self.getLists(true);
            }).on('click', '.search-form button', function () {
                self.setState({
                    keyword: self.$container.find('.search-form input').val(),
                    page: 1
                });
                self.getLists(true);
            }).on('click', '.nonAutoLoadingMore', function () {
                console.log('reloadByCurState 加载更多');
                // 切换到loading状态
                self.renderData.loadstatus = 1;
                self.getLists();
            });

            // 无限下拉
            infinityScroll('.specialPhotosList[infinityScroll]', {
                onBottom: function() {
                    if (self.renderData.isBottom) return;
                    if (self.renderData.scrollLoading) return;
                    self.setState({ page: self.state.page + 1 });
                    console.log('无限下拉........');
                    self.getLists();
                },
                isBottom: function() {
                    return self.renderData.isBottom;
                }
            });
        },

        // 加载渲染列表页
        rend: function () {
            const self = this;
            self.$container.find('#topicListWrap').html(template('topicImages/topic', self.renderData));
        },

        /**
         * 更新列表
         * @param {boolean} 是否清空覆盖当前list。ture：清空覆盖当前list。false：向当前list插入新的数据
         */
        getLists(isClear = false) {
            const self = this;
            if (isClear) {
                self.renderData.loading = true;
            } else {
                // 更新为无限加载loading状态
                self.renderData.scrollLoading = true;
            }
            self.rend(); // 初始化列表页

            function callback(resp) {
                self.renderData.loadstatus = 1;
                self.renderData.scrollLoading = false;
                self.renderData.loading = false;
                const { total_count, group_info } = resp.data;

                if (total_count && group_info) {
                    self.renderData.group_info = isClear ? group_info : self.renderData.group_info.concat(group_info);

                    if (self.state.keyword) {
                        if (group_info.length <= 0 || total_count - group_info.length === 0) {
                            self.renderData.isBottom = true;
                        } else {
                            self.renderData.isBottom = false;
                        }
                    } else {
                        if (total_count <= PERPAGE) {
                            self.renderData.isBottom = true;
                        } else {
                            self.renderData.isBottom = false;
                        }
                    }
                }

                self.rend();
            }

            visualChinaApi.getVCGGroupListBySearch(self.state)
                .then(function (resp) {
                    if (resp.data && resp.response.code == 0) {
                        callback(resp);
                    } else {
                        omlayer.msg('专题信息加载失败，请刷新重试', { icon: 2 });
                        self.renderData.loadstatus = -1;
                        self.renderData.loading = false;
                        self.renderData.list = [];
                        self.rend();
                    }
                })
                .fail(function() {
                    self.renderData.loadstatus = -1;
                    self.renderData.loading = false;
                    self.renderData.list = [];
                    self.rend();
                });
        },

        setState: function (data) {
            this.state = $.extend({}, this.state, data);
            return this;
        }
    };

    return Topic;
});