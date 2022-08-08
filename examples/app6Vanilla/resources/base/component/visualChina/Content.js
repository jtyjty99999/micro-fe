define(function (require, exports, module) {
    let visualChinaApi = require('base/api/visualChina');
    function Content(tabType, tabSort) {
        let cacheDfd = {};
        let data = {
            listCode: 0,
            listData: [], // 列表数据
            pageTotal: 0// 总页数
        };
        let params = {// 默认参数
            searchText: '',
            pageNo: 1,
            pageLimit: 8
        };
        let getListFun;
        switch (tabType) {
            case 'freedom':
                getListFun = visualChinaApi.getVCGFreePicList;
                break;
            case 'limit':
                getListFun = visualChinaApi.getVCGChargePicList;
                break;
            case 'edit':
                getListFun = visualChinaApi.getVCGEditPicList;
                break;
        }
        switch (tabSort) {
            case 'hot':
                params.sort = 'best';
                break;
            case 'latest':
                params.sort = 'time';
                break;
        }
        function init() {

        }
        let self = this;
        // 从服务器端拉取数据（只要没有被reset，第二次请求就来自缓存）
        this.fetchData = function() {
            let reqParams = {};
            reqParams = {
                page: params.pageNo,
                limit: params.pageLimit,
                sort: params.sort
            };
            if (params.searchText) {
                reqParams.keyword = params.searchText;
            }
            let dfd = $.Deferred(function(defer) {
                if (!cacheDfd['fetchData']) {

                    cacheDfd['fetchData'] = getListFun(reqParams).then(function(resp) { // 处理列表数据
                        // 对于付费版权图片，改为了请求后台接口+视觉中国接口
                        if (Array.isArray(resp)) {
                            data.listData = [];
                            data.pageTotal = 0;
                            // eslint-disable-next-line
                            resp.forEach(respItem => {
                                if (respItem.response && respItem.response.code == 0 && respItem.data) {
                                    data.listCode = 0;
                                    data.listData = data.listData.concat(respItem.data.list);
                                    data.pageTotal += Number(respItem.data.total_page);
                                }
                            });
                            if (data.listData.length === 0) {
                                data.listCode = resp[0].response.code;
                                data.listData = null;
                                cacheDfd['fetchData'] = null;
                            }
                            return;
                        }
                        if (resp.response.code == 0) {
                            if (resp.data) {
                                data.listData = resp.data.list || [];// 列表数据
                                data.pageTotal = resp.data.total_page;// 总页数
                            } else {
                                data.listData = null;// 接口数据异常
                                cacheDfd['fetchData'] = null;
                            }
                        } else {
                            data.listData = null;// 接口数据异常
                            cacheDfd['fetchData'] = null;
                        }
                        data.listCode = resp.response.code;
                    });
                }
                cacheDfd['fetchData'].then(function() {
                    defer.resolve(data);
                }, function() {
                    defer.resolve({ listCode: 'error', listData: null });
                });
            }).promise();
            return dfd;
        };
        this.setParams = function(customParams) {
            $.extend(true, params, customParams);
        };
        // 设置当前页码
        this.setPageNo = function(pageNo) {
            params.pageNo = pageNo;
        };
        // 设置每一页大小
        this.setPageLimit = function(pageLimit) {
            params.pageLimit = pageLimit;
        };
        // 设置搜索文本
        this.setSearchText = function (searchText) {
            params.searchText = searchText;
        };
        // 修改列表数据
        this.modifyListData = function(index, key, value) {
            data.listData[index][key] = value;
        };
        this.reset = function() {
            cacheDfd['fetchData'] = false;
            data = {
                listCode: 0,
                listData: [], // 列表数据
                pageTotal: 0// 总页数
            };
        };
    }

    return Content;
});
