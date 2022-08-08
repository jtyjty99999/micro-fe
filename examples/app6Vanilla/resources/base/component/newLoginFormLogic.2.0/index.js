define(function (require, exports, module) {
    let omCookie = require('base/tool/cookie');
    let componentTemplate = require('base/component/template');
    let PtLogin = require('base/component/ptLogin');
    let plugin = require('base/component/pluginable');
    let constantVar = require('base/component/constantVar');
    let emailLoginHandler = require('base/component/newLoginFormLogic.2.0/emailLoginHandler');
    let _OMReport = require('base/component/newLoginFormLogic.2.0/report');
    let rootUrl = constantVar.getRootUrl();
    let $ = plugin.get$();
    function newOMReport(pageid, type = null, event) {
        try {
            window.newOMReport({
                pageid: pageid,
                type: type,
                event: event,
                articleid: null,
                videoid: null
            });
        } catch (e) {}
    }
    // 登录表单逻辑
    function loginFormLogic(params) {
        let config = {// 定义参数配置对象
            redirect: false, // 默认不页面跳转（只针对邮箱、手机号登录用户）
            type: 'qq', // 默认登录方式
            buildType: 1, // 1 登录页登录 2.浮层登录
            emailLoginHandler: emailLoginHandler, // 邮箱、手机号登录处理逻辑
            wxLoginOpenUrl: '/userAuth/WxLogin?source=login2', // 后台帮助跳转到微信登录的页面（这个页面url，后台也会带上微信登录后回跳的页面地址）
            qqRedirectUrl: rootUrl + 'userAuth/signInViaQQ', // qq登录后回跳页面 要用绝对地址
            target: 'parent'// qq登录后回调操作的窗口
        };
        localStorage.setItem('hasReprotLogin', 'false');
        $.extend(true, config, params);
        let self = this;
        let email = omCookie.get('OM_EMAIL') || '';
        let _html;
        if (config.buildType == 1) {
            _html = componentTemplate('loginForm/index.2.0');
        }
        if (config.buildType == 2) { // 浮层登录
            _html = componentTemplate('loginForm/index.2.0-layer');
        }
        self.$loginWrap = null;
        function toggleLoginTab(type) {
            self.$loginWrap.find('[btn-type=' + type + ']')
                .addClass('active').end()
                .find('[btn-type]')
                .not('[btn-type=' + type + ']')
                .removeClass('active');
        }
        // 根据类型展示登录框
        function showLoginBlockByType(type) {
            let currentSelector = '[login-block=login_' + type + '_block]';
            self.$loginWrap.find('[login-block]').not(currentSelector).hide();
            return self.$loginWrap.find(currentSelector).show();
        }
        // 事件绑定
        function eventBind() {
            // 点击qq登录
            self.$loginWrap.on('click', '[btn-type=qq]', function() {
                let type = 'qq';
                let $loginBlock = showLoginBlockByType(type);
                let ptLogin = new PtLogin();
                let beforeHtml = '';
                let html = '';
                let afterHtml = '';

                // 登录页qq登录特殊逻辑：1.外容器需要追加ptlogin-container-addwidth，2.关闭按钮需要在登录区域之外
                if (config.buildType == 1) {
                    self.$loginWrap.find('.login-container').addClass('ptlogin-container-addwidth');
                    // beforeHtml=componentTemplate('loginForm/to-select');
                    html = (ptLogin.homeCreate({
                        s_url: config.qqRedirectUrl,
                        target: config.target,
                        width: '100%',
                        height: '388px'
                    })).html;
                    afterHtml = componentTemplate('loginForm/other-login-mode', { type: type });
                    // 添加关闭按钮
                    $(componentTemplate('loginForm/to-select')).insertBefore($loginBlock);
                }
                if (config.buildType == 2) {
                    toggleLoginTab(type);
                    // beforeHtml=componentTemplate('loginForm/tab',{type:type});
                    html = (ptLogin.homeCreate({
                        s_url: config.qqRedirectUrl,
                        target: config.target,
                        width: '710px',
                        height: '400px'
                    })).html;
                }
                $loginBlock.html(beforeHtml + html + afterHtml);
                _OMReport('QQ_signin', 'submit', 'click');
                newOMReport(10000, 2, 'login_click');
            });
            // 点击微信登录
            self.$loginWrap.on('click', '[btn-type=weixin]', function() {
                let type = 'weixin';
                let $loginBlock = showLoginBlockByType(type);
                let beforeHtml = '';
                let html = '';
                let afterHtml = '';

                if (config.buildType == 1) {
                    self.$loginWrap.find('.login-container').removeClass('ptlogin-container-addwidth');
                    beforeHtml = componentTemplate('loginForm/to-select');
                    html = '<iframe frameborder="0" width="330px" height="330px" src="' + config.wxLoginOpenUrl + '"></iframe>';
                    afterHtml = componentTemplate('loginForm/other-login-mode', { type: type });
                }
                if (config.buildType == 2) {
                    toggleLoginTab(type);
                    // beforeHtml=componentTemplate('loginForm/tab',{type:'weixin'});
                    html = '<iframe frameborder="0" width="410px" height="330px" src="' + config.wxLoginOpenUrl + '"></iframe>';
                }
                $loginBlock.html(beforeHtml + html + afterHtml);
                _OMReport('Weixin_signin', 'submit', 'click');
                newOMReport(10000, 1, 'login_click');
            });
            // 点击邮箱、手机号登录
            self.$loginWrap.on('click', '[btn-type=email]', function() {
                let type = 'email';
                let $loginBlock = showLoginBlockByType(type);
                let beforeHtml = '';
                let html = componentTemplate('loginForm/email-content', { email: email });
                let afterHtml = '';

                if (config.buildType == 1) {
                    self.$loginWrap.find('.login-container').removeClass('ptlogin-container-addwidth');
                    beforeHtml = componentTemplate('loginForm/to-select') + '<h3 class="login-title">手机/邮箱登录</h3>';
                    afterHtml = componentTemplate('loginForm/other-login-mode', { type: type });
                }
                if (config.buildType == 2) {
                    toggleLoginTab(type);
                    // beforeHtml=componentTemplate('loginForm/tab',{type:type});
                }
                $loginBlock.html(beforeHtml + html + afterHtml);
                config.emailLoginHandler.init($.extend(true, { '$loginWrap': self.$loginWrap }, config)).eventBind();
                _OMReport('email_signin', 'submit', 'click');
                newOMReport(10000, 3, 'login_click');
            });
            // 选择登录方式界面(登录页特有事件)
            self.$loginWrap.on('click', '[btn-type=select]', function() {
                let $loginBlock = showLoginBlockByType('select');
                self.$loginWrap
                    .find('.login-container').removeClass('ptlogin-container-addwidth')// 登录页ptlogin-container-addwidth只对qq登录有效，切换需要移除它
                    .end()
                    .find('[btn-type="select"]').remove();// 登录页qq登录关闭按钮在登录区域之外需要单独移除
            });
            self.$loginWrap.on('click', '[btn-type=close]', function() {
                self.$loginWrap.hide();
            });
            // 跳到注册页
            self.$loginWrap.on('click', '.register-qehao', function() {
                newOMReport(10000, null, 'register');
                window.location.href = '/userReg/mediaType';
            });

        }

        this.getHtml = function() {
            return _html;
        };
        this.show = function(type) {
            self.$loginWrap.find('[btn-type=' + (type || config.type) + ']').trigger('click').end().show();
        };
        this.hide = function() {
            self.$loginWrap.hide();
        };
        // 绑定事件
        this.eventBind = function($loginWrap) {
            if (!self.$loginWrap && $loginWrap.length == 1) { // 没有设置$loginWrap
                self.$loginWrap = $loginWrap;
                eventBind();
            }
        };
    }
    return loginFormLogic;
});