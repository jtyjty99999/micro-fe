define(function (require, exports, module) {
    let template = require('base/component/template');
    let templateEntry = 'topicImages/index';
    let TopicComponent = require('./topic');
    let ImageListComponent = require('./imagesList');
    let visualChinaApi = require('base/api/visualChina');
    let omlayer = require('layer/layer');
    function Builder(customParams) { // wrap可以是字符串也可以是jquery对象
        let self = this;
        let showType = 'topics'; // 展示洁面类型  topics-专题列表  list--图片列表
        let $container = $(customParams.wrap);
        if (typeof customParams.template !== 'undefined') { // 如果自定义模板来源
            template = customParams.template;// 覆盖模板
        }
        if (typeof customParams.templateEntry !== 'undefined') { // 如果自定义了模板入口
            templateEntry = customParams.templateEntry;
        }
        if (typeof customParams.showType !== 'undefined') {
            showType = customParams.showType;
        }
        this.switchView = function () {
            if (showType == 'topics') {
                showType = 'list';
                $container.find('#topicWrap').hide();
                $container.find('#listWrap').show();
            } else {
                showType = 'topics';
                $container.find('#topicWrap').show();
                $container.find('#listWrap').hide();
            }

            this.options.onShowTypeChange && this.options.onShowTypeChange(showType);
        };

        this.init = function (options) {
            let self = this;
            const isPage = customParams.isPage || false;  // 展示界面形式为 page or dialog
            $container.html(template('topicImages/index', {
                isNewImgCopyrightWhiteList: (typeof g_userStatus !== 'undefined') && window.g_userStatus.isNewImgCopyrightWhiteList,
                isPage
            }));
            self.topicComponent = new TopicComponent();
            self.topicComponent.init({ isPage });

            self.imageListComponent = new ImageListComponent();
            self.imageListComponent.init();
            this.options = options;
            this.commonEventBind();
        };
        // 获取是否显示会员页卡以及会员图片剩余张数
        this.getVCGPicMonthLeftData = function () {
            return visualChinaApi.getVCGPicMonthLeft().then(function (resp) {
                console.log(resp);
                if (resp.response.code == 0) {
                    let data = resp.data || {};
                    window.limitInfo.ischarge = data.ischarge || 0;
                    window.limitInfo.iseditor = data.iseditor || 0;
                    window.limitInfo.left = data.left || 0;
                }
            });
        };
        this.commonEventBind = function () {
            let self = this;
            $container.on('click', '.toImagelist', function () {
                let groupId = $(this).attr('data-id');

                if (groupId) {
                    self.switchView();
                    self.imageListComponent.repaint(groupId);
                }
            });
            $container.on('click', '.toTopicList', function () {
                self.imageListComponent.clear();
                self.switchView();
            });
        };
        // 标记图片已经被添加到素材库
        // eslint-disable-next-line
        this.setImageIsInGallery = function (index, imgIsLimit) {
            let currrentFilter = self.getCurrentFilter();
            currrentFilter.modifyListData(index, 'is_local_exist', 1);
            if (imgIsLimit == 1 && window.limitInfo.left > 0) {
                window.limitInfo.left--;
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
            let self = this;
            let imgData = self.imageListComponent.getData();
            return imgData.selectedData;
        };
    }
    return Builder;
});
