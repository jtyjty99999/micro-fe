
// 通用视频接口
define(function(require, exports, module) {
    let cookie = require('base/tool/cookie');

    // 该方法有效性待验证
    function getToken() {
        // i 未定义,该方法未使用？
        // let e = i.getSkey();
        // let t = e ? time33(e) : '';
        return '';
    }

    /**
     * 加密算法
     */
    function time33(e) {
        // eslint-disable-next-line
        for (let t = 0, n = e.length, i = 5381; n > t; ++t) i += (i << 5) + e.charAt(t).charCodeAt();
        return 2147483647;
    }

    let generateToken = function(token) {
        let hash = 2013;
        let key = token;
        if (key) {
            for (let i = 0, len = key.length; i < len; i++) {
                hash += (hash << 5) + key.charCodeAt(i);
            }
        }
        return hash & 0x7fffffff;
    };


    let video = {
        /**
         * 获取视频列表
         * @param  {[type]} param [description]
         * @return {[type]}       [description]
         */
        getVideoList: function(param) {
            // support by leojcwang
            // 2016-10-20
            let url = '/VideoManager/UserToPubVideoList';
            param.mediaid = g_userInfo.mediaId;
            param.flip = 0; // 翻页模式
            param.cursor = 0;
            param.desc = true;
            param.limit = param.num;
            // 框架需要该值 by leojcwang

            // https://om.qq.com/VideoManager/UserToPubVideoList?mediaid=5131936&flip=0&desc=true&cursor=0&page=1&limit=12&relogin=1

            param.mediaid = g_userInfo.mediaId;
            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: param
            });

            // return $.Deferred(function(dfd) {
            //    .done(function(resp) {
            //         var data = resp;
            //         if (data.response.code == 0) {
            //             data.list = data.vi;
            //         }
            //         dfd.reject(data);
            //     }).fail(function(err) {
            //         dfd.reject(err);
            //     });
            // }).promise();
        },
        /**
         * param {Object} parma
         * param.query {String} 搜索关键词
         * param.tabidfilter {String} 分类id，取值来源extrainfo->zonghe->kid 字段
         * param.page {Number} 第几页
         * param.num  {Number} 一页多少个
         * param.pltimefilter {Number} 播放时常 0--全部 1--10分钟以下 2-- 10-30分钟 3-- 30-60分钟 4-- 60分钟以上
         * param.pubtimefilter {Number} 发布时间过滤：0--全部 1-- 一天 7-- 一周 14-- 两周 30-- 一个月
         * param.sort：{Number} 排序方式，0--相关性 1--更新 2--热度
         */

        /**
         * [getVodVideoList description]
         * @param  {[type]} param 查询参数
         * @return {[type]}       Promise
         * @author leojcwang minggong
         */
        getVodVideoList: function(param) {

            let url = '/VideoManager/VideoListBySearch';
            // var url = '/Omvideo/getVodVideoList';
            return $.Deferred(function(dfd) {
                utils.request({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    data: param
                }).then(function(resp) {
                    dfd.resolve(resp);
                });
            }).promise();
        },

        /**
         * 获取NBA视频分类信息，既查询条件
         *
         * param.page=1
         * param.page_size=30
         * param.sort=3
         * param.team=xxx
         * param.player=xxx
         * param.feature=xxx
         * param.match=xxx
         */
        getNBAFilters: function() {
            let url = '/omvideo/getNbaClassification';
            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json'
            });
        },

        /**
         * 获取NBA视频分类信息，既查询条件
         *
         * param.page=1
         * param.page_size=30
         * param.sort=3
         * param.team=xxx
         * param.player=xxx
         * param.feature=xxx
         * param.match=xxx
         */
        searchNBAVideo: function(param) {
            param = $.extend({}, {
                page: 1,
                page_size: 12,
                sort: 3
            }, param);
            let url = '/omvideo/searchNBAVideo';
            return utils.request({
                type: 'get',
                url: url,
                dataType: 'json',
                data: param
            });
        },

        getUserVideoList: function(params) {
            // 原接口请求参数

            // low_login:1
            // orderflag:0
            // pagenum:2
            // vnum:5
            // sorttype:0
            // contype:0
            // cull:0
            // conflag:0
            // bid:open_omg_video
            // open_uid:8514
            // open_token:9b4be3e14d
            // vid:
            // relogin:1

            let getDuration = function(num) {
                num = parseInt(num, 0) || 0;
                let h; let m; let s; let
                    r;
                s = num % 60;
                m = parseInt(num / 60, 0) % 60;
                h = parseInt(num / 60 / 60, 0);
                r = h + ':';
                r += ((m < 10) ? ('0' + m) : m) + ':';
                r += ((s < 10) ? ('0' + s) : s);
                return r;
            };

            let data = {};
            data.flip = '0'; // 0 page; 1 loadmore
            data.desc = true;
            data.page = params.pagenum;
            data.limit = params.vnum;
            data.cursor = 0;
            // ?flip&desc&cursor&page&limit

            // leijcwang 支持
            let url = '/VideoManager/UserVideoList';
            return $.Deferred(function(dfd) {

                utils.request({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    data: data
                }).done(function(resp) {
                    let r = resp;
                    if (r.response.code === 0) {
                        // eslint-disable-next-line
                        for (let i = 0, ci; ci = r.data.vi[i++];) {
                            // 兼容接口
                            if (!/^\d+:\d\d:\d\d$/.test(ci.duration)) {
                                ci.duration = getDuration(ci.duration);
                            }
                            if (typeof ci.standardbackflag === 'undefined' && ci.standardback) {
                                ci.standardbackflag = ci.standardback.standardback;
                            }
                            if (ci.censorback && ci.censorback.standardbackreason && ci.censor_reason && ci.censor_reason.length == ci.censorback.standardbackreason.length) {
                                // eslint-disable-next-line
                                for (let j = 0, cj; cj = ci.censor_reason[j++];) {
                                    cj.censore_flagnopass = ci.censorback.standardbackreason[j - 1].censore_flagnopass;
                                }
                            }
                        }
                    }
                    dfd.resolve(resp);
                }).fail(function(resp) {
                    dfd.reject(resp);
                });
            }).promise();
        },

        getUserVideoListSearch: function(params) {
            // 原接口请求参数

            // page = 1 页码
            // limit = 5  每一页请求数量
            // type 0全部 1已发布 2其他
            // keyword 关键词搜索

            let getDuration = function(num) {
                num = parseInt(num, 0) || 0;
                let h; let m; let s; let
                    r;
                s = num % 60;
                m = parseInt(num / 60, 0) % 60;
                h = parseInt(num / 60 / 60, 0);
                r = h + ':';
                r += ((m < 10) ? ('0' + m) : m) + ':';
                r += ((s < 10) ? ('0' + s) : s);
                return r;
            };

            // leijcwang 支持
            let url = '/VideoManager/UserVideoListWithSearch';
            return $.Deferred(function(dfd) {

                utils.request({
                    type: 'get',
                    url: url,
                    dataType: 'json',
                    data: params
                }).done(function(resp) {
                    let r = resp;
                    if (r.response.code === 0) {
                        // eslint-disable-next-line
                        for (let i = 0, ci; ci = r.data.vi[i++];) {
                            // 兼容接口
                            if (!/^\d+:\d\d:\d\d$/.test(ci.duration)) {
                                ci.duration = getDuration(ci.duration);
                            }
                            if (typeof ci.standardbackflag === 'undefined' && ci.standardback) {
                                ci.standardbackflag = ci.standardback.standardback;
                            }
                            if (ci.censorback && ci.censorback.standardbackreason && ci.censor_reason && ci.censor_reason.length == ci.censorback.standardbackreason.length) {
                                // eslint-disable-next-line
                                for (let j = 0, cj; cj = ci.censor_reason[j++];) {
                                    cj.censore_flagnopass = ci.censorback.standardbackreason[j - 1].censore_flagnopass;
                                }
                            }
                        }
                    }
                    dfd.resolve(resp);
                }).fail(function(resp) {
                    dfd.reject(resp);
                });
            }).promise();
        },

        setVideoInfo: function(data) {
            console.log(data);
            try {
                delete data.orifname;
                delete data.status;
                delete data.time;
                delete data.uin;
                delete data.view;
                delete data.plst;
            } catch (e) {}

            let params = {};
            $.extend(true, params, data);
            params.tags = params.tags || '';
            params.tags = params.tags.split(',').join(' ');
            if (/(160_90_3.jpg)|(\.png\/0)$/.test(params.imgurl)) {
                params.imgurl = '';
                params.imgurlsrc = '';
            }

            // pikayin 那边后台有 封面图白名单控制,前后台规则保持一致
            let customPattern = /(video.qpic.cn\/video_caps_enc\/[0-9a-zA-Z_]*)|(inews\.gtimg\.com\/newsapp_ls\/.+\/0$)/; // 用户自定义上传
            let sysPattern = /(p.qpic.cn\/vpic\/0\/.*_ori_[0-9]\.jpg)|(_fast_\d\.jpg\/0)/; // 系统封面图

            if (customPattern.test(params.imgurl)) {
                params.imgurlsrc = 'custom';
                // here we need to add the video cover source to analysis
                if (params.tabtype === 'system') {
                    params.imgurlsrc = 'usersystem';
                } else if (params.tabtype === 'upload') {
                    params.imgurlsrc = 'custom';
                } else if (params.tabtype === 'capture') {
                    params.imgurlsrc = 'capture';
                }
            } else if (sysPattern.test(params.imgurl)) {
                params.imgurlsrc = 'system';
                if (params.tabtype !== undefined && params.tabtype === 'system') {
                    params.imgurlsrc = 'usersystem';
                } else if (params.tabtype !== undefined && params.tabtype === 'capture') {
                    params.imgurlsrc = 'capture';
                }
            } else {
                params.imgurl = '';
                params.imgurlsrc = 'system';
            }

            // 切换视频服务
            // support by skypzhang
            // var url = '/omvideo/modifyVPVideoInfo';
            let url = '/VideoManager/UpdateVideoInfo';

            let dfd = $.Deferred();
            utils.request({
                url: url,
                data: params,
                dataType: 'JSON',
                type: 'POST'
            })
                .then(function(resp) {
                    dfd.resolve(resp);
                })
                .fail(function(err) {
                    dfd.reject(err);
                });
            return dfd.promise();
        },

        getVideoInfoWithOriginal: function(vid) {
            let dfd = $.Deferred();
            let data = {};
            data.vid = vid;
            data.uc = 0;
            data.rc = 0;
            // data.g_tk = getCookie('omtoken');
            data.open_uid = g_userInfo.mediaId;
            // data.bid = 'open_omg_video';
            // data.open_token = getCookie('omtoken');
            utils.request({
                type: 'get',
                url: '/OMRefVideo/GetUGCVideoInfo',
                dataType: 'json',
                data: data
            }).then(function(_resp) {
                let resp = {
                    response: {
                        code: 0
                    },
                    data: _resp.data
                };
                if (_resp.response && _resp.response.code == 0) {
                    if (resp.data.tags) {
                        // 为什么不统一成逗号分隔
                        resp.data.tags = resp.data.tags.replace(/ /g, ',');
                        // resp.data.tags = resp.data.tags.map(function(e) {
                        //     return e.tag;
                        // }).join(",");
                    } else {
                        resp.data.tags = '';
                    }

                    if (/160_90_3.jpg$/.test(resp.data.imgurl)) {
                        resp.data.imgurl = 'https://p.qpic.cn/vpic/0/' + resp.data.vid + '.png/0';
                    }
                    // 默认未标准化
                    // 是否标准化（1502411：已拒绝，1502410：已标准化，1502409：未标准化）
                    resp.data.standard = false;
                    if (resp.data.standardinfo) {
                        if (resp.data.standardinfo.standardflag == '1502410') {
                            resp.data.standard = true;
                        }
                        // 兼容老视频 未设置分类信息
                        resp.data.newcat = resp.data.newcat || resp.data.standardinfo.newcat || '';
                        resp.data.newsubcat = resp.data.newsubcat || resp.data.standardinfo.newsubcat || '';
                    }
                    // resp.data.standard = true;
                    dfd.resolve(resp);
                } else {
                    dfd.reject(resp);
                }
            }).fail(function(resp) {
                dfd.reject({});
            });
            return dfd.promise();
        },

        /**
         *
         * 查询视频是否可以被剪辑
         *
         * @param {number} vid - 腾讯视频vid
         * @returns $.Deferred().promise()
         */
        isClipableVideo: function(vid, bundleid, url) {
            return utils.request({
                url: '/omvideo/CheckVidCropAvail',
                data: {
                    vid: vid,
                    bundleid: bundleid,
                    url: url
                },
                dataType: 'JSON',
                type: 'get'
            });
        },

        /**
         *
         * 视频剪辑接口
         *
         * @param {number} data.vid - 腾讯视频vid
         * @param {number} data.title - 标题
         * @param {number} data.newcat - 分类
         * @param {number} data.newsubcat - 子分类
         * @param {number} data.desc - 描述
         * @param {number} data.imgurl - 图片
         * @param {number} data.startms - 开始的毫秒
         * @param {number} data.endms - 结束的毫秒
         * @returns $.Deferred().promise()
         */
        videoClip: function(data) {
            return utils.request({
                url: '/omvideo/CropVid',
                data: {
                    vid: data.vid,
                    title: data.title,
                    newcat: data.newcat,
                    newsubcat: data.newsubcat,
                    tags: data.tags,
                    desc: data.desc,
                    imgurl: data.imgurl,
                    startms: data.startms,
                    endms: data.endms
                },
                dataType: 'JSON',
                type: 'post'
            });
        },

        getVideoInfo: function(vid) {
            // support by leojcwang
            let url = '/VideoManager/VideoInfoByVid';
            // var url = "//openugc.video.qq.com/open_videoinfo";
            let dfd = $.Deferred();
            utils.request({
                url: url,
                data: {
                    // otype: "json",
                    // bid: "open_omg_video",
                    // open_uid: g_userInfo.mediaId,
                    // open_token: cookie.get("omtoken"),
                    vid: vid
                },
                dataType: 'JSON',
                type: 'get'
            }).then(function(_resp) {
                let resp = utils.clone(_resp);
                if (resp.response.code == 0) {
                    if (utils.isArray(resp.data.tags)) {
                        resp.data.tags = resp.data.tags.map(function(e) {
                            return e.tag;
                        }).join(',');
                    } else if (utils.isString(resp.data.tags)) {
                        resp.data.tags = resp.data.tags.replace(/ /g, ',');
                    } else {
                        resp.data.tags = '';
                    }

                    if (/160_90_3.jpg$/.test(resp.data.imgurl)) {
                        resp.data.imgurl = 'https://p.qpic.cn/vpic/0/' + resp.data.vid + '.png/0';
                    }
                    // 默认未标准化
                    // 是否标准化（1502411：已拒绝，1502410：已标准化，1502409：未标准化）
                    resp.data.standard = false;
                    if (resp.data.standardinfo && resp.data.standardinfo.standardflag) {
                        if (resp.data.standardinfo.standardflag == '1502410') {
                            resp.data.standard = true;
                        }
                        // 兼容老视频 未设置分类信息
                        resp.data.newcat = resp.data.newcat || resp.data.standardinfo.newcat || '';
                        resp.data.newsubcat = resp.data.newsubcat || resp.data.standardinfo.newsubcat || '';
                    }
                    // resp.data.standard = true;
                    dfd.resolve(resp);
                } else {
                    dfd.reject(resp);
                }
            }).fail(function(resp) {
                dfd.reject({});
            });

            // setTimeout(function() {
            //     data.curVideo.tags = data.curVideo.tags.map(function(e) {
            //         return e.tag;
            //     }).join(",");
            //     dfd.resolve({
            //         data: data
            //     });
            // }, 500);
            return dfd.promise();
        },
        getVideoTags: function(title) {
            let url = '/VideoManager/GetUserTags';
            let dfd = $.Deferred();
            utils.request({
                url: url,
                data: {
                    title: title
                },
                dataType: 'json',
                type: 'get'
            }).then(function(resp) {
                if (resp.response.code == 0) {
                    dfd.resolve(resp);
                } else {
                    dfd.reject(resp);
                }
            }).fail(function(resp) {
                dfd.reject({});
            });
            return dfd.promise();
        },

        getVideoCategory: function() {
            // leojcwang
            let url = '/VideoManager/VideoCatagory';
            let dfd = $.Deferred();
            utils.request({
                url: url,
                data: {},
                dataType: 'json',
                type: 'get'
            }).then(function(resp) {
                if (resp.response.code == 0) {
                    dfd.resolve(resp);
                } else {
                    dfd.reject(resp);
                }
            }).fail(function(resp) {
                dfd.reject({});
            });
            return dfd.promise();
        },

        getVideoCoverFormVid: function(data) {
            let params = {
                opt: 7,
                otype: 'json',
                bid: 'open_omg_video',
                open_uid: g_userInfo.mediaId,
                open_token: cookie.get('omtoken')
            };
            $.extend(params, data);

            let url = '//ui.video.qq.com/cgi-bin/cropvidcap';
            let dfd = $.Deferred();
            utils.request({
                url: url,
                data: params,
                dataType: 'jsonp',
                jsonpCallback: 'get_video_cover',
                type: 'get'
            })
                .done(function(resp) {
                    video.report({
                        interface: url, // 请求的url
                        desc: '封面裁剪', // 描述
                        errorcode: resp.em, // 错误码
                        errormsg: resp.msg, // 错误信息
                        params: JSON.stringify(params), // 请求参数
                        reponse: JSON.stringify(resp) // 请求返回
                    });
                    dfd.resolve(resp);
                })
                .fail(function(err) {
                    video.report({
                        interface: url, // 请求的url
                        desc: '封面裁剪 网络错误', // 描述
                        errorcode: err.status, // 错误码
                        errormsg: err.statusText, // 错误信息
                        params: JSON.stringify(params), // 请求参数
                        reponse: JSON.stringify(err) // 请求返回
                    });
                    dfd.reject({});
                });
            return dfd.promise();
        },
        getVideoCoverFormUrl: function(data) {
            try {
                // 格式化参数 百分比不应超过范围
                data.x = data.x > 100 ? 100 : data.x;
                data.x = data.x < 0 ? 0 : data.x;
                data.y = data.y > 100 ? 100 : data.y;
                data.y = data.y < 0 ? 0 : data.y;
                data.width = data.width > 100 ? 100 : data.width;
                data.width = data.width < 0 ? 0 : data.width;
                data.height = data.height > 100 ? 100 : data.height;
                data.height = data.height < 0 ? 0 : data.height;

            } catch (e) {}
            let params = {
                opt: 7,
                otype: 'json',
                bid: 'open_omg_video',
                open_uid: g_userInfo.mediaId,
                open_token: cookie.get('omtoken')
            };
            $.extend(params, data);

            let url = '//ui.video.qq.com/cgi-bin/cutvidcap';
            let dfd = $.Deferred();
            utils.request({
                url: url,
                data: params,
                dataType: 'jsonp',
                jsonpCallback: 'get_video_cover',
                type: 'get'
            })
                .done(function(resp) {
                    video.report({
                        interface: url, // 请求的url
                        desc: '封面裁剪', // 描述
                        errorcode: resp.em, // 错误码
                        errormsg: resp.msg, // 错误信息
                        params: JSON.stringify(params), // 请求参数
                        reponse: JSON.stringify(resp) // 请求返回
                    });
                    dfd.resolve(resp);
                })
                .fail(function(err) {
                    video.report({
                        interface: url, // 请求的url
                        desc: '封面裁剪 网络错误', // 描述
                        errorcode: err.status, // 错误码
                        errormsg: err.statusText, // 错误信息
                        params: JSON.stringify(params), // 请求参数
                        reponse: JSON.stringify(err) // 请求返回
                    });
                    dfd.reject({});
                });
            return dfd.promise();
        }
    };

    /**
     * 在URL中抽取vid
     * 在普通文章 插入视频对话框中使用
     */
    video.getVidFromUrl = function(url) {
        // 上层保证输入内容是视频网站的地址

        // /^http[s]{0,1}:\/\/v.qq.com\//.test(url)

        url = url.replace(/^http[s]{0,1}:\/\/v\.qq\.com/, '');

        let getParamVid = function(param, url) {
            let t = param + '=';
            let o = url.indexOf(t);
            // eslint-disable-next-line
            if (-1 != o) {
                let d = url.indexOf('&', o);
                let n = url.indexOf('?', o);
                // eslint-disable-next-line
                return -1 != n && (d == -1 || d > n) && (d = n),
                n = url.indexOf('#', o), -1 != n && (d == -1 || d > n) && (d = n), d == -1 ? url.substring(o + t.length) : url.substring(o + t.length, d);
            }
            return '';
        };

        let dfd = $.Deferred();
        let vid = getParamVid('vid', url);
        let cid;
        let res; // 正则匹配结果
        if (!vid) {
            res = url.match(/\/\w{15}\/(\w+)\.html/);
            if (res) {
                vid = res[1];
            }
        }

        if (!vid) {
            res = url.match(/\/(page|play)\/+(\w{11})\.html/);
            if (res) {
                vid = res[2];
            }
        }

        if (!vid) {
            res = url.match(/\/page\/\w{1}\/\w{1}\/\w{1}\/(\w+)\.html/);
            if (res) {
                vid = res[1];
            }
        }
        // http://v.qq.com/boke/gplay/ab63fa0a51c04802478b8fdb08d871fa_cnr000001coruzm_3_u0160919uyj.html
        if (!vid) {
            res = url.match(/\/gplay\/\w+_\w+_(\w+)\.html/);
            if (res) {
                vid = res[1];
            }
        }
        if (!cid) {
            // 旧版专辑播放页
            let d = url.match(new RegExp('/cover[^/]*/\\w/([^/]*)\\.html'));
            if (d) {
                cid = d[1];
            }
        }

        if (!cid) {
            // 新版专辑播放页
            let d = url.match(new RegExp('/x/cover[^/]*/([^/]*)\\.html'));
            if (d) {
                cid = d[1];
            }
        }

        if (!cid) {
            let d = url.match(new RegExp('/prev[^/]*/\\w+/([^/]*)\\.html'));
            if (d) {
                cid = d[1];
            }
        }

        if (vid) {
            // 可以直接提取vid
            setTimeout(function() {
                dfd.resolve(vid);
            }, 0);
        } else {
            if (cid) {
                cid = encodeURIComponent(cid);
                $.getJSON('/api/getCoverInfo?cid=' + cid + '&callback=?', function(res) {
                    try {
                        if (res.response.code == '0' && res.data.vids) {
                            vid = res.data.vids.length ? res.data.vids.split('+')[0] : res.data.vclips.split('+')[0];
                            dfd.resolve(vid);
                        } else {
                            dfd.reject('');
                        }
                    } catch (e) {
                        throw e;
                    }
                });
            } else {
                setTimeout(function() {
                    dfd.reject('');
                }, 0);
            }
        }
        return dfd.promise();
    };

    video.VPlusUserDataShow = function(param) {
        param.mediaid = g_userInfo.mediaId;
        return $.ajax({
            type: 'get',
            url: '/VPlusPlayStats/VPlusUserDataShow',
            data: param,
            dataType: 'json'
        });
    };

    video.VPlusUserDataShow = function(param, callback) {
        return $.ajax({
            type: 'get',
            url: '/VPlusPlayStats/VPlusVidSearch',
            data: param,
            dataType: 'json'
        });
    };

    /**
     * 视频发布接口
     * support by skypzhang
     */
    video.pubVideo = function(params) {
        let url = '/VideoManager/PubVideo';
        return utils.request({
            url: url,
            data: params,
            method: 'POST',
            dataType: 'json'
        });
    };

    /**
     * 视频删除接口
     * support by skypzhang
     */
    video.delVideo = function(params) {
        let url = '/VideoManager/DeleteVideo';
        return utils.request({
            url: url,
            data: params,
            method: 'POST',
            dataType: 'json'
        });
    };

    /**
     * 视频操作行为上报
     *
     * support by rabbitsu
     */
    video.report = function(params) {
        // 数据上报
        // interface     请求的url
        // desc          描述
        // errorcode     错误码
        // errormsg      错误信息
        // params        请求参数
        // reponse       请求返回
        // machineinfo   用户的机器环境、浏览器版本等

        // 接口上报里面params，reponse，machineinfo什么的都传json传吧
        // {"system":"Win7","browser":"chrome:53","navigar":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2774.3 Safari/537.36","flashver":"23.0","cookie":"开启","javascript":1.7,"localstorage":"开启"}

        let url = '/videoReport/report';

        function flashChecker() {
            let hasFlash = 0; // 是否安装了flash
            let flashVersion = 0; // flash版本
            // eslint-disable-next-line
            if (document.all) {
                // eslint-disable-next-line
                let swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (swf) {
                    hasFlash = 1;
                    let VSwf = swf.GetVariable('$version');
                    // eslint-disable-next-line
                    flashVersion = parseInt(VSwf.split(' ')[1].split(',')[0]);
                }
            } else {
                if (navigator.plugins && navigator.plugins.length > 0) {
                    let swf = navigator.plugins['Shockwave Flash'];
                    if (swf) {
                        hasFlash = 1;
                        let words = swf.description.split(' ');
                        for (let i = 0; i < words.length; ++i) {
                            if (isNaN(parseInt(words[i], 0))) continue;
                            flashVersion = parseInt(words[i], 0);
                        }
                    }
                }
            }
            return {
                f: hasFlash,
                v: flashVersion
            };
        }

        function getName(obj) {
            let res = '';
            for (let i in obj) {
                if (obj.hasOwnProperty(i) && obj[i]) {
                    res = i.toLocaleLowerCase().substr(2);
                }
            }
            return res;
        }

        let os = (function() {
            let UserAgent = navigator.userAgent.toLowerCase();
            return {
                isIpad: /ipad/.test(UserAgent),
                isIphone: /iphone os/.test(UserAgent),
                isAndroid: /android/.test(UserAgent),
                isWindowsCe: /windows ce/.test(UserAgent),
                isWindowsMobile: /windows mobile/.test(UserAgent),
                isWin2K: /windows nt 5.0/.test(UserAgent),
                isXP: /windows nt 5.1/.test(UserAgent),
                isVista: /windows nt 6.0/.test(UserAgent),
                isWin7: /windows nt 6.1/.test(UserAgent),
                isWin8: /windows nt 6.2/.test(UserAgent),
                isWin81: /windows nt 6.3/.test(UserAgent),
                isMac: /mac os/.test(UserAgent)
            };
        })();

        let bw = (function() {
            let UserAgent = navigator.userAgent.toLowerCase();
            return {
                isUc: /ucweb/.test(UserAgent), // UC浏览器
                isChrome: /chrome/.test(UserAgent.substr(-33, 6)), // Chrome浏览器
                isFirefox: /firefox/.test(UserAgent), // 火狐浏览器
                isOpera: /opera/.test(UserAgent), // Opera浏览器
                isSafari: /safari/.test(UserAgent) && !/chrome/.test(UserAgent), // safire浏览器
                is360: /360se/.test(UserAgent), // 360浏览器
                isBaidu: /bidubrowser/.test(UserAgent), // 百度浏览器
                isSougou: /metasr/.test(UserAgent), // 搜狗浏览器
                isIE6: /msie 6.0/.test(UserAgent), // IE6
                isIE7: /msie 7.0/.test(UserAgent), // IE7
                isIE8: /msie 8.0/.test(UserAgent), // IE8
                isIE9: /msie 9.0/.test(UserAgent), // IE9
                isIE10: /msie 10.0/.test(UserAgent), // IE10
                isIE11: /msie 11.0/.test(UserAgent), // IE11
                isLB: /lbbrowser/.test(UserAgent), // 猎豹浏览器
                isWX: /micromessenger/.test(UserAgent), // 微信内置浏览器
                isQQ: /qqbrowser/.test(UserAgent) // QQ浏览器
            };
        })();

        let fls = flashChecker();
        params.machineinfo = JSON.stringify({
            system: getName(os),
            browser: getName(bw),
            navigar: navigator.userAgent,
            flashver: fls.v,
            cookie: window.navigator.cookieEnabled ? '开启' : '关闭',
            javascript: '开启',
            localstorage: window.localStorage ? '开启' : '关闭'
        });

        let o = JSON.parse(params.params);
        o.mediaid = g_userInfo.mediaId;
        params.params = JSON.stringify(o);
        if (params.interface == 'upload') {
            url = '/videoUpload/Finished';
        }
        return utils.request({
            url: url,
            method: 'POST',
            data: params
        });
    };

    /**
     * 视频剪辑接口
     * support by rabbitsu
     */
    video.createCropVideo = function(data) {
        let url = '/VideoManager/CropVideo';
        return $.Deferred(function(dfd) {
            utils.request({
                url: url,
                data: data,
                dataType: 'json',
                type: 'post'
            })
                .done(function(resp) {
                    resp = {
                        response: {
                            code: 0
                        }
                    };
                    dfd.resolve(resp);
                })
                // eslint-disable-next-line
                .fail(function(err) {
                    dfd.reject({});
                });
        }).promise();
    };
    return video;
});
