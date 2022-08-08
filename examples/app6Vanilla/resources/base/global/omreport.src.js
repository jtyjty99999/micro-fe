define(function(require, modules, exports) {
    let browser = require('base/tool/browser');
    let uuid = require('base/tool/getUuid');
    // dev模式下不通过log打印出上报日志
    let devSilent = false;
    // 是否启用真实的上报函数
    let enableReport = location.host === 'om.qq.com';
    // 行为轨迹上报
    let OMReport = window.OMReport = reportToBoss({
        BossId: 3765,
        Pwd: 1514525181,
        page: '',
        omfunction: '',
        module: '',
        event: '',
        result: '',
        reason: '',
        browser: navigator.userAgent,
        mediaid: (typeof g_userInfo != 'undefined' && g_userInfo && g_userInfo.mediaId || ''),
        uin: (typeof g_userInfo != 'undefined' && g_userInfo && g_userInfo.mediaId || ''),
        userip: ''
    });
    let newOMReport = reportToBoss({
        BossId: 8137,
        Pwd: 2082397313,
        ftime: getDate(),
        pageid: '',
        event: '',
        type: '',
        user_key: uuid,
        mediaid: (typeof g_userInfo != 'undefined' && g_userInfo && g_userInfo.mediaId || ''),
        articleid: '',
        videoid: '',
        hh_ip: '',
        browser: navigator.userAgent.replace(',', '，'),
        checkresult: '',
        userip: ''
    });
    // newOMReport多写个快捷方式支持简单调用方式
    // opts
    // pageid: number, type: number, event: string
    window.newOMReport = function(opts, type, event) {
      if (typeof opts === 'number') {
        opts = {
          pageid: opts,
          type: type || 0,
          event: event || 'click'
        }
      }
      return newOMReport(opts)
    }
    // 超时上报
    let OMTimeoutReport = window.OMTimeoutReport = reportToBoss({
        BossId: 4110,
        Pwd: 1701096282,
        source: 1,
        page_url: encodeURIComponent(window.location.href),
        uin: (typeof g_userInfo != 'undefined' && g_userInfo && g_userInfo.mediaId || '')
    });
    let OMOperationReport = window.OMOperationReport = reportToBoss({
        BossId: 4351,
        Pwd: 715317332,
        source: 1,
        mediaid: (typeof g_userInfo != 'undefined' && g_userInfo && g_userInfo.mediaId || ''),
        business: 'om',
        service: 'ui',
        // 浏览器信息
        uibrowser: browser.name,
        uibrowser_v: browser.version,
        uipage: encodeURIComponent(window.location.href),
        uiua: navigator.userAgent

    });
    // 人脸上报
    // TODO:人脸裁剪检测规则确定后删除
    let OMFaceReport = window.OMFaceReport = reportToBoss({
        BossId: 5146,
        Pwd: 774817901,
        uin: (typeof g_userInfo != 'undefined' && g_userInfo && g_userInfo.mediaId || '')
    });
    function getDate() {
        function addChar0(str) {
            let strs = str;
            if (str <= 9)
            {
                strs = '0' + str;
            }
            return strs;
        }
        let newDate = new Date();
        let year = newDate.getFullYear();
        let month = addChar0(newDate.getMonth() + 1);
        let day = addChar0(newDate.getDate());
        let hour = addChar0(newDate.getHours());
        let minutes = addChar0(newDate.getMinutes());
        let seconds = addChar0(newDate.getSeconds());
        let date = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
        return date;
    }
    // 支持队列发送
    // delay 延迟时间，batch: 并发数
    const ReportQueue = function(delay = 300, batch = 1) {
      let queue = [];
      let isRunning = false
      let lastTimer = 0

      const send = function(src) {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve;
        })
      }
      const start = function() {
        if (isRunning) {
          return;
        }
        isRunning = true;
        run();
      }
      const stop = function() {
        isRunning = false;
        clearTimeout(lastTimer);
      }

      const run = function() {
        if (queue.length === 0) {
          stop();
          return;
        }
        let wait = null;
        if (batch > 1) {
          // 支持批量
          wait = Promise.all(queue.splice(0, batch).map(send))
        } else {
          // only one
          const src = queue.shift();
          wait = send(src);
        }
        wait.then(() => {
          lastTimer = setTimeout(run, delay);
        });
      }
      this.add = function(src) {
        queue.push(src);
        start();
      }
    }

    const reportQueue = new ReportQueue(500, 2);
    function reportToBossImpl(config) {
        // 启动JS报错上报
        // OMError.init();
        // OMError.tryJs().spyAll();
        let g_btrace_BOSS = new Image(1, 1);

        function object2str(params) {
            let url = '';
            for (let i in params) {
                if (params.hasOwnProperty(i)) {
                    url += (i + '=' + params[i] + '&');
                }
            }
            return url + '_=' + Math.random();
        }
        let _merge = function(org, obj) {
            let key;
            for (key in obj) {
                org[key] = obj[key];
            }
        };

        let methods = {
            config: function(params) {
                _merge(config, params);
            },
            report: function(params) {
                let data = {};
                _merge(data, config);
                if (typeof params == 'object') {
                    _merge(data, params);
                } else if (utils.isString(params)) {
                    _merge(data, {
                        'event': params
                    });
                }
                reportQueue.add('https://btrace.qq.com/kvcollect?' + object2str(data));
                // g_btrace_BOSS.src = 'https://btrace.qq.com/kvcollect?' + object2str(data);

                if (config.BossId == '3765' || config.BossId == '8137') {
                    try { MtaH5 && MtaH5.clickStat(params.page + '_' + params.omfunction + '_' + params.module) }
                    catch (e) {}
                }
            }
        };

        return function(method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.report.apply(this, arguments);
            } else {
                throw new Error('Method ' + method + ' does not exist');
            }
        };
    }
    function reportToBoss(config) {
      if (enableReport) {
          // 采用真实实现，自带trycatch
          const fn = reportToBossImpl(config);
          return function(opts, type, event) {
            try {
              return fn(opts);
            } catch(err) {}
          }
      } else {
        // 本地开发模式下不加载真正的report函数时的容错
        const plan = (al) => [].slice.apply(al);
        window.OMFaceReport = function () {
          if (!devSilent) {
            console.log('dev:OMFaceReport', plan(arguments));
          }
        }
        window.OMOperationReport = function () {
          return
          if (!devSilent) {
            console.log('dev:OMOperationReport', plan(arguments));
          }
        }
        window.OMReport = function() {
          if (!devSilent) {
            console.log('dev:omReport', plan(arguments));
          }
        };
        window.newOMReport = function(opts, type, event) {
          if (!devSilent) {
            if (typeof opts === 'number') {
              opts = {
                pageid: opts,
                type: type || 0,
                event: event || 'click'
              }
            }
            console.log('dev:newOMReport', opts);
          }
        };
      }
    }
});
