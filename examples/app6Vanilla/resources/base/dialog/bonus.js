define(function(require, modules, exports) {
    const api = require('base/api/article');
    const omtemplate = require('base/dialog/template');

    let layerId;
    let selectedData = {};
    let linkUrl = '';
    let loading = false;
    let selectedText = '';


    function updateText($input, text) {
        if (!text) {
            return;
        }
        console.log('text', text);
        $('#dialogBonusInput').show();
        $input.val(text);
        let inputLength = $input.val().replace(/(^\s*)|(\s*$)/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').length;
        if (inputLength > 40 || inputLength < 1) {
            $input.siblings('.count').addClass('error');
        } else {
            $input.siblings('.count').removeClass('error');
        }
        $input.siblings('.count').find('em').text(inputLength);
        $input.siblings('.placeholder').hide();
    }

    let Dialogbonus = function(params) {
        let config = {};
        this.config = $.extend(true, config, params);
    };

    Dialogbonus.prototype = {
        show: function(callback, selectionText) {
            let _this = this;
            let overflow = $('body').css('overflow');
            $('body').css('overflow', 'hidden');
            layerId = layer.open({
                type: 1,
                title: ['插入微视红包'],
                content: omtemplate('art-dialog-bonus', { url: 'https://static.om.qq.com/om/om_3.0/normal/html/LsX9gXthh844SzQv8Yjhk5e9o1uYPJrr.html' }),
                area: ['810px', '660px'],
                move: false,
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    loading = false;
                    // 数据初始化
                    if (selectionText) {
                        selectedText = selectionText;
                        updateText($('#bonusDescInput'), selectionText);
                    } else {
                        selectedText = '';
                    }
                    $('#bonusDescInput').focus();
                    linkUrl = '';
                    initList($container);
                },
                yes: function(index, $container) {
                    let data = {};
                    data = selectedData;
                    data.title = $('#bonusDescInput').val();
                    if ($('#dialogBonusInput').is(':visible')) {
                        data.title = data.title.replace(/(^\s*)|(\s*$)/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
                        if (data.title.length === 0) {
                            layer.msg('文本不能少于1个字');
                            return;
                        }
                        if (data.title.length > 40) {
                            layer.msg('文本不能大于40个字');
                            return;
                        }
                        if (!/^http.*/.test(linkUrl)) {
                            layer.msg('未指定任何文章链接');
                            return;
                        }
                    }

                    data.link = linkUrl;

                    console.log(data);
                    callback && callback(data);
                    selectedData = {};
                },
                no: function(index, $container) {

                },
                end: function() {
                    $('body').css('overflow', overflow);
                    loading = false; }
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };


    function initList($container) {
        $container.find('.null-loading').show();
        let $list = $container.find('#con-normal tbody');
        $list.on('click', 'a.btn', function() {
            $list.find('i.icon-ok-blue').hide();
            $list.find('a.btn').show();
            $('#dialogBonusInput').show();
            $(this).hide();
            $(this).siblings('i.icon-ok-blue').show();
            let data = $(this).parents('tr').data('bonus');
            // if (selectedText == "") {
            updateText($('#bonusDescInput'), data.desc || '');
            // }
            selectedData = data;
            linkUrl = data.url;
        });


        $('#bonusDescInput').on('keydown keyup change', function() {
            $(this).siblings('.placeholder').hide();

            let inputLength = $(this).val().replace(/(^\s*)|(\s*$)/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').length;
            if (inputLength > 40 || inputLength < 1) {
                $(this).siblings('.count').addClass('error');
            } else {
                $(this).siblings('.count').removeClass('error');
            }
            $(this).siblings('.count').find('em').text(inputLength);
        }).on('blur', function() {
            if ($(this).val().length > 0) return false;
            $(this).siblings('.placeholder').show();
        }).on('focus', function() {
            $(this).siblings('.placeholder').hide();
        });

        function loadData(callback) {
            loading = true;
            let $list = $container.find('#con-normal tbody');
            api.getRedPacketList()
                .then(function(resp) {
                    if (resp.response.code != 0) return;
                    callback && callback(resp);
                    let list = resp.data.feed_list || [];
                    for (let i = 0, len = list.length; i < len; i++) {
                        let e = list[i];
                        e.desc = '快来领我的微视现金红包' + e.desc;
                        if (e.desc.length > 40) e.desc = e.desc.slice(0, 37) + '...';
                        let $item = $(omtemplate('art-dialog-bonus-item', e));
                        $item.data('bonus', e);
                        $list.append($item);
                    }
                    if (list.length == 0) $('#dialogBonusInput').hide();
                    loading = false;
                }).fail(function() {
                    loading = false;
                });
        }

        loadData(function(resp) {
            $container.find('.null-loading').hide();
            $container.find('.qq').html(resp.data.qq || '');
            $container.find('.weishiname').html(resp.data.name || '');
            let list = resp.data.feed_list;
            if (list.length == 0) {
                $container.find('.null-mod').show();
            } else {
                $container.find('.pop-insert-table-tbody').show();
            }
        });
    }
    return Dialogbonus;
});