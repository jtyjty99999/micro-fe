
define(function(require, exports, module) {
    /**
     * 图片循环加载器
     *
     * @description 使用head请求，循环加载图片，直到返回200并且x-errno不为0.
     * @param {string} 图片链接地址
     * @param {function} 加载成功回调
     * @param {number} 计数器默认为0，用来纪录请求次数，并在请求中标记
     */
    function looploadimg(imgsrc, cb, time) {
        if (!/puap.qpic.cn/.test(imgsrc)) {
            return cb(imgsrc);
        }
        time = time || 0;
        $.ajax({
            type: 'head',
            url: imgsrc + '?t=' + time,
            success: function(data, textStatus, res) {
                var err = res.getResponseHeader("X-ErrNo");
                if (err && err != 0) {
                    onerror();
                } else {
                    cb(imgsrc);
                }
            },
            error: onerror
        });

        function onerror() {
            time++;
            if (time < 100) {
                setTimeout(function() {
                    looploadimg(imgsrc, cb, time);
                }, 1000)
            }
        }
    }


    /**
     * 生成 guid
     */
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }


    var image = {

        getImages: function(params) {
            var url = "/image/list";
            var data = {};
            $.extend(data, params);
            data.types = "";
            data.limit = 12;
            var dfd = $.Deferred();

            utils.request({
                    type: "get",
                    url: url,
                    dataType: "json",
                    data: data
                })
                .then(function(resp) {
                    if (resp.response.code == 0) {
                        // 过滤非gif图
                        resp.data.list = resp.data.list.filter(function(e) {
                            return e.type != "1";
                        })
                        dfd.resolve(resp);
                    } else {
                        dfd.reject(resp);
                    }
                })
                .fail(function(resp) {
                    dfd.reject(resp);
                });
            return dfd.promise();
        },

        getImageList: function(params) {
            var widthoutGif = true;
            if (params.types && !/^[\d,]+$/.test(params.types)) {
                if (params.types.indexOf("gif") < 0) {} else {
                    widthoutGif = false;
                }
            }

            var url = "/image/list";
            var data = {};
            data.limit = 12;
            $.extend(data, params);
            data.types = "";

            var dfd = $.Deferred();
            utils.request({
                    type: "get",
                    url: url,
                    dataType: "json",
                    data: data
                })
                .then(function(resp) {
                    if (resp.response.code == 0) {
                        if (widthoutGif) {
                            // 过滤非gif图
                            resp.data.list = resp.data.list.filter(function(e) {
                                return e.type != "1";
                            })
                        }
                        dfd.resolve(resp);
                    } else {
                        dfd.reject(resp);
                    }
                }).fail(function(resp) {
                    dfd.reject(resp);
                });
            return dfd.promise();
        },

        getImageFilterList: function(data, option) {
            var params = {};
            var maxW = option ? option.maxWidth : 240,
                maxH = option ? option.maxHeight : 160;
            params.url = data.join(",");

            var url = '/image/imageInfoNoWater';
            var dfd = $.Deferred();
            utils.request({
                    url: url,
                    data: params,
                    dataType: "JSON",
                    type: "POST"
                })
                .then(function(resp) {
                    if (resp.response.code == 0) {
                        var list = [],
                            origin = [],
                            mapdata = {},
                            rdata = $.extend(true, {}, resp.data)
                        err = '0';
                        var errType = {};
                        for (var i = 0, ci; ci = data[i++];) {
                            // 图片有效 且不含二维码 
                            // 且不为gif
                            if (rdata[ci] && rdata[ci].isqrcode != "1" && rdata[ci].itype != "1") {
                                var item = rdata[ci].img.imgurl0 || {};
                                if (item.width >= maxW && item.height >= maxH) {
                                    var imgurl = ci;
                                    if (rdata[ci].img.imgurl641) {
                                        imgurl = rdata[ci].img.imgurl641.imgurl;
                                    } else if (rdata[ci].img.imgurl0) {
                                        imgurl = rdata[ci].img.imgurl0.imgurl;
                                    }

                                    list.push(imgurl);
                                    origin.push(ci);
                                    if (ci != imgurl) {
                                        mapdata[imgurl] = ci;
                                    }
                                } else {
                                    if (err < 1) {
                                        err = '1';
                                    }
                                    errType[ci] = 1;
                                }

                                try {
                                    delete rdata[ci];
                                } catch (e) {}
                            } else if (rdata[ci] && rdata[ci].itype == "1") {
                                err = "2";
                                errType[ci] = 2;
                            }
                        }
                        resp.origin = origin;
                        resp.data = list;
                        resp.map = mapdata;
                        resp.err = err;
                        resp.errType = errType;
                        dfd.resolve(resp);
                    } else {
                        dfd.reject(resp);
                    }
                }).fail(function(resp) {
                    dfd.reject(resp);
                });
            return dfd.promise();
        },
        getImageListInfo: function(data) {
            var params = {};
            params.url = data.join(",");

            var url = '/image/imageInfoNoWater';
            var dfd = $.Deferred();
            utils.request({
                    url: url,
                    data: params,
                    dataType: "JSON",
                    type: "POST"
                })
                .then(function(resp) {
                    if (resp.response.code == 0) {
                        var mapData = resp.data;
                        for (var i = 0, ci; ci = data[i++];) {
                            var imgurl = ci;
                            if (mapData[ci]) {
                                if (mapData[ci].img.imgurl641) {
                                    imgurl = mapData[ci].img.imgurl641.imgurl;
                                } else if (mapData[ci].img.imgurl0) {
                                    imgurl = mapData[ci].img.imgurl0.imgurl;
                                }
                                mapData[ci].imgurl = imgurl;
                                try {
                                    mapData[ci].width = mapData[ci].img.imgurl0.width;
                                    mapData[ci].height = mapData[ci].img.imgurl0.height;
                                } catch (e) {
                                    mapData[ci].width = 0;
                                    mapData[ci].height = 0;
                                }
                            }
                        }
                        dfd.resolve(mapData);
                    } else {
                        dfd.reject(resp);
                    }
                }).fail(function() {
                    dfd.reject(resp);
                });
            return dfd.promise();
        },

        getImageInfo: function(srcurl) {
            var params = {};
            params.url = srcurl;
            var url = '/image/imageInfo';
            var dfd = $.Deferred();
            utils.request({
                    url: url,
                    data: params,
                    dataType: "JSON",
                    type: "POST",
                    timeout: 1000
                })
                .then(function(resp) {
                    if (resp.response.code == 0) {
                        dfd.resolve(resp.data[srcurl] || {});
                    } else {
                        dfd.reject({});
                    }
                }).fail(function() {
                    dfd.reject({});
                });
            return dfd.promise();
        },

        getCoverFromOrigin: function(data) {
            var url = "/image/exactupload";
            var timeout = data.timeout;
            delete data.timeout;
            var params = {
                url: data.url,
                opCode: 151,
                isUpOrg: 1
            };
            $.extend(params, data);
            if (params.url && /^data:image/.test(params.url)) {
                // base64 前缀浏览器会自动调整
                params.base64 = params.url.replace(/^data:image\/[^;]+;base64,/, '');
                delete params.url;
            }
            return utils.request({
                type: "POST",
                url: url,
                dataType: "json",
                timeout: timeout,
                data: params
            });
        },

        getCoverFromCrop: function(data) {
            var url = "/image/cropupload";
            var params = {
                appkey: 1,
                opCode: 151,
                isUpOrg: 1
            };

            $.extend(params, data);
            if (params.url && /^data:image/.test(params.url)) {
                // base64 前缀浏览器会自动调整
                params.base64 = params.url.replace(/^data:image\/[^;]+;base64,/, '');
                delete params.url;
            }

            return $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                data: params
            });
        },

        getCoralFromURL: function(data) {
            var url = "/image/coralupload";
            var params = {
                appkey: 1,
                opCode: 156,
                isUpOrg: 1
            };
            $.extend(params, data);

            return utils.request({
                type: "get",
                url: url,
                dataType: "json",
                data: params
            });
        },
        checkImageExist: function(url, index) {
            return $.Deferred(function(dfd) {
                // var _u = /puui.qpic.cn/;
                var _u = /puap.qpic.cn/;
                if (_u.test(url)) {
                    $.ajax({
                        type: 'head',
                        url: url,
                        success: function(data, textStatus, res) {
                            var err = res.getResponseHeader("X-ErrNo");
                            if (err && err != 0) {
                                dfd.reject();
                            } else {
                                dfd.resolve(url);
                            }
                        },
                        error: dfd.reject
                    });
                } else {
                    var img = new Image();
                    img.onerror = function() {
                        dfd.reject();
                    }
                    img.onload = function() {
                        dfd.resolve(url);
                    }
                    img.src = url
                }
            }).promise()
        },
        getBase64: function(url) {
            return $.Deferred(function(dfd) {
                $.ajax({
                    url: '/image/convertBase64',
                    data: {
                        url: url
                    }
                }).then(function(base64data) {
                    var base64 = base64data.data;
                    base64 = 'data:image/jpeg;base64,' + base64;
                    dfd.resolve(base64);
                });
            }).promise();

        },

        /**
         * strselector 仅支持string
         */
        setsrc: function(strselector, imgpath) {
            return $.Deferred(function(dfd) {
                var loadid = guid();
                $(strselector).attr('load-id', loadid);
                looploadimg(imgpath, function(loadedurl) {
                    var ele = $(strselector + '[load-id="' + loadid + '"]');
                    ele.attr("src", loadedurl);
                    dfd.resolve(ele);
                })
            }).promise();

        },
        /**
         * objselector 支持对象
         */
        setVideoCover: function(objselector, imgpath) {
            return $.Deferred(function(dfd) {
                var loadid = guid();
                objselector.attr('load-id', loadid);
                looploadimg(imgpath, function(loadedurl) {
                    var ele = objselector;
                    if (!ele.attr("src") || /496_280\/0$/.test(ele.attr("src"))) {
                        ele.attr("src", loadedurl);
                    }
                    dfd.resolve(ele);
                })
            }).promise();
        },
        uploadImagesToCoral: function(images, sizeType) {
            var self = this;
            return $.Deferred(function(dfd) {
                var coralImages = [];
                if (images && images.length) {
                    $.each(images, function(index, vl) {
                        self.getCoralFromURL({
                            url: vl
                        }).then(function(resp) {
                            if (resp.response.code == 0) {
                                if (sizeType) {
                                    resp.data.url += '/' + sizeType
                                }
                                coralImages.push(resp.data);
                                if (coralImages.length == images.length) {
                                    dfd.resolve(coralImages)
                                }
                            } else {
                                dfd.reject();
                            }
                        });
                    });
                }
            })
        },
        checkImageCopyright: function(urls) {
            var url = "/image/checkImageCopyright";
            var params = {
                url: urls
            };
            return utils.request({
                type: "get",
                url: url,
                dataType: "json",
                data: params
            });
        },

    };
    return image;
});