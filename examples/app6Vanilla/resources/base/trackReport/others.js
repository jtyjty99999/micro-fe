define(function(require){
    var utils = require('base/trackReport/utils');

    //点击logo行为上报
    $(document.body).on('click','.header-logo .header-logo-link',function(){
        utils.report("logo", "logo", 'click', 'click');
    })
    //退出行为上报
    $(document.body).on('click','.cell-logout .link-logout',function(){
        utils.report("signout", "signout", 'click', 'click');
    })
    //消息入口点击上报
    $(document.body).on('click','.link-message',function(){
        utils.report("messages", "messages", 'navigation', 'click');
    })

    //omgj-report属性设置上报数据
    $(document.body).on('click','[omgj-report]',function(){
        var reportOptions = $(this).attr('omgj-report');
        if(reportOptions){
            reportOptions = reportOptions.split('|');
        }

        utils.report(reportOptions[0], reportOptions[1], reportOptions[2], reportOptions[3]);
    })

    //注册
    var selectorMap = {
        "click [href=register]":"register"
    }
    utils.listen(selectorMap, 'om_register', 'om_register').addToTest('userAuth.index.registerPub', selectorMap);

    //消息 银行卡绑定
    !function(){
        var selectorMap = {
            "click #message #bandingCard":"bangding"
        }
        utils.listen(selectorMap, 'messages', 'messages').addToTest('messages', selectorMap);
    }()


    //导航切换行为上报
    $(document.body).on('click','.menu .menu-sub li',function(){
        //TODO:新开导航入口时补全boss映射,key取url以“/”分割后数组的最后一个元素
        var navBossMap = {
            "QQManage":"qq_manage",
            "articleHotManage":"hotarticle_manage",
            "rssManage":"rss_manage",
            "syncWeixin":"sync_weixin",
            "adHost":"ad_host",
            "adSubsidy":"ad_subsidy",
            "adSettle":"ad_settle",
            "accountSettings":"account_settings",
            "punishNotes":"punish_notes"
        }

        var navStatisticBossMap = {
            "articleStatistic":"article_statistic",
            "mediaStatistic":"media_statistic",
            "eyeIndex":"eye"
        }

        var navPageName = $(this).children('a').attr('href').split('/').reverse()[0].split('?')[0];
        if(navBossMap[navPageName]){
            utils.report(navBossMap[navPageName], navBossMap[navPageName], 'navigation', 'click');
        }
        if(navStatisticBossMap[navPageName]){
            utils.report('statistic', navStatisticBossMap[navPageName], 'navigation', 'click');
        }

    })
})