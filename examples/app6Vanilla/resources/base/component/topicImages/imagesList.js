define(function (require, exports, module) {
    let visualChinaApi = require('base/api/visualChina');
    let template = require('base/component/template');
    let omlayer = require('layer/layer');
    function ImageList() {
        this.$container = $('#listWrap');
        this.alldataMap = {};
        this.state = {
            vcggroupid: '',
            selectedData: [],
            selectedIds: ''
        };
    }
    ImageList.prototype = {
        init: function() {
            this.bindEvents();
        },
        repaint: function(id) {
            this.setState({
                vcggroupid: id || this.setState.vcggroupid,
                page: 1
            }).rend();
        },
        rend: function() {
            let self = this;
            let params = $.extend({}, self.state);
            visualChinaApi.getVCGGroupDetail(params).then(function (data) {
                if (data && data.response.code == 0) {
                    self.alldataMap = {};
                    $.each(data.data.list, function(i, l) {
                        self.alldataMap[l.res_id] = l;
                    });
                    self.$container.find('.imagesListWrap').html(template('topicImages/images-list-item', data.data));
                } else {
                    omlayer.msg('获取专题列表失败，请刷新重试');
                }
            });
        },
        setState: function(data) {
            this.state = $.extend({}, this.state, data);
            return this;
        },
        bindEvents: function() {
            let self = this;
            /* 滚动拉取图片 */
            // self.$container.find(".imagesListWrap").on('scroll', function(e) {
            //     var panel = this;
            //     if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
            //         _this.getImageData();
            //     }
            //     e.stopPropagation();
            //     e.preventDefault();
            //     return false;
            // });
            /* 选中图片 */
            self.$container.on('click', '.upload-cover-block', function(e) {
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                }

                self.updateSelectedData();
            });
            self.$container.on('click', '.icon-checkbox', function(e) {
                let $checkbox = $(this);

                if ($checkbox.hasClass('checkbox-active')) {
                    $checkbox.removeClass('checkbox-active');
                    self.$container.find('.imagesListWrap .upload-cover-block').removeClass('active');
                } else {
                    self.$container.find('.imagesListWrap .upload-cover-block').addClass('active');
                    $checkbox.addClass('checkbox-active');
                }

                self.updateSelectedData();
            });
        },
        updateSelectedData: function($el) {
            let self = this;
            let selectedData = [];
            let selectedIds = [];
            self.$container.find('.imagesListWrap .upload-cover-block.active').each(function() {
                let $item = $(this);
                let id = $item.attr('data-id');
                let data = self.alldataMap[id];
                data.copyright = '1';
                selectedIds.push(id);
                selectedData.push(data);
            });

            self.setState({
                selectedData: selectedData,
                selectedIds: selectedIds.join(',')
            });
        },
        getData: function() {
            return $.extend({}, this.state);
        },
        clear: function() {
            this.alldataMap = {};
            this.setState({
                vcggroupid: '',
                selectedData: [],
                selectedIds: ''
            });
            this.$container.find('.imagesListWrap').html('');
            this.$container.find('.icon-checkbox').removeClass('checkbox-active');
        }
    };

    return ImageList;
});