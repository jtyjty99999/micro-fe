define(function(require, modules, exports) {
    var base=require('base/base');
    var omlayer=base.omlayer;
    var componentTemplate = base.componentTemplate;
    //var dialogTemplate = base.dialog.template;
    var dialogTemplate = require('base/dialog/template');
    var voteCreateEdit = require('biz/vote/component/voteCreateEdit');
    var Paging = base.component.paging;
    var selectedData = {
        voteid: "",
        votename: ""
    };
    var pageNum = 1,
        loading = false,pagelist = '',listEnd = false;
    var voteCreateEditInstance;
    DialogVote = function(params) {
        var config = {};
        $.extend(true, config, params);
    };

    DialogVote.prototype = {
        show: function(callback) {
            var _this = this;
            $("body").css("overflow","hidden");
            layerId = layer.open({
                type: 1,
                title: "插入投票",
                content: dialogTemplate("art-dialog-vote", {}),
                area: ['800px', '640px'],
                move: false,
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    initTabs($container);
                    initForm($container);
                    initList($container);
                },
                yes: function(index, $container) {
                    if ($container.find("[data-id='form']").hasClass("active")) { //新建投票
                        voteCreateEditInstance.getVoteData(function(resp) {
                            selectedData.voteid = resp.data.voteid;
                            selectedData.votename = resp.data.title;
                            callback && callback(selectedData);
                        });
                    } else {
                        // 列表选择
                        if(selectedData.voteid == ""){
                            popAlert("error", '请选择投票');
                            return;
                        }
                        callback && callback(selectedData);
                    }
                },
                no: function(index, $container) {

                },
                end:function(){
                    $("body").css("overflow","auto")
                }
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    }

    function initTabs($container) {
        $container.on('click', '.tab>li', function(event) {
            $container.find(".tab>li").removeClass("active");
            $container.find("[data-content]").hide();
            $container.find("[data-content='" + $(this).data("id") + "']").show();
            $(this).addClass("active");
        })

        $container.find('[data-id="form"]').addClass('active');
        $container.find('[data-content="form"]').show();

        $container.find('[data-id="list"]').removeClass('active');
        $container.find('[data-content="list"]').hide();
    }

    function initForm($container) {
        $form = $container.find('[data-content="form"]');
        var _html = componentTemplate('votePage');
        $form.find('.votepage').html(_html);
        voteCreateEditInstance = (new voteCreateEdit($form.find('.votepage'))).build(false);
        voteCreateEditInstance.setVoteData("");
    }

    function initList($container) {
        pageNum = 1,loading = false,pagelist = '',listEnd = false;
        $page = $container.find('[data-content="list"]');
        $page.delegate('.operate', 'click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var _this = $(e.target);
            var tr = _this.parents('.votetr');
            var _voteid = tr.attr("id");
            //var _idx = _li.attr("idx");
            if (tr.attr('choosed') == '0') {
                //if (_voteid != votedata.voteid) {
                $('#' + selectedData.voteid).attr('choosed', '0');
                selectedData.voteid != "" && $('#' + selectedData.voteid).find(".operate").html('选择');
                selectedData.voteid = _voteid;
                tr.find(".operate").html('取消');
                tr.attr('choosed', '1');
                selectedData.votename = $('#' + selectedData.voteid).find(".text-vote-title").html();
            } else {
                $('#' + selectedData.voteid).attr('choosed', '0');
                tr.find(".operate").html('选择');
                selectedData.voteid = "";
                selectedData.votename = "";
            }
        });
        $container.find('.vote-list-inner.scroll-theme').on('scroll', function(e) {
            var panel = this;
            if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                if (pageNum != 0 && !loading && !listEnd) {
                    loadData(++pageNum,{
                        unexpired: 1
                    });
                }
            }
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
        function renderlist(res) {
            var html = "",
                i = 0;
            var article;
            //var totalPage = 1;
            loading = false;
            var _data = res.data.list;
            if (!_data || _data == null || _data.length == 0) {
                listEnd = true;
                if(res.data.page == '1'){
                    $('.no-hover').show();
                }

                //this.setSortable(false);
            } else {
                $.each(_data,function(i,_d){
                    html += dialogTemplate("art-dialog-vote-list-item", _d);
                })
                $page.find('.table-vote tbody').append(html);
                //$page.find('tbody').html(html);
            }

        }

        function nolist() {

            loading = false;
            //$page.find('.no-hover').show();
            //OM.vote_util.Mvote.initData.view.find(".vote-list tbody").html('<tr>  <td colspan="4"> <div class="table-null-box">  <p><i class="icon icon-vote-lg"></i></p>  <p>暂无投票</p>  </div> </td>  </tr>');
            //$page.find('.paginationholder').html('');
        }

        function loadData(page, param) {
            loading = true;
            if (!!page && page == 1) {
                var param = {
                    currentPage: 1,
                    totalPage: 0,
                    perNum: 5,
                    getlistparam: param,
                    paginationholder: $page.find('.paginationholder'),
                    api: 'getVoteList',
                    okfunc: renderlist,
                    nofunc: nolist

                }
                pagelist = new Paging(param);
                //OM.vote_util.Mvote.initData = $.extend(true,OM.vote_util.Mvote.initData,  OM.vote_util.Mvote.initData.list.data);
                pagelist.getList(1);
            } else if(page <= pagelist.data.totalPage){
                //OM.vote_util.Mvote.initData.list.data.currentPage = OM.vote_util.Mvote.initData.currentPage;
                pagelist.getList(page);
                //loading = false;
            }
        }
        loadData(1, {
            unexpired: 1
        });
    }
    return DialogVote;
});