/**
 * 全局音频的管理组件，管理音乐音频只能同时播放一个
 */
define(function(require, exports, module) {

    //维护播放的音频， key是这个音频的id，value是音频的对象
    var sounds = {};

    function _reset() {
        soundManager.stopAll();

        for (var key in sounds) {
            if (sounds.hasOwnProperty(key) && key !== 'currnet') {
                soundManager.destroySound(key);
            }
        }
    }

    function _playMusic(id) {
        //如果有当前正在播放的，就停掉这个
        if (sounds['current']) {
            sounds['current'].music.pause();
        }
        if (sounds.hasOwnProperty(id)) {
            //如果在列表中有这首歌则判断是否是暂停中的
            var playSong = sounds[id];
            if (playSong.music.paused) {
                playSong.music.resume();
            } else {
                playSong.music.play();
            }
            //替换当前的
            sounds['current'] = sounds[id];
        }
    }

    function _pauseMusic(id) {
        if (sounds.hasOwnProperty(id)) {
            sounds[id].music.pause();
        }
    }

    function _resisterMusic(params) {
        if (sounds[params.id]) {
            return;
        }

        //注册一首新歌
        var newMusic = soundManager.createSound({
            id: params.id, // optional: provide your own unique id
            url: params.url,
            autoLoad: true,

            onload: function() {
                console.log('sound loaded!', this)
                sounds[this.id].onLoad();

            },
            // other options here..
            onfinish: function() {
                //调用sound的finish回调
                sounds[this.id].onFinish();
            },
            onpause: function() {
                //调用sound的回调
                sounds[this.id].onPause();
            },
            whileplaying: function() {

                sounds[this.id].onPlaying(Math.floor(this.position / this.durationEstimate * 100));
                //sounds[this.id].onPlaying(Math.floor(this.position / this.duration * 100));
            }
        });
        //维护sound数据
        sounds[params.id] = {};
        sounds[params.id].music = soundManager.getSoundById(params.id);
        sounds[params.id].onPause = params.onPause || function() {};
        sounds[params.id].onFinish = params.onFinish || function() {};
        sounds[params.id].onPlaying = params.onPlaying || function() {};
        sounds[params.id].onLoad = params.onLoad || function() {};
    }

    /**
     * 对外提供3种方法
     * register: 注册音频
     * play: 播放音频的方法
     * pause: 暂停的方法
     */

    return {
        register: function(params) {
            // _resisterMusic(id, url, onPause, onFinish, onPlaying);
            _resisterMusic(params);
        },

        play: function(id) {
            _playMusic(id);
        },
        pause: function(id) {
            _pauseMusic(id);
        },
        reset: function() {
            _reset();
        }
    }
});