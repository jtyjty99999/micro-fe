/**
 * Created by xiabingwu on 2016/3/31.
 * ptlogin说明文档 http://platform.server.com/ptlogin/no-lower-domain.html
 * appid            业务向ptlogin2申请的ID 必填
 * s_url            登录成功后跳转的URL 必填
 * style            登录页面的风格，这是一个整数值
 * target           指定登录后的重定向的页面窗口,支持下面几个取值。parent，父页面重定向；top，最顶窗口重定向；self，仅嵌入的登录窗口重定向；默认top
 * default_uin      登录页面默认显示的号码。如果不填，则默认为空
 * enable_qlogin    http登录是否支持快速登录默认0，不支持；1，支持(默认)。
 * hide_border      是否隐藏边框， 该特性可以允许业务自行修饰外边框 0 – 不隐藏 1 – 隐藏 默认为不隐藏
 * 效果例子
 * 最新登录框 http://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=638013803&s_url=http%3A//om.qq.com/userAuth/signInViaQQ&target=parent
 * 最新登录框但是不让自动登录且提供了默认qq号 http://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=638013803&s_url=http%3A//om.qq.com/userAuth/signInViaQQ&target=parent&default_uin=1052537969&style=20&enable_qlogin=0
 * 风格33的登录框 http://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=638013803&s_url=http%3A//om.qq.com/userAuth/signInViaQQ&target=parent&style=33
 * 风格32无边框的登陆框 http://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=638013803&s_url=http%3A//om.qq.com/userAuth/signInViaQQ&target=parent&style=32&&hide_border=1
 */
define(function(require,exports,module){
    var constantVar=require('base/component/constantVar');
    var rootUrl=constantVar.getRootUrl();
    function PtLogin(){//params参数包括iframeId以及ptlogin官网定义的参数
        var appid=638013803;
        var iframeId='ptLoginFrame';
        var width='100%';
        var height='100%';
        //qq登录
        this.create=function(params){
            var iframeHtml='';//iframeHtml拼接暂不用模板，尽可能保持核心功能不依赖模板
            params=params||{};
            params.appid=params.appid||appid;
            params.iframeId=params.iframeId||(iframeId+Math.floor(Math.random()*10000000));
            params.width=params.width||width;
            params.height=params.height||height;
            if(!params.s_url){
                throw '请提供s_url号参数';
            }
            iframeHtml=[
                '<iframe frameborder="0" id="',
                params.iframeId,
                '" name="',
                params.iframeId,
                '" scrolling="auto" width="',
                params.width,
                '" height="',
                params.height,
                '" src="//xui.ptlogin2.qq.com/cgi-bin/xlogin?'
            ].join('');
            for(var key in params){
                if(params.hasOwnProperty(key)&&key!='iframeId'){//尽量保持传递给ptlogin参数干净
                    var value=params[key];
                    switch(key){
                        case 's_url':
                            iframeHtml=[iframeHtml,'&',key,'=',encodeURIComponent(value)].join('');
                            break;
                        default:
                            iframeHtml=[iframeHtml,'&',key,'=',value].join('');
                            break;
                    }
                }
            }
            iframeHtml=iframeHtml+'"></iframe>';
            return {
                config:params,
                html:iframeHtml
            };
        };
        //此方法谁写的，没有使用
        this.create2=function(params){
            var iframeHtml='';//iframeHtml拼接暂不用模板，尽可能保持核心功能不依赖模板
            params=params||{};
            params.appid=params.appid||appid;
            params.iframeId=params.iframeId||(iframeId+Math.floor(Math.random()*10000000));
            params.width=params.width||width;
            params.height=params.height||height;
            if(!params.s_url){
                throw '请提供s_url号参数';
            }
            iframeHtml=[
                '<iframe frameborder="0" style="left:-30px;position:absolute;" id="',
                params.iframeId,
                '" name="',
                params.iframeId,
                '" scrolling="auto" width="',
                params.width,
                '" height="',
                params.height,
                '" src="//xui.ptlogin2.qq.com/cgi-bin/xlogin?'
            ].join('');
            for(var key in params){
                if(params.hasOwnProperty(key)&&key!='iframeId'){//尽量保持传递给ptlogin参数干净
                    var value=params[key];
                    switch(key){
                        case 's_url':
                            iframeHtml=[iframeHtml,'&',key,'=',encodeURIComponent(value)].join('');
                            break;
                        default:
                            iframeHtml=[iframeHtml,'&',key,'=',value].join('');
                            break;
                    }
                }
            }
            iframeHtml=iframeHtml+'"></iframe>';
            return {
                config:params,
                html:iframeHtml
            };
        };
        this.create=function(params){
            params.redirect_uri=params.s_url;//兼容老的
            var defaultConfig={
                iframeId:'qqAuthFrame_'+Math.floor(Math.random()*10000000),
                width:'700px',
                height:'390px',
                response_type:'code',
                client_id:101490602,
                redirect_uri:'',
                state:'STATE',
                scope:'get_user_info',
                display:'PC',
                target:'self'//self 或则 top ；
            };
            var config=$.extend(true,defaultConfig,params);
            if(config.target=='parent'){//chrome将不支持parent，parent都转换为top
                config.target='top';
            }
            var iframeHtml=[
                '<iframe style="margin-top:-50px;" frameborder="0" id="',
                config.iframeId,
                '" name="',
                config.iframeId,
                '" scrolling="auto" width="',
                config.width,
                '" height="',
                config.height,
                '" src="https://graph.qq.com/oauth2.0/authorize?',

                //配置client_id
                //'&',
                'client_id',
                '=',
                encodeURIComponent(config.client_id),

                //配置response_type
                '&',
                'response_type',
                '=',
                encodeURIComponent(config.response_type),

                //配置redirect_uri
                '&',
                'redirect_uri',
                '=',
                encodeURIComponent(rootUrl+'User/QHLCallBack?url='+encodeURIComponent(config.redirect_uri)+'&target='+encodeURIComponent(config.target)),

                //配置state
                '&',
                'state',
                '=',
                encodeURIComponent(config.state),

                //配置scope
                '&',
                'scope',
                '=',
                encodeURIComponent(config.scope),

                //配置display
                '&',
                'display',
                '=',
                encodeURIComponent(config.display),

                '"></iframe>'

            ].join('');
            return {
                config:params,
                html:iframeHtml
            };
        };
        //om首页老用户qq登录
        this.homeCreate=function(params){
            params=params||{};
            // params.style='40';
            // params.hide_border='1';
            // params.target='parent';
            // params.width="400px";
            // params.height="350px";
            var config={
                style:'40',
                hide_border:'1',
                target:'parent',
                width:'700px',
                height:'350px'
            }
            $.extend(true, config, params);
            return this.create(config);
        };
        //om设置管理员qq号登录
        this.qqSetCreate=function(params){//需要提供default_uin参数
            params.enable_qlogin='0';//取消快速登录
            params.target=params.target||'parent';
            params.hide_close_icon = 1;//隐藏关闭按钮
            //当params.no_default_uin设置为true的时候，可以不填default_uin（默认qq号）
            if(!params.no_default_uin&&!params.default_uin){
                throw '请提供qq号参数';
            }
            return this.create(params);
        };
        //上传视频设置管理员qq号登录
        this.videoUploadCreate=function(params){//需要提供default_uin参数
            params.enable_qlogin='1';//取消快速登录
            params.target=params.target||'parent';
            params.hide_border = '1';
            params.hide_close_icon = 1;//隐藏关闭按钮
            //当params.no_default_uin设置为true的时候，可以不填default_uin（默认qq号）
            if(!params.no_default_uin&&!params.default_uin){
                throw '请提供qq号参数';
            }
            return this.create(params);
        };        
    }
    return PtLogin;
});