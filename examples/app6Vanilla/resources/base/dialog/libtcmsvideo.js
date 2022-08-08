// 该文件废弃
define(function() {
    var tcmsVideo = {
        vid: '',
        getParamVid: function(param, url) {
            var url = url || document.location.toString(),
                t = param + "=",
                o = url.indexOf(t);
            if (-1 != o) {
                var d = url.indexOf("&", o),
                    n = url.indexOf("?", o);
                return -1 != n && (-1 == d || d > n) && (d = n),
                    n = url.indexOf("#", o), -1 != n && (-1 == d || d > n) && (d = n), -1 == d ? url.substring(o + t.length) : url.substring(o + t.length, d);
            }
            return "";
        },
        regOtherVid: function(url) {
            url = url || window.location.toString();
            var vid = tcmsVideo.getParamVid("vid", url);
            var res; //正则匹配结果
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

            if (!vid) {
                res = url.match(/\/boke\/gplay\/\w+_\w+_(\w+)\.html/)
                if (res) {
                    vid = res[1];
                }
            }
            return encodeURIComponent(vid);
        },
        getVidByCid: function(res) {
            // 通过cid获取vid
            if (res.response.code == '0') {
                vid = res.data.vids.length ? res.data.vids.split('+')[0] : res.data.vclips.split('+')[0];
                obj.vid = vid;
                iframeUrl = "//v.qq.com/iframe/preview.html?vid=" + vid + "&width=" + w + "&height=" + h + "&auto=0";
                callback(iframeUrl, obj);
            }
        },
        getVideo: function(url, callback, obj) {
            url = url.replace(/^\s+|\s+$/g, "");
            url = url.replace(/^http:/, "https:");
            url = url.replace(/^v\.qq\.com/, "//v.qq.com");

            if (-1 == url.indexOf("http://v.qq.com") && -1 == url.indexOf("//v.qq.com")) {
                tcmsVideo.clearData('link');
                $('.js_video_preview').html(tcmsVideo.emptyVideo);
                layer.msg("请输入腾讯视频网址");
                return false;
            }

            var d, //正则匹配
                iframeUrl,
                vid = "",
                cid = "",
                w = obj.width,
                h = obj.height;

            if (d = url.match(new RegExp("(^|&|\\\\?)vid=([^&]*)(&|$|#)"))) {
                vid = encodeURIComponent(d[2]);

                obj.vid = vid;
                tcmsVideo.linkVid = vid;
                iframeUrl = "//v.qq.com/iframe/preview.html?vid=" + vid + "&width=" + w + "&height=" + h + "&auto=0";

                callback(iframeUrl, obj);
            } else {
                if (!cid) {
                    // 旧版专辑播放页
                    d = url.match(new RegExp("/cover[^/]*/\\w/([^/]*)\\.html"))
                    if (d) {
                        cid = d[1];
                    }
                }
                if (!cid) {
                    // 新版专辑播放页
                    d = url.match(new RegExp("/x/cover[^/]*/([^/]*)\\.html"))
                    if (d) {
                        cid = d[1];
                    }
                }

                if (!cid) {
                    d = url.match(new RegExp("/prev[^/]*/\\w+/([^/]*)\\.html"))
                    if (d) {
                        cid = d[1];
                    }
                }

                if (cid) {
                    cid = encodeURIComponent(cid);
                    $.getJSON("//om.qq.com/api/getCoverInfo?cid=" + cid + "&callback=?", function(res) {
                        try {
                            if (res.response.code == '0') {
                                vid = res.data.vids.length ? res.data.vids.split('+')[0] : res.data.vclips.split('+')[0];
                                tcmsVideo.linkVid = vid;

                                obj.vid = vid;
                                iframeUrl = "//v.qq.com/iframe/preview.html?vid=" + vid + "&width=" + w + "&height=" + h + "&auto=0";
                                callback(iframeUrl, obj);
                            }
                        } catch (e) {
                            throw e;
                        }
                    })
                } else {
                    vid = tcmsVideo.regOtherVid(url);
                    if ("" != vid) {
                        obj.vid = vid;
                        tcmsVideo.linkVid = vid;

                        iframeUrl = "//v.qq.com/iframe/preview.html?vid=" + vid + "&width=" + w + "&height=" + h + "&auto=0";
                        callback(iframeUrl, obj);
                    };
                };
            }
        },
        clearData: function(type) {
            function clearVideoListData() {
                tcmsVideo.type = 'list';
                tcmsVideo.videoVid = '';
                tcmsVideo.videoListData = {};
                tcmsVideo.videoPreviewHtml = '';
            }

            function clearVideoLinkData() {
                tcmsVideo.type = 'link';
                tcmsVideo.linkVid = '';
                tcmsVideo.linkPreviewHtml = '';
            }
            switch (type) {
                case 'list':
                    clearVideoListData();
                    break;
                case 'link':
                    clearVideoLinkData();
                    break;
                case 'all':
                    clearVideoListData();
                    break;
            }
        }
    };
    return tcmsVideo;
});