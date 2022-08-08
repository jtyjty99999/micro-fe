define(function (require, exports, module) {
    let loginApi = require('base/api/login');
    let omCookie = require('base/tool/cookie');
    let componentTemplate = require('base/component/template');
    let regExCase = require('base/component/regExCase');
    let omlayer = require('layer/layer');
    let _OMReport = require('base/component/newLoginFormLogic.2.0/report');
    let emailLoginRestrict = require('base/component/newLoginFormLogic.2.0/emailLoginRestrict');
    let TencentCaptcha = require('component/auth/TencentCaptcha');
    let tencentCaptcha = new TencentCaptcha();
    tencentCaptcha.init();
    let validRes;
    function getDefaultConfig() {
        let config = {// 定义参数配置对象
            redirect: false, // 默认不页面跳转（只针对邮箱用户）
            buildType: 1, // 1 登录页登录 2.浮层登录
            $loginWrap: null
        };
        return config;
    }
    // 登录表单参数转换为服务端接口需要的参数
    function formToServer(params) {
        let result = {};
        result.email = $.trim(params.email);
        result.password = $.trim(params.password);
        result.rememberPassword = (params.rememberPassword == 1 ? 1 : 0);
        return result;
    }
    // 登录逻辑
    function doLogin($this, params, type) {
        function loginLoading() {
            $this.addClass('btn-loading');
            $this.html('<i class="icon-loading-white"></i>登录中');
        }
        function removeLoginLoading() {
            $this.removeClass('btn-loading');
            $this.html('登录');
        }
        // 检查邮箱用户
        function checkEmailAccount(code) {
            let directUrl;
            switch (Number(code)) {
                case 101:// 账号完成注册
                    directUrl = '/userReg/register';
                    break;
                case 102:// 账号完成验证
                    directUrl = '/userReg/mediaInfo';
                    break;
                case 103:// 账号提交了基础资料
                    directUrl = '/userReg/mediaBodyInfo';
                    break;
                case 104:// 提交了全部资料
                    break;
            }
            if (directUrl) {
                location.href = directUrl;
                return false;
            }
            return true;
        }
        // 检查手机号用户
        function checkPhoneAccount(code) {
            let directUrl;
            switch (Number(code)) {
                case 101:// 账号完成注册 手机号注册就完成了验证，所以一般不会停留在101状态直接进入了102状态
                case 102:// 账号完成验证
                    directUrl = '/userReg/mediaInfo';
                    break;
                case 103:// 账号提交了基础资料
                    directUrl = '/userReg/mediaBodyInfo';
                    break;
                case 104:// 提交了全部资料
                    break;
            }
            if (directUrl) {
                location.href = directUrl;
                return false;
            }
            return true;
        }
        function needBindQQLayer() {
            // 如果带有needBindQQ query，则弹出绑定微信和qq的公告
            let bindQQLayerIndex;
            bindQQLayerIndex = layer.open({
                type: 1,
                area: ['670px', '380px'],
                content: componentTemplate('bindQQWechatNotification'),
                btn: ['立即绑定', '重新登录'],
                closeBtn: 0,
                title: false,
                yes: function() {
                    location.href = '/user/accountSiginSettings';
                },
                btn2: function() {
                    location.reload('/userAuth/index');
                }
            });

            let dialog = require('biz/account/accountSync/dialog');
            $.ajax({
                url: '/accountSync/popups',
                method: 'post'
            }).then(function(resp) {
                if (resp.response.code == 0 && resp.data && resp.data.wetherpop == 1) {
                    dialog.qzoneIndex();
                }
            });
        }
        function signIn(token, type) {

            let rawPassword = params.password;
            let password = window.MD5(token.token + window.MD5(token.salt + rawPassword));

            if (type == 'email') {

                loginApi.signIn({ email: params.email, pwd: password, token: token.token }).done(function(res) {
                    if (!checkEmailAccount(res.response.code)) { return }
                    if (res.response.code == '0' || res.response.code == '47054') {
                        let hrefUrl = '';
                        if (res.response.code == '47054') {
                            // hrefUrl = '/';
                            // 此处写入localStorage
                            localStorage.setItem('needBindQQ', '1');
                            $('#om-multipule-login-layer').hide();// 可能是登录浮层
                            needBindQQLayer();
                            removeLoginLoading();

                            return;
                        } else {
                            localStorage.removeItem('needBindQQ');
                            hrefUrl = res.data.returnUrl;
                        }
                        if (exports.config.redirect) {
                            location.href = hrefUrl;
                        } else {
                            if (exports.config.buildType == 2) {
                                exports.config.$loginWrap.fadeOut(300);
                            }
                            omlayer.msg('登录成功', { icon: 1 });
                            _OMReport('email_signin', 'submit', 'success');
                        }
                    } else if (res.response.code == '500') {
                        omlayer.msg('用户名密码错误', { icon: 2 });
                        removeLoginLoading();
                    } else if (res.response.code == '503') { // 此用户还没有审核通过
                        $('.login-panel').replaceWith(componentTemplate('loginForm/error', {
                            errorWord1: '您的注册已提交，正在审核中',
                            errorWord2: '审核周期为七个工作日'
                        }));
                    } else if (res.response.code == '505') { // 此用户审核未通过
                        window.location.href = '/prompt/accountForbidden';
                        return;
                        // $('.login-panel').replaceWith(componentTemplate('loginForm/error',{
                        //     errorWord1:'您的帐号因存在严重违规行为或未通过平台运营资质，已被暂停使用。',
                        //     errorWord2:''
                        // }));
                    } else if (res.response.code == '506') { // 三分钟连续错误5次，直接1小时禁止登录
                        omlayer.msg('登录失败过多，请一小时后重试', { icon: 2 });
                        removeLoginLoading();

                    } else if (res.response.code == '508') {
                        omlayer.msg('登录失败过多，请一小时后重试', { icon: 2 });
                        removeLoginLoading();
                    } else if (res.response.code == '10110') {
                        location.href = '/user/blackProIntercept';
                    } else if (res.response.code == '10111') {
                        emailLoginRestrict.loginRestrictLayer(res.data);
                        removeLoginLoading();
                    } else {
                        omlayer.msg('登录失败，请稍候重试', { icon: 2 });
                        removeLoginLoading();
                    }
                });
            } else {

                loginApi.signInViaPhone({ phone: params.email, pwd: password, token: token.token }).done(function(res) {
                    if (!checkPhoneAccount(res.response.code)) { return }
                    if (res.response.code == '0' || res.response.code == '47054') {
                        let hrefUrl = '/';
                        if (res.response.code == '47054') {
                            // 此处写入localStorage
                            localStorage.setItem('needBindQQ', '1');
                            $('#om-multipule-login-layer').hide();// 可能是登录浮层
                            needBindQQLayer();
                            removeLoginLoading();
                            return;
                        } else {
                            localStorage.removeItem('needBindQQ');
                        }
                        if (exports.config.redirect) {
                            // location.href=res.data.returnUrl;
                            location.href = hrefUrl;
                        } else {
                            if (exports.config.buildType == 2) {
                                exports.config.$loginWrap.fadeOut(300);
                            }
                            omlayer.msg('登录成功', { icon: 1 });
                            _OMReport('email_signin', 'submit', 'success');
                        }
                    } else if (res.response.code == '-6320') {
                        omlayer.msg('用户名密码错误', { icon: 2 });
                        removeLoginLoading();
                    } else if (res.response.code == '503') { // 此用户还没有审核通过
                        $('.login-panel').replaceWith(componentTemplate('loginForm/error', {
                            errorWord1: '您的注册已提交，正在审核中',
                            errorWord2: '审核周期为七个工作日'
                        }));
                    } else if (res.response.code == '505') { // 此用户审核未通过
                        window.location.href = '/prompt/accountForbidden';
                        return;
                        // $('.login-panel').replaceWith(componentTemplate('loginForm/error',{
                        //     errorWord1:'您的帐号因存在严重违规行为或未通过平台运营资质，已被暂停使用。',
                        //     errorWord2:''
                        // }));
                    } else if (res.response.code == '506') { // 三分钟连续错误5次，直接1小时禁止登录
                        omlayer.msg('登录失败过多，请一小时后重试', { icon: 2 });
                        removeLoginLoading();

                    } else if (res.response.code == '507') { //
                        omlayer.msg('该帐号在手机端注册未完成，请在手机端完成注册', { icon: 2 });
                        removeLoginLoading();

                    } else if (res.response.code == '510') { //
                        window.location.href = '/prompt/accountForbidden';
                        return;
                        // omlayer.msg('用户被移除了',{icon:2});
                        // removeLoginLoading();

                    } else if (res.response.code == '511') { //
                        omlayer.msg('找不到用户', { icon: 2 });
                        removeLoginLoading();
                    } else if (res.response.code == '512') { //
                        omlayer.msg('系统异常', { icon: 2 });
                        removeLoginLoading();
                    } else if (res.response.code == '513') { //
                        omlayer.msg('用户账号没有验证', { icon: 2 });
                        removeLoginLoading();

                    } else if (res.response.code == '10110') {
                        location.href = '/user/blackProIntercept';
                    } else if (res.response.code == '10111') {
                        emailLoginRestrict.loginRestrictLayer(res.data);
                        removeLoginLoading();
                    } else {
                        omlayer.msg('登录失败，请稍候重试', { icon: 2 });
                        removeLoginLoading();
                    }
                });
            }

        }
        loginLoading();

        if (type == 'email') { // 如果用户输入的是邮箱
            loginApi.randomCode({
                email: params.email,
                om_ticket: validRes.ticket,
                om_randstr: validRes.randstr
            }).done(function(data) {
                if (data.response.code == '0') {
                    let token = data.data;
                    signIn(token, 'email');
                    if (params.rememberPassword == '1') {
                        omCookie.set('OM_EMAIL', params.email);
                    } else {
                        omCookie.clear('OM_EMAIL', '/', '.om.qq.com');
                    }
                } else if (data.response.code == 500) {
                    // OM.util.dealTips(false,'该邮箱未注册',$('#v_email'));
                    omlayer.msg('该帐号未注册', { icon: 2 });
                    removeLoginLoading();
                } else {
                    omlayer.msg(data.response.msg, { icon: 2 });
                    removeLoginLoading();
                }
            }).fail(function() {
                removeLoginLoading();
                omlayer.msg('服务繁忙，请稍候重试', { icon: 2 });
            });

        } else {  // 手机登录
            loginApi.getPhoneRandomCode({
                phone: params.email,
                om_ticket: validRes.ticket,
                om_randstr: validRes.randstr
            }).done(function(data) {
                if (data.response.code == '0') {
                    let token = data.data;
                    signIn(token, 'phone');
                    if (params.rememberPassword == '1') {
                        omCookie.set('OM_EMAIL', params.email);
                    } else {
                        omCookie.clear('OM_EMAIL', '/', '.om.qq.com');
                    }
                } else if (data.response.code == '-6322') {
                    // OM.util.dealTips(false,'该邮箱未注册',$('#v_email'));
                    omlayer.msg('该帐号未注册', { icon: 2 });
                    removeLoginLoading();

                } else if (data.response.code == '-6323') {
                    // OM.util.dealTips(false,'该邮箱未注册',$('#v_email'));
                    omlayer.msg('服务繁忙，请稍候重试', { icon: 2 });
                    removeLoginLoading();
                }
            }).fail(function() {
                removeLoginLoading();
                omlayer.msg('服务繁忙，请稍候重试', { icon: 2 });
            });
        }
    }
    exports.init = function(params) {
        exports.config = $.extend(true, getDefaultConfig(), params);
        return this;
    };
    exports.eventBind = function() {
        let $loginForm = exports.config.$loginWrap.find('.loginForm');
        // 记住账号
        $loginForm.find('.remember-id').on('click', function() {
            let $this = $(this);
            let $ck = $this.find('.icon-login-checkbox');
            if ($ck.hasClass('active')) {
                $ck.removeClass('active');
                $this.closest('.loginForm').find('input[name="rememberPassword"]').val(0);// 填写隐藏字段
            } else {
                $this.closest('.loginForm').find('input[name="rememberPassword"]').val(1);// 填写隐藏字段
                $ck.addClass('active');
            }
            return false;
        });
        // 点击登录
        $loginForm.parent().find('.btnLogin').on('click', function() {
            let $this = $(this);
            let $form = $this.parents('.login-panel').find('.loginForm');

            _OMReport('email_signin', 'submit', 'click');

            $form.find('.input-group :input').trigger('blur');
            // $form.find('.input-group :input').trigger('keyup');
            if ($this.find('.icon-loading-white').length) {
                return;
            }
            let data = $form.serializeObject();
            data.email = $.trim(data.email);
            data.password = $.trim(data.password);
            if (data.email && data.password) {
                let serverData = formToServer(data);
                tencentCaptcha.valid().then(function(validResp) {
                    validRes = validResp;
                    // 增加是邮箱还是手机号判断
                    if (regExCase.email.test(data.email)) {
                        doLogin($this, serverData, 'email');
                    } else {
                        doLogin($this, serverData, 'phone');
                    }
                });
            }

        });
        let $input = $loginForm.find('.input-group :input');
        $input.each(function() {
            let $this = $(this);
            $this.one('blur', function() {
                let $loginErrorTips = $this.closest('.form-control').find('.login-error-tips');
                let errorIconHtml = '<i class="icon-login icon-login-error"></i>';
                $this.on('blur keyup', function() {
                    let name = this.name;
                    let newValue = $.trim(this.value);
                    switch (name) {
                        case 'email':
                            if (!newValue) {
                                $this.addClass('error emailError');
                                $loginErrorTips.html(errorIconHtml + '帐号不能为空');
                                return;
                            }
                            // 增加对手机号码的校验 by chuangwang 2017.8.29
                            if (regExCase.email.test($.trim($this.val())) || regExCase.phone.test($.trim($this.val()))) {
                                if ($this.hasClass('emailError')) {
                                    $this.removeClass('error emailError');
                                    $loginErrorTips.empty();
                                    $this.closest('.form-control').find('input[name=password]').trigger('keyup');
                                }
                            } else {
                                $this.addClass('error emailError');
                                $loginErrorTips.html(errorIconHtml + '请输入正确帐号');
                            }
                            break;
                        case 'password':
                            // eslint-disable-next-line
                            let $email = $this.closest('.form-control').find('input[name=email]');
                            $email.trigger('keyup');
                            if (!newValue) {
                                $this.addClass('error');
                                if (!$email.hasClass('emailError')) { // 当邮箱正确的情况下
                                    $loginErrorTips.html(errorIconHtml + '密码不能为空');
                                }
                                return;
                            } else {
                                $this.removeClass('error');
                                if (!$email.hasClass('emailError')) { // 当邮箱正确的情况下
                                    $loginErrorTips.empty();
                                }
                            }
                            break;
                    }
                });
                $this.trigger('keyup');
            });
        });
        // 密码不给输入空格
        $input.filter('input[name=password]').on('keyup', function() {
            this.value = $.trim(this.value);
        });
        emailLoginRestrict.eventBind();
        return this;
    };
});