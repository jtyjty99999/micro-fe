define(function (require, exports, module) {
    let visualChinaApi = require('base/api/visualChina');
    function ListCat(cache, indexInstance, $container) {
        function eventBind() {
            // 添加到素材库
            $container.on('click', '.btn-add', function() {
                let $this = $(this);
                let type = $('[switchTabType].active').attr('switchTabType');
                let imgId = $this.attr('imgId');
                let imgIndex = $this.attr('imgIndex');
                let imgIsLimit = $this.attr('imgIsLimit');// 是否是会员
                let imgTitle = $this.attr('imgTitle');
                const downloadurl = $this.attr('imgdownloadurl');
                const sourceType = $this.attr('imgsourcetype');
                layer.msg('图片上传中', { icon: 4 });
                visualChinaApi.addVCGPicToGallery({
                    vcgpicid: imgId,
                    free: imgIsLimit, // 0:免费1:会员
                    vcgpictitle: imgTitle,
                    downloadurl,
                    sourceType,
                }).then(function(resp) {
                    layer.closeAll('loading');
                    if (resp.response.code == 0) {
                        indexInstance.setImageIsInGallery(imgIndex, imgIsLimit);
                    } else if (resp.response.code == 11) {
                        layer.msg('高级图库图片本月已用完', { icon: 2 });
                    } else if (resp.response.code != '-10403') {
                        layer.msg('服务繁忙，请稍候重试', { icon: 2 });
                    }
                }, function() {
                    layer.closeAll('loading');
                });
            });
        }
        eventBind();
        this.repaintBefore = function(data) {
            return data;
        };
        this.repaintAfter = function() {
            // 设置页码
            function setPageNo(pageNo) {
                console.log(pageNo);
                let currrentFilter = indexInstance.getCurrentFilter();
                currrentFilter.setPageNo(pageNo);
                $.extend(true, cache, currrentFilter.getConfigData());
                // indexInstance.repaint();//先渲染已经改变的数据
                indexInstance.render(cache.gid);// 它的gid由click.quickhit生成
            }
            let totalPages = Math.ceil(cache.pageTotal / cache.pageLimit);
            if (totalPages > 1000) { // 视觉中国那边超过一千页没有数据的
                totalPages = 1000;
            }
            if (cache.pageTotal > 0) {
                $('.paginationholder').twbsPagination({
                    startPage: cache.pageNo,
                    totalPages: totalPages,
                    onPageClick: function (event, pageIndex) {
                        console.log('pageIndex', pageIndex);
                        setPageNo(pageIndex);
                    }
                }).off('mousedown.quickhit').on('mousedown.quickhit', function(event) { // 将setPageNo方法gid放到这里生成，为了避免快速点击列表渲染不正常问题
                    let $target = $(event.target);
                    if ($target.is('a,i,button')) { // 上一页、下一页、跳转
                        cache.gid = indexInstance.getGid();
                        console.log('gid', cache.gid);
                    }
                });
            }
        };
        this.updateCache = function(newCache) {
            cache = newCache;
        };
    }
    return ListCat;
});
