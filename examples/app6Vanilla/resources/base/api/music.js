
// 单曲的信息，以竖线隔开的单曲信息
// 解释如下：歌曲id|歌曲名|歌手id|歌手名|专辑id|专辑名|音档大小|播放时长|stream|是否可以下载|歌手type|320音档大小|128音档大小|码率|是否是soso音乐|ape无损音乐大小|flac无损音乐大小|ogg音乐大小

define(function(require, exports, module) {
    var video = {
        getMusicPlayUrl: function(id) {
            // http:?song_id=1234& redirect =0&filetype=wma& qqmusic_fromtag =xxx& app_id=xxxx&app_key=xxxx&device_id=xxxxx
            var dfd = $.Deferred();
            var url = "/ommusic/getplayurl?song_id=" + id + "&filetype=mp3&qqmusic_fromtag=7";

            utils.request({
                type: "get",
                url: url,
                dataType: "json",
                data: {}
            }).then(function(resp) {
                if (resp.response.code == 0) {
                    dfd.resolve(resp.data.song_play_url);
                } else {
                    dfd.reject({});
                }
            }).fail(function() {
                dfd.reject({});
            });

            return dfd.promise();
        },
        getMusicList: function(data) {
            var dfd = $.Deferred();
            var url = '//open.music.qq.com/fcgi-bin/fcg_weixin_music_search.fcg';
            // var url = '//open.music.qq.com/fcgi-bin/fcg_music_search.fcg';
            var param = {
                // remoteplace: "txt.weixin.officialaccount",
                app_id: "100383649",
                app_key: "7a082c4481f4e9d8575f398f25431686",
                curpage: data.curpage,
                perpage: data.perpage,
                w: data.kw,
                format: "jsonp",
                inCharset: "utf-8",
                outCharset: "utf-8",
                notice: 0,
                jsonCallback: "MusicJsonCallback",
                needNewCode: 0
            };
            utils.request({
                type: "get",
                url: url,
                dataType: "jsonp",
                jsonpCallback: "MusicJsonCallback",
                data: param
            }).then(function(resp) {
                resp.list = resp.list.map(function(e) {
                    var fields = e.f.split("|");

                    e.size = utils.numberToSize(fields[12]);
                    e.duration = utils.numberToTime(fields[7]);
                    e.url = e.downUrl;
                    var mid = fields[22];
                    e.coverimg = "http://y.gtimg.cn/music/photo_new/T002R150x150M000" + mid + ".jpg";
                    e.f = fields.slice(0, -5).join("|") + "|0"; //直接补0 目前不确定该字段含义
                    return e;
                });
                dfd.resolve(resp);
            }).fail(function() {
                dfd.reject({});
            });
            return dfd.promise();
        }
    };
    return video;
});