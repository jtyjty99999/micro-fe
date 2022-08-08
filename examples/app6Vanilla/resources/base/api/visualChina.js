define(function (require, exports, module) {
    let visualChina = {};
    // 获取收费版图片列表
    visualChina.getVCGChargePicList = function(params) {
        return $.ajax({
            type: 'get',
            url: '/visualChina/getVCGChargePicList',
            data: params,
            dataType: 'json'
        });
    };
    // 获取视觉中国编辑图片列表，对应编辑图库tab页，暂时先用高级图库接口
    // update: 现在这里要同时请求视觉中国和后台的接口
    visualChina.getVCGEditPicList = function(params) {
        function promsieAny(promises = []) {
            // 等到所有promise有结果，且只要有一个promise是resolve就是resolve
            let results = [];
            let errors = [];
            let promiseResolvedCount = 0;
            const totalPromiseLength = promises.length;
            return new Promise(function(resolve, reject) {
                for (let i = 0; i < totalPromiseLength; i++) {
                    let promise = promises[i];
                    promise // eslint-disable-next-line
                        .then(function(value) {
                            results.push(value);
                            promiseResolvedCount++;
                            if (promiseResolvedCount === totalPromiseLength) {
                                if (results.length === 1) {
                                    resolve(results.shift());
                                } else if (results.length > 1) {
                                    resolve(results);
                                } else {
                                    reject(errors);
                                }
                            } // eslint-disable-next-line
                        }, function(error) {
                            errors.push(error);
                            promiseResolvedCount++;
                            if (promiseResolvedCount === totalPromiseLength) {
                                if (results.length === 1) {
                                    resolve(results.shift());
                                } else if (results.length > 1) {
                                    resolve(results);
                                } else {
                                    reject(errors);
                                }
                            }
                        });
                }
            });
        }
        const visualChinaDataPromise = $.ajax({
            type: 'get',
            url: '/visualChina/getVCGEditorPicList',
            data: params,
            dataType: 'json'
        });
        const innerDataPromise = $.ajax({
            type: 'get',
            url: '/image/searchInImagePlatform',
            data: params,
            dataType: 'json'
        });
        return promsieAny([visualChinaDataPromise, innerDataPromise]);
    };
    // 获取收费版图片列表
    visualChina.getVCGFreePicList = function(params) {
        return $.ajax({
            type: 'get',
            url: '/visualChina/getVCGFreePicList',
            data: params,
            dataType: 'json'
        });
    };
    // 取收费图片剩余额度，按月
    visualChina.getVCGPicMonthLeft = function() {
        return $.ajax({
            type: 'get',
            url: '/visualChina/getVCGPicMonthLeft',
            data: {},
            dataType: 'json'
        });
    };
    // 添加图片到素材库
    visualChina.addVCGPicToGallery = (function() {
        let cacheDfd = {};
        function handler(params, refresh) {
            if (!cacheDfd[params.vcgpicid] || refresh) {
                if (params.downloadurl) {
                    cacheDfd[params.vcgpicid] = $.ajax({
                        type: 'post',
                        url: '/image/imagePlatformUpload?isRetImgAttr=1&relogin=1',
                        data: {
                            url: params.downloadurl,
                            source_type: params.sourceType,
                            source_id: params.vcgpicid,
                        },
                        dataType: 'json'
                    });
                } else {
                    cacheDfd[params.vcgpicid] = $.ajax({
                        type: 'get',
                        url: '/visualChina/addVCGPicToGallery',
                        data: params,
                        dataType: 'json'
                    });
                }
                cacheDfd[params.vcgpicid].then(function(resp) {
                    if (!resp.data || resp.response.code != 0) { // 如果失败了 清除缓存
                        cacheDfd[params.vcgpicid] = null;
                    }
                }, function() {
                    cacheDfd[params.vcgpicid] = null;// 如果失败了 清除缓存
                });
            }
            return cacheDfd[params.vcgpicid];
        }
        return handler;
    })();
    // 添加到素材站
    visualChina.addToMat = function(params) {
        return $.ajax({
            type: 'get',
            url: '',
            data: params,
            dataType: 'json'
        });
    };

    // 获取专题列表
    visualChina.getVCGGroupListBySearch = function(params) {
        return $.ajax({
            type: 'get',
            url: '/visualChina/getVCGGroupListBySearch',
            data: params,
            dataType: 'json'
        });
    };

    // 获取专题列表
    visualChina.getVCGGroupDetail = function(params) {
        return $.ajax({
            type: 'get',
            url: '/visualChina/getVCGGroupDetail',
            data: params,
            dataType: 'json'
        });
    };

    // 获取图片详情
    visualChina.getVCGPicEditorDetail = function(params) {
        return $.ajax({
            type: 'get',
            url: '/visualChina/getVCGPicEditorDetail',
            data: params,
            dataType: 'json'
        });
    };
    // 获取图片详情
    visualChina.addVCGGroupPicToGallery = function(params) {
        return $.ajax({
            type: 'get',
            url: '/visualChina/addVCGGroupPicToGallery',
            data: params,
            dataType: 'json'
        });
    };
    return visualChina;
});
