define(function (require, exports, module) {
    var loginApi=require('base/api/login');
    var componentTemplate=require('base/component/template');
    var regExCase=require('base/component/regExCase');
    var MobileCodeVerify = require('component/auth/MobileCodeVerify');
    var restrictlayerId;
    var restrictTimeDownRef;
    var restrictCode={
        '-6450':'参数错误或缺少参数',
        '-6451':'每天发送验证码不能超过5次',
        '-6452':'验证码过期了',
        '-6453':'验证码每分钟只能发一次',
        '-6454':'验证码设置失败',//验证码redis设置失败
        '-6455':'发送邮箱验证码失败了',
        '-6456':'发送手机验证码失败了',
        '-6457':'没有找到用户信息',
        '-6458':'验证码错误',
    };
    exports.eventBind=function(){
        //获取验证码
        $(document).on('click','.getRestrictAuthCode', function(e){
            e.preventDefault()
            var $this = $(this);
            var $account=$('#restrict_account_id');
            var account=$account.val();
            var accountType=$('#restrict_account_type').val();
            $account.valid=null;
            $account.accountType=accountType;
            MobileCodeVerify(
                $this,   
                $account,  
                '/userAuth/sendPwdErrorVerifyMsg', 
                {
                    account: account,
                    account_type: accountType
                },
                restrictCode
                //CONFIG.SERVICE_ERROR['sendVerifyCode']
            )
        });
        $(document).on('focus blur','#restrictauthCodeId',function(e){
            if(e.type=='focusin'){
                $('#restrictauthCodeErrorId').empty();
                return false;
            }
            if(e.type=='focusout'){    
                return false;
            }
        }).on('keyup','#restrictauthCodeId',function(){
            var $this=$(this);
            var authCode=$.trim($this.val());
            var $restrictBtnSubmit=$('#restrictBtnSubmit');
            if(/^\d{6}$/.test(authCode)){
                $restrictBtnSubmit.removeClass('disabled');
            }else{
                $restrictBtnSubmit.addClass('disabled');
            }
        }).on('click','#restrictBtnSubmit',function(){
            var $this=$(this);
            if($this.hasClass('disabled')){return;}
            loginApi.doPwdErrorVerify({
                account:$('#restrict_account_id').val(),
                code:$('#restrictauthCodeId').val()
            }).then(function(resp){
                console.log(resp);
                if(resp.response.code==0){
                    layer.close(restrictlayerId);
                    layer.msg('验证通过，请重新登录',{icon:1});
                }else if(restrictCode[resp.response.code]){
                    layer.msg(restrictCode[resp.response.code],{icon:2});
                }else {
                    layer.msg('验证异常',{icon:2});
                }
                //$('#restrictauthCodeErrorId').html('验证码有问题');
            });
        });
    };
    //登录验证浮层
    exports.loginRestrictLayer=function(data){
        switch(Number(data.account_type)){
            case 1:
                data.accountLabel='邮箱';
                break;
            case 2:
                data.accountLabel='手机号';
                break;
        }
        if($('#login-layer').is(':visible')){
            data.hiddenShade=true;//如果登录浮层已经出现，就要把当前浮层遮罩隐藏掉
        }
        var htmlContent = componentTemplate("loginForm/restrict-layer",data);
        /*时间倒计时开始*/
        var startTime=(new Date()).getTime();
        clearInterval(restrictTimeDownRef);
        restrictTimeDownRef=setInterval(function(){
            var elapseMinute=Math.floor(((new Date()).getTime()-startTime)/(1000*60));//逝去的分钟
            var remainMinute=(data.remain_minutes-elapseMinute);
            if(remainMinute>0){
                $('#restrictTimeDown').html(remainMinute+'分钟');
            }else{//时间到了关闭浮层
                clearInterval(restrictTimeDownRef);
                layer.close(restrictlayerId);
            }
        },10000);
        /*时间倒计时结束*/
        restrictlayerId = layer.open({
            type: 1,
            title: '尊敬的企鹅号作者，为保证您的帐号安全，请进行'+data.accountLabel+'验证或<span id="restrictTimeDown" style="color:red;">'+data.remain_minutes+'分钟</span><br />后重新登录',
            area: ['600px', 'auto'],
            shadeClose: false,
            zIndex:15000000000,
            content: htmlContent,
            // btn: ['下一步', '取消'],
            success: function(){},
        });
    };

});