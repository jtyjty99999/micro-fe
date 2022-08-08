/**
 * Created by jonahnzhang on 2016/4/7.
 */
define(function (require, exports, module) {
    var base=require('base/base');
    var artApi = require('base/api/art');
    var omlayer=base.omlayer;
    function Paging(param) {
        var initData = {
            currentPage: 1,
            totalPage: 0,
            perNum: param.perNum || 5,
            getlistparam: param.getlistparam ||{}, //自定义拉取接口的参数
            paginationholder: param.paginationholder || $('.paginationholder'),
            api: param.api,
            pop:true,
            dataFilter:param.dataFilter,
            nextfunc:param.nextfunc,
            prevfunc:param.prevfunc,
            gofunc:param.gofunc,
            okfunc: param.okfunc, //拉取接口有数据时调用的函数
            nofunc: param.nofunc  //拉取接口无数据时调用的函数
        };
        if(param.popClose){//不提示错误
            initData.pop=false;
        }
        var getList = function (page) {
            if (page <= 0) {
                initData.nofunc();
                return;
            }
            var param = initData.getlistparam;
            initData.currentPage = page;
            param.index = page;
            param.page = page;
            param.num = initData.perNum;

            artApi[initData.api](param, function (res) {
                if(res.response.code == '-32602'){
                    if(initData.pop){
                        popAlert("error", '请重新登录');
                        return;
                    }
                }else if(res.response.code != 0){
                    if(initData.pop) {
                        popAlert("error", '列表拉取失败');
                        return;
                    }
                }

                if(initData.dataFilter){
                    initData.dataFilter(res).done(function(data){
                        renderListByPage(data);
                    })
                }else{
                    renderListByPage(res);
                }
            });
        };
        var renderListByPage = function (res) {
            var html = "",
                i = 0,that = this;
            var article;
            //var totalPage = 1;
            var pages =0;
            //if(!!res.data.totalPage){
            //    pages = res.data.totalPage;
            //}else{
            var totalNum = !!res.data.total? res.data.total:!!res.data.totalNumber?res.data.totalNumber: 0;
            pages = Math.ceil(parseInt(totalNum) / initData.perNum);
            //}

            if (initData.totalPage != pages || initData.currentPage == 1) {
                initData.totalPage = pages;
                if(initData.paginationholder != ''){
                    setPagination(initData.totalPage,initData.currentPage);
                }
            }
            initData.okfunc(res);

        };

        var setPagination = function (pageCount, curPage) { //分页
            var that = this;
            initData.paginationholder.html('<ul class="pagination"></ul>');
            if (curPage > pageCount) {
                return;
            }
            initData.paginationholder.find('.pagination').twbsPagination({
                totalPages: pageCount,
                visiblePages: 6,
                startPage: curPage,
                onPageClick: function (event, page, action) {
                    //console.log(page);
                    initData.currentPage = page;
                    getList(page);
                }
            });
        }
        return{
            data: initData,
            getList: getList
        }

    };

    return Paging;
});
