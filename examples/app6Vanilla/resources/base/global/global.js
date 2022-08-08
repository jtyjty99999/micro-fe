define(function(require, modules, exports) {
    require('base/trackReport/statistic');
    require('base/trackReport/articlePublish');
    require('base/trackReport/interactive');
    require('base/trackReport/articleManage');
    require('base/trackReport/matManage');
    require('base/trackReport/others');
    require('base/trackReport/incomeStatistic');

    const omCookie = require('base/tool/cookie');
    const componentTemplate = require('base/component/template');
    const assistantHelper = require('component/article/utils/showassistant');
    const customerServiceApi = require('base/api/customerService');

    // 统一处理所有链接形式的统计
    // 这里只处理站内跳转的链接
    // 非站内统计需要显示发送
    function bindLinkDelegateReport () {
      const NAV_REPORT_RULES = [{
        test: '/article/articlePublish',
        args: [31000]
      }, {
        test: '/article/syncWeixin',
        args: [32000]
      }, {
        test: '/article/articleManage',
        args: [41000],
        disable: true
      }, {
        test: '/article/videoManage',
        args: [42000],
        disable: true
      }, {
        test: '/interactive/comment',
        args: [43000]
      }, {
        test: '/article/articleOriginal',
        args: [44000]
      }, {
        test: '/tree/index',
        args: [45000]
      }, {
        test: '/contentService/articleCompare',
        args: [51000]
      }, {
        test: '/weibo/index',
        args: [52000]
      }, {
        test: '/crowdsource/crowd',
        args: [53000]
      }, {
        test: '/expService/index',
        args: [54000]
      }, {
        test: '/rumor/index',
        args: [55000]
      }, {
        test: '/article/groupPic',
        args: [56000]
      }, {
        test: '/article/articleStatistic',
        args: [61000]
      }, {
        test: '/article/videoStatistic',
        args: [62000]
      }, {
        test: '/data/nIndex',
        args: [63000]
      }, {
        test: '/article/subscribeStatistic',
        args: [64000]
      }, {
        test: '/income/incomeStatistic',
        args: [71000]
      }, {
        test: '/income/adSettle',
        args: [72000]
      }, {
        test: '/cap/invest',
        args: [73000]
      }, {
        test: '/cap/manage',
        args: [74000]
      }, {
        test: '/article/accountSettings',
        args: [75000]
      }, {
        test: '/article/accountStatus',
        args: [76000]
      }, {
        test: '/article/accountSettingStatus',
        args: [77000]
      }, {
        test: '/relation/relation',
        args: [78000]
      }];

      const MAIN_REPORT_RULES = [{
        test: '/article/syncWeixin',
        args: [32100, 0, 'click']
      }, {
        test: '/article/regWeixin',
        args: [32100, 1, 'click']
      }, {
        test: '/rss/rssManage',
        args: [32200, 0, 'click']
      }, {
        test: '/mms/mmsManage',
        args: [32300, 0, 'click']
      }, {
        test: '/weibo/syncWeibo',
        args: [32100, 4, 'click']
      }, {
        test: '/weibo/bind',
        args: [32100, 5, 'click']
      }, {
        test: '/article/articlePublish',
        args: [41100, 9, 'click'],
        disable: true
      }, {
        test: '/article/roseManage',
        args: [41100, 11, 'click'],
        disable: true
      }, {
        test: '/article/videoManage',
        args: [42100, 0, 'click'],
        disable: true
      }, {
        test: '/article/matManage',
        args: [42200, 0, 'click'],
        disable: true
      }, {
        test: '/visualChina/picManage',
        args: [42300, 0, 'click'],
        disable: true
      }, {
        test: '/article/voteManage',
        args: [42400, 0, 'click'],
        disable: true
      }, {
        test: '/article/voteCreateEdit',
        args: [42400, 1, 'click'],
        disable: true
      }, {
        test: 'view:comment',
        pathTest: 'interactive/comment',
        args: [43100, 1]
      }, {
        test: 'view:article',
        pathTest: '/interactive/comment',
        args: [43200, 2]
      }, {
        test: '/tree/index',
        args: [45100]
      }, {
        test: '/tree/matrixContent',
        args: [45200]
      }, {
        test: '/tree/matrixStatistic',
        args: [45300]
      }, {
        test: '/tree/matrixVideo',
        args: [45400]
      }, {
        test: '/tree/matrixAppeal',
        args: [45500]
      }, {
        test: 'view:publish',
        pathTest: '/weibo/index',
        args: [52100]
      }, {
        test: 'view:comment',
        pathTest: '/weibo/index',
        args: [52200]
      }, {
        test: 'view:contentmsg',
        pathTest: '/weibo/index',
        args: [52300]
      }, {
        test: 'view:statis',
        pathTest: '/weibo/index',
        args: [52400]
      }, {
        test: 'view:crowding',
        pathTest: '/crowdsource/crowd',
        args: [53100]
      }, {
        test: 'view:mycrowd',
        pathTest: '/crowdsource/crowd',
        args: [53200]
      }, {
        test: 'view:myreview',
        pathTest: '/crowdsource/crowd',
        args: [53300]
      }, {
        test: '/expService/index',
        args: [54100]
      }, {
        test: '/expService/user',
        args: [54200]
      }, {
        test: 'view:myinvest',
        pathTest: '/cap/invest',
        args: [73100]
      }, {
        test: 'view:newinvest',
        pathTest: '/cap/invest',
        args: [73200]
      }, {
        test: 'view:taskList',
        pathTest: '/cap/manage',
        args: [74100]
      }, {
        test: 'view:preferences',
        pathTest: '/cap/manage',
        args: [74200]
      }];
      // 统一转换为正则
      NAV_REPORT_RULES.forEach((rule) => {
        if (typeof rule.test === 'string') {
          rule.test = new RegExp(rule.test);
        }
      })
      MAIN_REPORT_RULES.forEach((rule) => {
        if (typeof rule.test === 'string') {
          rule.test = new RegExp(rule.test);
        }
        if (typeof rule.pathTest === 'string') {
          rule.pathTest = new RegExp(rule.pathTest);
        }
      })
      const VIEW_COMPONENT_HREF = /^view:\w*$/
      const PATH_REGEXP = new RegExp('https?://' + location.host + '(.*)$')
      function getMatcherMethod (rules) {
        return function(e) {
          const href = e.target.href;
          if (!href) {
            return
          }
          let path = href.match(PATH_REGEXP);
          if (path) {
            // 站内地址
            path = path[1]
            // view:xxx格式的hash路由
          } else if (VIEW_COMPONENT_HREF.test(href)) {
            path = href
          } else {
            return
          }
          rules.some((rule) => {
            if (rule.pathTest && !rule.pathTest.test(location.pathname)) {
              return
            }
            if (rule.test.test(path) && rule.disable !== true) {
              window.newOMReport.apply(null, rule.args);
              return true;
            }
          })
        }
      };
      // nav和main对于同一href的处理可能是不一致的，要分开识别
      // 有代码会$(.main).off('click'), 这里只能上升一级绑定元素
      // resources/src/biz/tree/matrixContent/index.js
      $('body .container')
        .on('click', '.side a[href]', getMatcherMethod(NAV_REPORT_RULES))
        .on('click', '.main a[href]', getMatcherMethod(MAIN_REPORT_RULES))
    }

    // 全局提示处理
    // eslint-disable-next-line
    !(function($) {
        let clsoeTipsDuration = 5000;

        // 定时关闭
        setTimeout(function() {
            closeTips();
        }, clsoeTipsDuration);


        if ($('.global-tips').length) {
            $(document.body).on('click', closeEvtHandler);
        }

        function closeEvtHandler(evt) {
            if ($(evt.target).attr('id') == 'notify-auth-lay' || $(evt.target).parents('#notify-auth-lay').length) { return }

            closeTips();

            $(document.body).off('click', closeEvtHandler);
        }

        function closeTips() {
            $('.global-tips').fadeOut();
        }
    })(jQuery);

    // 用于左侧导航有大调整的时候tips显示
    // eslint-disable-next-line no-unused-expressions
    !(function($) {
        let $navToolTips = $('[tooltip-sq]');
        $navToolTips.on('click', '.pop-close', function() {
            let $this = $(this);
            let $parent = $this.closest('[tooltip-sq]');
            let $currentSq = $parent.attr('tooltip-sq');
            $parent.remove();
            $navToolTips.eq($currentSq).show();
        });
    })(jQuery);

    // 用于浏览器提示
    // eslint-disable-next-line
    !(function($) {
        let updateTipkey = 'cbvp';
        let $header = $('.header').eq(0);
        let $wrap = $('.wrap');
        if (window.lteIE9 && omCookie.get(updateTipkey) != '1') {
            $header.after(componentTemplate('alertUpgrade'));
            $wrap.addClass('wrap-alert-upgrade');
        }
        $('body').on('click', '.alert-upgrade .close', function() {
            $('.alert-upgrade').hide();
            $.ajax({ // 后台下发cookie告知7天内不要再提示了
                type: 'get',
                url: '/userAuth/closeBrowserVersionTips',
                data: {},
                dataType: 'json'
            });
        });
    })(jQuery);
    // GoTop
    // eslint-disable-next-line
    !(function($) {
        // eslint-disable-next-line
        function navigateToKF() {
            let path = location.pathname;
            let hash = location.hash;
            switch (path) {
                case '/article/articlePublish':
                    if (hash.indexOf('typeName=multivideos') > 0) { window.open('https://kf.om.qq.com/group/5217414b-e6fc-465d-a64c-85b381212489') }
                    else if (hash.indexOf('typeName=images') > 0) { window.open('https://kf.om.qq.com/group/db145b34-aeb7-408c-9341-6f143d24c454') }
                    else if (hash.indexOf('typeName=rose') > 0) { window.open('https://kf.om.qq.com/group/1568d88f-231d-4950-b7ca-e5d4ce133cbb') }
                    else if (hash.indexOf('typeName=thirdPartyLive') > 0) { window.open('https://kf.om.qq.com/group/9ae115c6-bede-40ab-a344-9048afa33c1c') }
                    else { window.open('https://kf.om.qq.com/group/4ce4d950-72ca-4519-96c5-b4c08631752b') }
                    break;
                case '/article/syncWeixin':
                    window.open('https://kf.om.qq.com/group/244dadeb-3a6d-411b-9e3f-614cf283894b');
                    break;
                case '/article/articleStatistic':
                    window.open('https://kf.om.qq.com/group/f595d46f-82d3-4bd4-a3e2-a5fbcc0c46d4');
                    break;
                case '/article/videoStatistic':
                    window.open('https://kf.om.qq.com/group/f595d46f-82d3-4bd4-a3e2-a5fbcc0c46d4');
                    break;
                case '/article/subscribeStatistic':
                    window.open('https://kf.om.qq.com/group/f595d46f-82d3-4bd4-a3e2-a5fbcc0c46d4');
                    break;
                case '/data/index':
                    window.open('https://kf.om.qq.com/group/d4cdb850-5534-46d9-bb7f-eaca8727a24b');
                    break;
                case '/income/incomeStatistic':
                    window.open('https://kf.om.qq.com/group/f595d46f-82d3-4bd4-a3e2-a5fbcc0c46d4');
                    break;
                case '/income/adSettle':
                    window.open('https://kf.om.qq.com/group/c508d95d-9f57-4fc9-982d-f2862373d30a');
                    break;
                case '/income/adSettleManage':
                    window.open('https://kf.om.qq.com/group/c508d95d-9f57-4fc9-982d-f2862373d30a');
                    break;
                case '/article/accountSettings':
                    window.open('https://kf.om.qq.com/group/69f920e9-d725-41e0-884f-2d1a217b50a5');
                    break;
                case '/user/accountSiginSettings':
                    window.open('https://kf.om.qq.com/group/69f920e9-d725-41e0-884f-2d1a217b50a5');
                    break;
                case '/invitation/index':
                    window.open('https://kf.om.qq.com/group/f9ec7c68-8d96-4c6e-a4b5-357d83a703fe');
                    break;
                case '/article/accountSettingStatus':
                    window.open('https://kf.om.qq.com/group/2c72bff1-8143-4e5a-9536-7898746f3d9a');
                    break;
                case '/userReg/mediaType':
                    window.open('https://kf.om.qq.com/group/77c15d21-9f3c-4a9d-82fd-4b1a30f44902');
                    break;
                case '/userReg/register':
                    window.open('https://kf.om.qq.com/group/77c15d21-9f3c-4a9d-82fd-4b1a30f44902');
                    break;
                case '/userReg/mediaInfo':
                    window.open('https://kf.om.qq.com/group/77c15d21-9f3c-4a9d-82fd-4b1a30f44902');
                    break;
                case '/userReg/mediaBodyInfo':
                    window.open('https://kf.om.qq.com/group/77c15d21-9f3c-4a9d-82fd-4b1a30f44902');
                    break;
                case '/userReg/accountDesc':
                    window.open('https://kf.om.qq.com/group/77c15d21-9f3c-4a9d-82fd-4b1a30f44902');
                    break;
                case '/userReg/common':
                    window.open('https://kf.om.qq.com/group/77c15d21-9f3c-4a9d-82fd-4b1a30f44902');
                    break;
                default:
                    window.open('https://kf.om.qq.com/');
            }
        }
        // 在线客服 以及联系客服
        // rellyli
        $(document.body).on('click', '.tooltip-inlineblock.feedback, #footerCustomerService', async function(e) {
            const form = document.createElement('form');// 定义一个form表单
            form.setAttribute('id', 'formToCustomerService');
            form.setAttribute('style', 'display:none');// 将表单隐藏
            form.setAttribute('target', '_blank');
            form.setAttribute('method', 'post');
            form.setAttribute('action', 'https://qqchat.vxichina.cn/chat/client/index?toPage=1&lang=zh_CN');
            document.querySelector('body').appendChild(form);// 将表单放置在页面中
            let param = {
                ChannelID: 1 // 渠道id， pc为1
            };
            // 针对未登陆的各种状态处理
            if (window.g_userInfo && window.g_userInfo.mediaId && window.g_userInfo.mediaStatus != 0) {
                let res = await customerServiceApi.getInfo();
                if (res && res.response && res.response.code == 0) {
                    let data = res.data || {};
                    param = {
                        FromUserHeadImgUrl: data.header, // 用户微信头像Url
                        CusMediaId: data.mediaid, // 媒体ID
                        CusMediaName: data.medianame, // 客户的媒体名
                        CusMediaDesc: data.introduction, // 客户的媒体介绍
                        CusRegistTime: data.regtime, // 客户的媒体ID注册时间
                        Vip: data.influence_origin, // 是否影响力原创， 0否，1是
                        ...param
                    };
                }
            }
            for (let key in param) {
                if (param.hasOwnProperty(key)) {
                    let input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', key);
                    input.setAttribute('value', param[key]);
                    form.appendChild(input);
                }
            }

            form.submit();// 表单提交
            document.body.removeChild(document.querySelector(`#formToCustomerService`));// 移除表单
            e = e || window.event;
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            return false;
        });
        if (/userAuth\/index|userAuth\/forgetPassword|userAuth\/register|userAuth\/mediaType|userAuth\/edit/.test(location.href)) return;
        window.newOMReport(21000, 0, 'show');
        if (/wenda\/detail/.test(location.href)) {
            $('body').append(componentTemplate('layerBtnForAnswer'));
            $('body').on('click', '.link-answer', function(e) {
                e.stopPropagation();
                e.preventDefault();
                $('body').stop(true);
                $('html,body').animate({ scrollTop: $('#answereditor').offset().top }, 'slow');
            });
        } else {
            $('body').append(componentTemplate('layerBtn'));
        }
        $('body').on('click', '.frequentQuest', function(e) {
            window.newOMReport(21000, 2, 'click');
            e.stopPropagation();
            e.preventDefault();
            navigateToKF();
        });
        $('body').on('click', '.frequentQuestInner', function(e) {
            window.newOMReport(21000, 4, 'click');
            e.stopPropagation();
            e.preventDefault();
            navigateToKF();
        });
        $(window).on('scroll', function() {
            if ($(window).scrollTop() < $(window).height()) {

                $('.link-link-gotop').hide();
            } else {
                $('.link-link-gotop').show();
                // if($(".link-gotop").length>0) return;
                // $(".om-toolfixed").append('<a href="javascript:;" class="link link-gotop" title="回到顶部"><i class="icon icon-gotop"></i></a>');
            }
        });
        // 版权保护小红点展示逻辑，进入过就不再显示http://tapd.oa.com/OMQQ/prong/stories/view/1010116611062824823
        if (localStorage.getItem('copyright-reddot')) {
            $('li.articleOriginal').find('span.wake-mark').hide();
        } else {
            $('li.articleOriginal').find('span.wake-mark').show();
        }
        // 处理投诉举报小红点，进入过就不再显示http://tapd.oa.com/OMQQ/prong/stories/view/1010116611062501707
        if (localStorage.getItem('infringe-reddot')) {
            $('.icon.icon-tousu').siblings('span').hide();
        } else {
            $('.icon.icon-tousu').siblings('span').show();
        }
        $(document.body).on('click', '.link-link-gotop', function() {
            $('html,body').animate({ scrollTop: 0 }, 'fast');
        });



        // if (!window.lteIE9) {
        //     // 符合灰度条件
        //     $(document.body).on('click', '.tooltip-inlineblock.feedback', function() {
        //         if (/MSIE/.test(navigator.userAgent)) {
        //             var url = 'https://kf.om.qq.com/feedback';
        //             if ($('.tooltip-inlineblock.feedback .wake-mark').is(":visible")) {
        //                 url = url + "?type=history";
        //             }

        //             if (/userReg/.test(location.pathname)) {
        //                 url = url + ((url.indexOf("?") > -1) ? "&" : "?") + "anonymous"
        //             }
        //             layer.open({
        //                 type: 2,
        //                 title: "在线客服",
        //                 shadeClose: !true,
        //                 shade: 0.75,
        //                 area: ['800px', '600px'],
        //                 content: url
        //             });
        //         } else {
        //             var url = 'https://kf.om.qq.com/feedback/index';
        //             if ($('.tooltip-inlineblock.feedback .wake-mark').is(":visible")) {
        //                 url = url + "?type=history";
        //             }
        //             window.open(url);
        //         }
        //         $('.tooltip-inlineblock.feedback .wake-mark').hide();
        //     });

        //     $.ajax({ url: "//kf.om.qq.com/feedback/hasmsg", type: "GET", dataType: "JSONP" }).then(function(data) {
        //         if (data.hasmsg) {
        //             $('.tooltip-inlineblock.feedback .wake-mark').show();
        //         }
        //     })
        // } else {
        //     //  不符合
        //     $('.tooltip-inlineblock.feedback').closest(".link.link-bubble").remove();
        // }

        function IEVersion() {
            let userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
            let isOpera = userAgent.indexOf('Opera') > -1; // 判断是否Opera浏览器
            let isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera; // 判断是否IE浏览器
            if (isIE) {
                let reIE = new RegExp('MSIE (\\d+\\.\\d+);');
                reIE.test(userAgent);
                let fIEVersion = parseFloat(RegExp['$1']);

                if (fIEVersion == 9) {
                    return 'IE9';
                }

            }
        }
        let timeOut = null; // 定时器
        $('.link-code,.link-bubble,.link-link-gotop').hover(function() {
            timeOut && clearTimeout(timeOut);
            $(this).find('.tooltip-right').show().addClass('zoomInRight').removeClass('zoomOutRight');
        }, function() {
            $(this).find('.tooltip-right').addClass('zoomOutRight').removeClass('zoomInRight');
            // animationend 兼容性太坑，等不需要兼容ie后可以用。 暂时通过添加css同步的定时器解决
            // eslint-disable-next-line
            timeOut = setTimeout(() => {
                $(this).find('.tooltip-right').hide();
            }, 200);
            if (IEVersion() === 'IE9') {
                $('.tooltip-code-md').hide();
            }
        });
        $('.om-toolfixed')
            .on('mouseenter', '[data-hover-report]', (e) => {
                const report = $(e.target).attr('data-hover-report');
                if (!report) {
                  return;
                }
                const [pageid, type, action] = report.split(',');
                window.newOMReport(Number(pageid), Number(type), action);
            })
            .on('click', '.tooltip-inlineblock.feedback .tooltip-link', function(e) {
                window.newOMReport(21000, 5, 'click');
            })
            .on('click', '.tooltip-inlineblock.feedback .tooltip-right', function(e) {
                window.newOMReport(21000, 7, 'click');
            })
            .on('click', '.tooltip-inlineblock.complain .tooltip-link', function(e) {
                window.newOMReport(21000, 8, 'click');
            })
            .on('click', '.tooltip-inlineblock.complain .tooltip-right', function(e) {
                window.newOMReport(21000, 10, 'click');
            });
        $('.cell-message').on('click', '.link-message', (e) => {
            window.newOMReport(22000, 0, 'click');
        });

        assistantHelper.showAssistant();
        bindLinkDelegateReport();
        // setInterval(function(){
        //     if($(window).scrollTop()<$(window).height()){
        //         $('.om-toolfixed').fadeOut();
        //     }else{
        //         $('.om-toolfixed').fadeIn();
        //     }
        // },200)

    })(jQuery);

    try { document.domain = 'qq.com' } catch (e) {} // 原先有些页面内降域了，有些页面没有降域，这里统一降域，微信登录frame调用，用的着
    window.loginSuccessCallback = function() {
        $('#login-layer').fadeOut(300);
        layer.msg('登录成功', { icon: 1 });
    };
});
