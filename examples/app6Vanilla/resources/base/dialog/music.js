define(function(require, modules, exports) {
    var api = require('base/api/music');
    var omtemplate = require('base/dialog/template');
    var layerId;
    var selectedData = {};
    var kw; //检索关键字

    var pageNum = 1,
        loading = false;

    var audio = require('base/component/audio');

    var player = null;
    DialogMusic = function(params) {
        var config = {};
        $.extend(true, config, params);
    };

    DialogMusic.prototype = {
        show: function(callback) {
            if (!window.soundManager) {
                $.getScript("https://om.gtimg.cn/om/om_2.0/libs/sound/soundmanager2-nodebug-jsmin.js", function() {
                    window.soundManager.setup({
                        url: '//om.gtimg.cn/om/om_2.0/libs/sound/',
                        flashLoadTimeout: 0,
                        preferFlash: false,
                        onready: function() {

                        }
                    });
                });
            } else {
                window.soundManager.setup({
                    url: '//om.gtimg.cn/om/om_2.0/libs/sound/',
                    flashLoadTimeout: 0,
                    preferFlash: false,
                    onready: function() {

                    }
                });
            }

            var _this = this;
            $("body").css("overflow", "hidden");
            layerId = layer.open({
                type: 1,
                title: "插入音乐",
                content: omtemplate("art-dialog-music", {}),
                area: ['800px', '660px'],
                move: false,
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    selectedData = {};
                    initList($container);
                },
                yes: function(index, $container) {
                    var data = {};
                    data = selectedData;
                    if (!data.id) {
                        layer.msg("未选择任何歌曲");
                    } else {
                        api.getMusicPlayUrl(data.id).then(function(e) {
                            data.mrul = e;
                            data.albumnpic = data.coverimg;
                            data.data = data.f;
                            callback && callback(data);
                        }).fail(function() {
                            layer.msg("链接获取失败，请重试");
                        });
                    }
                    selectedData = {};
                    audio.reset();
                },
                end: function() {
                    $("body").css("overflow", "auto");
                    audio.reset();
                }
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };


    function initList($container) {
        var kw;
        $page = $container.find('[data-content="list"]');

        $container.on('click', '[data-action="search"]', function() {
            kw = $("#music_kw").val();
            !!kw && loadData(1, function(resp) {
                if (resp.list.length == 0) {
                    $container.find(".null-mod").show();
                    $container.find(".insert-music-body").hide();

                }
            });
            !!kw && $container.find('.table-insert-music tbody').html("");

        });

        $container.on('click', '[data-action="clean"]', function() {
            $("#music_kw").val("");
            $("#music_kw").siblings(".placeholder").show();
            $("#music_list tbody").html("");
            $("#music_list").hide();
            $(this).hide();
            $container.find('.table-insert-music tbody').html("");
        });

        $container.on('click', '[data-action="play"]', function() {
            $container.find(".icon-music-playing").hide();
            $container.find(".icon-play-music").show();
            $(this).hide();
            $(this).siblings(".icon-music-playing").show();
            try {
                var data = $(this).parents("tr").data("music");
                var url = data.m4a;
                // 获取播放URL
                api.getMusicPlayUrl(data.id).then(function(e) {
                    var id = "m" + data.id;
                    audio.register({
                        id: id,
                        url: e,
                        onLoad: function() {
                            audio.play(id);
                        }
                    });
                });
            } catch (e) {

            }
            return false;
        });

        $container.on('click', '[data-action="pause"]', function() {
            $(this).hide();
            $(this).siblings(".icon-play-music").show();

            var data = $(this).parents("tr").data("music");
            audio.pause("m" + data.id);
            return false;
        });

        $container.on('click', 'tr', function() {
            $container.find(".ui-radio .icon-radio").removeClass("radio-active");
            $(this).find('.icon-radio').addClass("radio-active");
            selectedData = $(this).data("music");
        });

        $container.on('blur', '#music_kw', function(e) {
            if (!$(this).val()) {
                $(this).siblings(".placeholder").show();
            }
        });
        /*$container.on('focus', '#music_kw', function(e) {
            $(this).siblings(".placeholder").hide();
        });*/

        $container.on('keydown', '#music_kw', function(e) {
            if (e.keyCode == 13) {
                kw = $("#music_kw").val();
                !!kw && loadData(1, function(resp) {
                    if (resp.list.length == 0) {
                        $container.find(".null-mod").show();
                        $container.find(".insert-music-body").hide();

                    }
                });
                !!kw && $container.find('.table-insert-music tbody').html("");
            }
        });


        $container.find(".input-clear-btn").hide();
        $container.on('keydown keyup change', '#music_kw', function(e) {
            if (utils.trim($(this).val()).length > 0) {
                $container.find(".input-clear-btn").show();
                $container.find(".placeholder").hide();
            } else {
                $container.find(".input-clear-btn").hide();
                $container.find(".placeholder").show();
            }
        });

        $container.find(".insert-music-body.scroll-theme").on('scroll', function(e) {
            var panel = this;
            if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                if (pageNum != 0 && !loading) {
                    loadData(++pageNum);
                }
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        function addMusicItem(data) {
            var $item = $(omtemplate("art-dialog-music-list-item", e));
            $item.data("music", e);
            $container.find('.table-insert-music tbody').append($item);
        }

        function loadData(page, callback) {
            loading = true;
            api.getMusicList({
                    curpage: page,
                    perpage: 10,
                    kw: kw
                })
                .then(function(resp) {
                    $container.find(".null-mod").hide();
                    $container.find(".insert-music-body").show();
                    callback && callback(resp);
                    var list = resp.list;
                    for (var i = 0; e = list[i++];) {
                        addMusicItem(e);
                    }

                    if (list.length < 10) {
                        pageNum = 0;
                    }
                    loading = false;
                }).fail(function() {
                    loading = false;
                });
        }
    }
    return DialogMusic;
});