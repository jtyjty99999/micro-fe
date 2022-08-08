define(function (require, exports, module) {
    var base=require('base/base');
    var Content=require('base/component/visualChina/Content');
    function Filter(tabType,tabSort,customParams){//tabType表示type类型：付费或者免费,tabSort表示初始的分类：热门或者最新，customParams中可以自定义页码、页数、搜索文本
        var self=this;
        var HOTSORT='hot';//普通图库 不受限
        var LATESTSORT='latest';//高级图库 受限，一个月30张
        var hotContent=new Content(tabType,HOTSORT);
        var latestContent=new Content(tabType,LATESTSORT);
        var data={};
        data.tabType=tabType;
        data.tabSort=tabSort;
        var commonParams={//通用参数
            searchText:''
        };
        var hotParams={//hot内容参数
            pageNo:1,
            pageLimit:8
        };
        var latestParams={//latest内容参数
            pageNo:1,
            pageLimit:8
        };
        if(customParams.searchText){
            commonParams.searchText=customParams.searchText;
            delete customParams.searchText;
        }
        $.extend(true,hotParams,customParams);
        $.extend(true,latestParams,customParams);
        function getCurrentContent(){
            var currentContent;
            switch (data.tabSort){
                case HOTSORT:
                    hotContent.setParams($.extend(true,{},hotParams,commonParams));
                    currentContent=hotContent;
                    break;
                case LATESTSORT:
                    latestContent.setParams($.extend(true,{},latestParams,commonParams));
                    currentContent=latestContent;
                    break;
            }
            return currentContent;
        }
        //获取除了content之外的信息
        this.getConfigData=function(){
            var configData = {
                tabType:data.tabType,
                tabSort:data.tabSort,
                searchText:commonParams.searchText
            };
            switch (data.tabSort){
                case HOTSORT:
                    configData=$.extend(true,{},hotParams,configData);
                    break;
                case LATESTSORT:
                    configData=$.extend(true,{},latestParams,configData);
                    break;
            }
            return configData;
        };
        //获取数据
        this.getData=function(){
            return $.Deferred(function(defer){
                var currentContent=getCurrentContent();

                //获取数据
                currentContent.fetchData().then(function(contentData){
                    var mergeData=$.extend(true,{},self.getConfigData(),contentData);
                    defer.resolve(mergeData);
                },function(){
                    defer.reject();
                });
            }).promise();
        };
        //设置sort
        this.setTabSort=function(tabSort){
            data.tabSort=tabSort;
            //return this.getData();
        };
        this.cacheSearchText=function(searchText){
            commonParams.searchText=searchText;
        };
        //设置搜索文本
        this.setSearchText=function(){
            //设置了搜索文本，内容都要重置
            data.tabSort=HOTSORT;//sort重置
            hotParams.pageNo=1;//页码重置
            hotContent.reset();//清空内容和缓存
            latestParams.pageNo=1;//页码重置
            latestContent.reset();//清空内容和缓存
        };
        //设置页码
        this.setPageNo=function(pageNo){
            switch (data.tabSort){
                case HOTSORT:
                    hotParams.pageNo=pageNo;
                    break;
                case LATESTSORT:
                    latestParams.pageNo=pageNo;
                    break;
            }
            var currentContent=getCurrentContent();
            currentContent.reset();//清空内容和缓存
        };
        //修改列表数据
        this.modifyListData=function(index,key,value){
            var currentContent=getCurrentContent();
            currentContent.modifyListData(index,key,value);
        };
    }
    return Filter;
});
