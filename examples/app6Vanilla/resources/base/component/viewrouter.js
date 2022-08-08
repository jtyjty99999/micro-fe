/**
 * Created by Jonahnzhang on 2016/8/10.
 */
define(function (require, exports, module) {
    
        var base=require('base/base');
        var $ = window.jQuery;
    
        /**
         * guid js implement
         * var uuid = guid();
         */
        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
    
        module.exports = function (opt) {
    
            var module = $.extend({//删了true,深度复制有问题,action触发后找不到refresh todo
                base: 'biz/account/accountSettingStatus/',
                index: 'index',
                urlnavigate: false,
                fadeIn : true,
                pageContainer: '.main',
                params: {},
                dependencies:{}
            },opt);
    
            var salt = /#\/!\//;
    
            if(salt.test(location.hash)) {
                //urlnavigate 为false时依然可以从url内获的参数导航，这样是不是不太好
                viewNavigat(location.hash.replace(salt,''), module.params);
            } else {
                viewNavigat('view:' + module.index, module.params, module.params);
            }
    
            $(window).on('hashchange', function(){
                if (salt.test(location.hash)) {
                    viewNavigat(location.hash.replace(salt,''));
                }
            });
    
            $('body').on('click','[href^=view]', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                if(module.urlnavigate) {
                    location.hash = '/!/' + href;
                } else {
                    viewNavigat(href);
                    if(location.hash && location.hash !== '#/') { location.hash = '#/'; };
                }
            }).on('click', '[href^=viewgo]', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                viewNavigat(href);
            }).on('click','[href^=viewlink]', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                location.hash = '/!/' + href;
            }).on('click','[href^=action]', function(e){
                e.preventDefault();
                actionpipe($(this).attr('href'));
            }).on('click','[action]', function(e){
                e.preventDefault();
                actionpipe('action:' + $(this).attr('action'));
            }).on('click','[action-unbubble]', function(e){
                //阻止事件冒泡的action回调
                //添加原因：容器内元素触发事件导致整个容器内容更新时，在某些ie9下会崩溃，怀疑是冒泡事件没有完成，DOM树被更改导致
                e.preventDefault();
                e.stopPropagation();
                actionpipe('action:' + $(this).attr('action-unbubble'));
            }).on('submit','form[actionsubmit]', function(e){
                e.preventDefault();
                actionpipe('action:' + $(this).attr('actionsubmit'), $(this).serializeArray());
            })
            .on('change','[actionchange]', function(e){
                e.preventDefault();
                actionpipe('action:' + $(this).attr('actionchange'));
            }).on('focus','input[actionedit], textarea[actionedit]', function(e){
                e.preventDefault();
                var ele = this;
                setTimeout(function(){
                    var userInput = '';
                    var lastInput = '';
                    IntervalId = setInterval(function(){
                        userInput = $(ele).val();
                        if(userInput != lastInput){
                            actionpipe('action:' + $(ele).attr('actionedit'))(userInput, ele);
                            lastInput = userInput;
                        }
                    }, 100);
                },1);
            }).on('blur', 'input[actionedit], textarea[actionedit]', function(e){
                e.preventDefault();
                clearInterval(IntervalId);
            }).on('blur', 'input[actionsubmit]', function(e){
                e.preventDefault();
                clearInterval(IntervalId);
                if($(this).val() == ''){
                    actionpipe('action:' + $(this).attr('actionsubmit'));
                }
            })
            .on('blur', 'input[actionblur]', function(e){
                actionpipe('action:' + $(this).attr('actionblur'))($(this).val(), this);
            })
            .on('keydown', 'textarea[actionsubmit]', function(e){
                //textarea ctrl+enter触发事件
                if(e.ctrlKey && e.keyCode == 13) {
                    $(this).blur();
                    actionpipe('action:' + $(this).attr('actionsubmit'));
                }
            }).on('keydown', 'input[actionsubmit]', function(e){
                //input enter触发事件
                if (e.keyCode == 13) {
                    $(this).blur();
                    actionpipe('action:' + $(this).attr('actionsubmit'));
                }
            })
    
            function load(page) {
                return function(pageview) {
                    $(module.pageContainer).attr('page', page);
                    if(module.fadeIn){
                        $(module.pageContainer).hide().html(pageview).fadeIn();                 
                    }else{
                        $(module.pageContainer).html(pageview);    
                    }             
                }
            }
    
            function rend(page, pageModule) {
                pageModule.bindEvent = pageModule.bindEvent || function(){};
                return function(pageview) {
                    $('[page="'+ page +'"]'+module.pageContainer).html(pageview);
                    pageModule.bindEvent();
                }
            }
    
    
            /**
             * 异步绑定
             */
            function asyncbind(page, pageModule) {
                pageModule.bindEvent = pageModule.bindEvent || function(){};
                return function(asyncaction) {
                    var actid = guid();
                    pageModule.$actions = pageModule.$actions || [];
                    pageModule.push(actid);
                    asyncaction(function(pageview){
                        if(pageModule.$actions && pageModule.$actions[pageModule.$actions.length - 1] === actid) {
                            if(pageview) { rend(page, pageModule)(pageview); }
                            pageModule.$actions = null;
                            return true
                        } else {
                            return false
                        }
                    })
                }
            }
    
    
            /**
             * view 导航
             */
            var pageModule;
            function viewNavigat(link, data) {
                link.replace(/^view:([^?]*)[?]?(.*)/, function(src, page, ram){
                    var params = ram.split('&');
                    data = data || {};
                    for (var i = 0, l = params.length; i < l; i++) {
                        var v = params[i];
                        if(/^[^=]*=.*/.test(v)) {
                            data[v.replace(/^([^=]*)=.*/,'$1')] = v.replace(/^[^=]*=(.*)/,'$1');
                        }
                    }
    
                    if(pageModule && pageModule.onDestroy){
                        pageModule.onDestroy().then(function(){
                            loadPageModule(page, data);
                        })
                    }else{
                        loadPageModule(page, data);
                    }
                })
            }
    
            /**
             * 模块加载
             */
            function loadPageModule (page, data) {
                pageModule = module.dependencies[module.base + page];
                if('function' === typeof pageModule.init) { pageModule.init(); }
                pageModule.loading = load(page);
                pageModule.refresh = pageModule.paginate = rend(page, pageModule);
                pageModule.$fastclick = asyncbind(page, pageModule);
                pageModule.$go = viewNavigat;
                pageModule.rend(data).progress(pageModule.loading).then(pageModule.refresh);
            }
    
            /**
             *  事件分发
             */
            function actionpipe(ram, params) {
                var page = $(module.pageContainer).attr('page');
    
                if(!page) { return }
                var action, params = params || [];
                ram.replace(/^action:([^(]*)\(([^)]*)\)/, function(source, key, data) {
                    action = key;
                    if(!params.length) {
                        params = data.split(',');
                        for (var i = 0, l = params.length; i < l; i++) {
                            var v = params[i];
                            params[i] = v.replace(/^\s*|\s*$/g,'');
                        }
                    }
                });
                var pagemodule = module.dependencies[module.base + page];
                if(pagemodule && pagemodule[action]) {
                    return pagemodule[action].apply(pagemodule,params);
                }
            }
        }
    
    });    