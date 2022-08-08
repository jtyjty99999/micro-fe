/**
 * Created by jonahnzhang on 2016/4/7.
 */
define(function(require, exports, module) {

    var base = require('base/base');
    var template = require('base/component/template');
    var $ = window.jQuery;


    function trim(str) {
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }


    exports.isIllegalTitle = function(title) {
        var repeatNumRegx = /\w*(\d)\1{4}\w*/; // 例如：'444444'
        var repeatAlaRegx = /\w*([a-zA-Z])\1{4}\w*/; // 例如：'aaaaaa'
        var repeatZhRegx = /\w*([^\x00-\xFF])\1{4}\w*/; // 例如：'哈哈哈哈哈'
        var repeatAlaTwoRegx = /\w*([a-zA-Z]{2})\1{2}\w*/; // 例如：'qwqwqw'
        var zhRegx = /^[A-Za-z0-9]+$/; // 例如：'123dasdsa'
        return (repeatNumRegx.test(title) || repeatAlaRegx.test(title) || repeatAlaTwoRegx.test(title) || repeatZhRegx.test(title) || zhRegx.test(title));
    }

    exports.getRules = function() {
        return {
            'sp_symble_regx': { //【】[] {}<>带这种字符的标题，
                reg: /[\u3010\u3011\[\]{}<>\uFF08\uFF09\uff3b\uff3d\uff5b\uff5d]/,
                msg: {
                    article: '您的标题不规范（含有特殊字符），可能会影响推荐效果， 确认是否发布',
                    assets: '您的标题含有特殊字符，可能影响推荐效果，请修改'
                },
                action: 'enableToPubOrSave'
            },
            'pure_en_no_space': {
                reg: /^[a-zA-Z]*$/,
                msg: {
                    article: '您的标题纯英文且无空格，可能会影响推荐效果， 确认是否发布',
                    assets: '您的标题纯英文且无空格，可能会影响推荐效果， 确认是否保存',
                    text: '您的标题纯英文且无空格，请修改标题'
                },
                action: 'enableToPubOrSave'
            },
            'may_contain_episodes': {
                reg: /[\u7b2c].*[\u96c6\u671f]/,
                msg: {
                    article: '您的标题含有集数或期数，可能会影响推荐效果，确认是否发布',
                    assets: '您的标题含有集数或期数，可能会影响推荐效果，确认是否保存',
                    text: '您的标题含有集数或期数，请修改标题',
                },
                action: 'enableToPubOrSave'
            },
            'suffix_regx': {
                reg: /\.(avi|mp4|mpg|rm|mpeg|rmvb|wmv|mov|asf|mkv|3gp|divx|asf|flv)$/,
                msg: {
                    article: '您的标题不符合规范（含后缀），请修改标题',
                    assets: '您的标题不符合规范（含后缀），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'num_symble_leter': {
                method: function(str) {
                    return /^[0-9]+$/.test(str) || /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\uFF00-\uFFEF]+$/.test(str) || /^[0-9]+[a-zA-Z]+\w*$/.test(str) || /^[a-zA-Z]+[0-9]+\w*$/.test(str);
                },
                msg: {
                    article: '您的标题不符合规范（含纯数字、符号、字母数字组合等），请修改标题',
                    assets: '您的标题不符合规范（含纯数字、符号、字母数字组合等），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'no_cn_en': { //https://gist.github.com/shingchi/64c04e0dd2cbbfbc1350
                reg: /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uAC00-\uD7AF\u1100-\u11FF\u31A0-\u31BF]/,
                msg: {
                    article: '您的标题不符合规范（非中文或英文），请修改标题',
                    assets: '您的标题不符合规范（非中文或英文），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'only_date': {
                reg: /^(\d{6,8})|(\d{4}年\d{1,2}月\d{1,2}日)$/,
                msg: {
                    article: '您的标题不符合规范（仅含年月日），请修改标题',
                    assets: '您的标题不符合规范（仅含年月日），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            // 'space_3_more': {
            //     method: function(str) {
            //         var test = false, con = 0;
            //         str.replace(/\s/g, function(){
            //             con++;
            //             if(con >= 3) {
            //                 test = true;
            //             }
            //         })
            //         return test;
            //     },
            //     msg: {
            //         article: '您的标题不符合规范（出现空格过多），请修改标题',
            //         assets: '您的标题不符合规范（出现空格过多），请修改标题'
            //     },
            //     action: 'disableToPubOrSave'
            // },
            'gz_weixin': {
                reg: /微信号|关注微博|weixin|weibo|QQ/,
                msg: {
                    article: '您的标题不符合规范（涉及广告宣传），请修改标题',
                    assets: '您的标题不符合规范（涉及广告宣传），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            /**
             * http://tapd.oa.com/OMQQ/prong/stories/view/1010116611058207215
             * https://tapd.tencent.com/10116611/prong/stories/view/1010116611058200363
             */
            // 'biao_ti_dang': { //标题含以下词语：
            //     reg: /万万没想到|意想不到|惊呆了|震惊了|必须知道|不得不|算你牛|你可能还不知道|赶紧收藏吧|简直了|吓人|竟然现在才知道|下一秒却让所有人都看傻了|惹得全场都怒了|一瞬间所有人都傻了|奇迹发生了！|非常值得一看|结果.{3,}|传遍朋友圈|看过都沉默|听了无不汗颜|竟做出这种事|竟然是/,
            //     msg: {
            //         article: '您的标题不规范（标题夸张），可能会影响推荐效果， 确认是否发布',
            //         assets: '您的标题不规范（标题夸张），可能会影响推荐效果， 确认是否保存'
            //     },
            //     action: 'enableToPubOrSave'
            // },
            // 'LGBT': {//标题涉及LGBT群体：
            //     reg: /同性恋|变性恋|双性恋|跨性恋|蕾丝|拉拉|gay|lesbians|Bisexuals|Transgender/,
            //     msg: {
            //         article: '您的标题不规范（涉及敏感词），可能会影响推荐效果，确认是否发布',
            //         assets: '您的标题不规范（涉及敏感词），可能会影响推荐效果，确认是否保存'
            //     },
            //     action: 'enableToPubOrSave'
            // },
            // 'di_su_maybe': {//标题含潜在低俗可能：
            //     reg: /美女|主播|钢管舞|屌丝|韩舞|奇葩|柳岩|少女|鬼畜|超模|情感催泪|保健|逗比|女神|歪果仁|搞笑恶搞|同人|魔性|90后|萝莉|吃播|毁童年|吐槽大会|维多利亚的秘密|宅舞|撩妹|ladybeard|周秀娜|不正常人类|女主播|短裤|护士服|小护士|韩国妹子|女医生|推倒|女人|男人|女友|女朋友|日本综艺|老板|老公|破鞋|宾馆/,
            //     msg: {
            //         article: '您的标题不规范（涉及敏感词），可能会影响推荐效果，确认是否发布',
            //         assets: '您的标题不规范（涉及敏感词），可能会影响推荐效果，确认是否保存'
            //     },
            //     action: 'enableToPubOrSave'
            // },
            // 'di_su': {//标题涉及低俗
            //     word: '长腿、出轨、性教育、抖臀、大尺度、两性、干露露、狗血、小三、苍井空、波多野结衣、比基尼、杜蕾斯、妖男、女团、电臀、腐女、变态杀手、孕期性生活、忘年恋、产后性生活、恶搞综艺、朴恩率、岛国、热舞、朴恩率、美臀、湿身、短裙、裸身、护士制服、乳沟、大白腿、极度性感、丝袜、镂空、放大特写、脱衣服、玩诱惑、扒光、胸罩、韩国美女、开房、事业线、撸、屌丝、小三激战、野战、齐B小短裙、Ru沟、美女按摩、小姨子、姐夫、艳照、脱光、按摩店、辣妹热舞、白色液体、情妇、奸夫、太黄、开胸旗袍、小内内、黑丝、性高潮、寂寞少妇、激情戏、情趣用品、少妇、情趣内衣、情人、下体、大胸、翘臀、床戏、大尺度、潜规则、蜜桃臀、性侵、狂撕、卖身、抓胸、缠绵、床上关系、不堪寂寞、小三、嫂嫂、生理反应、男人大小、房中术、妓女、美女、性感、私处、热舞、和尚、嫩模、长腿、杜蕾斯、内裤、底裤、走光、露底、性教育、初夜、第一次、车模、嘿嘿嘿、基情、BL、百合、腐女、精子、射精、卵子、激情、比基尼、内衣、女优、苍井空、车震、超模、尼姑、无节操、新婚夜、足球宝贝、篮球宝贝、英超宝贝、动物交配、生理知识 、生理讲堂 、两性关系 、性知识、交配、闹洞房、洞房、大姨妈、猥亵  、卖淫、嫖娼  、涉黄、轮奸、揩油、袭胸、裸照、不雅照、不雅视频、强暴、毛片、应召女郎 、站街女 、妓女 、公关 、脱衣舞 、自慰、春药、性骚扰  、迷奸、出轨、纵欲、捉奸、早泄、援交、诱奸、幽会、淫乱、艳星、艳舞、胸围、胸器、性征、性欲、性瘾、性事、性生活、性骚扰、性器官、性奴、性交、性工作者、性爱、写真、小泽玛利亚、小蛮腰、香艳、舞女、猥亵、通奸、调情、挑逗、体位、素女、私通、事业线、施暴、上围、三级片、惹火、全裸、情欲戏、情欲、情色、情夫、青楼、强奸、缱绻、前戏、嫖客、劈腿、女佣、美胸、美腿、马震、裸戏、裸体、裸背、乱伦、露胸、露毛、露骨、露点、泷泽萝拉、撩拨、两性、老鸨、巨乳、精液、交际花、交媾、奸淫、加藤鹰、妓院、激凸、花前月下、豪乳、行房、肛交、负心汉、二奶、耳鬓厮磨、胴体、电臀、第三者、床上戏、雏妓、出浴、尺度大开、晨勃、娼妓、缠绵悱恻、勃起、安全套、爱抚、爱爱、lovepalz、lelo、a片、av、R级、G点、羞羞片、浴室paly、掀衣露胸、隔壁老王、撩妹、偷窥、猥琐、tun线、内内、真空、真空上阵、床上功夫、阴道、凌辱、夜店、夜蒲、床上文化、有毒、私密、搭讪、裙下、共侍一夫、胸咚、壁咚、把持、子宫颈、子宫、太子妃、半裸、泡妹子、D奶、G奶、E奶、裤裆、绿帽、绿帽子、沟线',
            //     msg: {
            //         article: '您的标题不规范（涉及敏感词），可能会影响推荐效果，确认是否发布',
            //         assets: '您的标题不规范（涉及敏感词），可能会影响推荐效果，确认是否保存'
            //     },
            //     action: 'enableToPubOrSave'
            // },
            'gao_guang': { //标题含竞品网站。 如“乐视”“优酷土豆”“爱奇艺”“搜狐”“酷六”“华数”“芒果tv”
                word: '乐视、优酷土豆、爱奇艺、搜狐、酷六、华数、芒果tv',
                msg: {
                    article: '您的标题不规范（涉及广告宣传），可能会影响推荐效果，确认是否发布',
                    assets: '您的标题不规范（涉及广告宣传），可能会影响推荐效果，确认是否保存'
                },
                action: 'enableToPubOrSave'
            },
            // 'gao_guang_maybe': {//结尾出现中文+数字 如“马自达c4”“奥迪a6”
            //     reg: /[\u4e00-\u9fa5].*\d$/, //结尾出现中文+数字 如“马自达c4”“奥迪a6”
            //     msg: {
            //         article: '您的标题不规范（不建议以数字结尾），可能会影响推荐效果，确认是否发布',
            //         assets: '您的标题不规范（不建议以数字结尾），可能会影响推荐效果，确认是否保存'
            //     },
            //     action: 'enableToPubOrSave'
            // },
            'qing_se': { //标题情色低俗
                reg: /要射了|约炮|约P|活春宫|爆乳|做爱|性福|强奸|性侵|思春|口交|肛交|娼妓|乳交|视奸/,
                msg: {
                    article: '您的标题不符合规范（涉及低俗内容），请修改标题',
                    assets: '您的标题不符合规范（涉及低俗内容），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'symble_4_more': { //标题包含4个以上标点/特殊符号
                method: function(str) {
                    var test = false,
                        con = 0;
                    str.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\uFF00-\uFFEF]/g, function() {
                        con++;
                        if (con >= 4) {
                            test = true;
                        }
                    })
                    return test;
                },
                msg: {
                    article: '您的标题不符合规范（符号过多），请修改标题',
                    assets: '您的标题不符合规范（符号过多），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'repeat_4_more': { //同一个数字、字母、汉字、连续超过4个
                reg: /([a-zA-Z0-9\u4e00-\u9fa5])\1{3,}/,
                msg: {
                    article: '您的标题不符合规范（数字、字母、汉字重复过多），请修改标题',
                    assets: '您的标题不符合规范（数字、字母、汉字重复过多），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'group_repeat_3_more': { //11.两个字母、数字、连续重复2次以上，即类似“qwqwqw”,“121212”这样的字
                reg: /([a-zA-Z0-9]{3})\1{1,}/,
                msg: {
                    article: '您的标题不符合规范（字母、数字重复过多），请修改标题',
                    assets: '您的标题不符合规范（字母、数字重复过多），请修改标题'
                },
                action: 'disableToPubOrSave'
            },
            'baoli': { //12.标题涉及暴力.
                reg: /腥风血雨|血肉横飞|血肉模糊|烂肉|人血|人间炼狱|修罗杀场|嗜血|穿肠破腹|肢解|游魂野鬼|糜烂/,
                msg: {
                    article: '您的标题不符合规范（涉及暴力、血腥），请修改标题',
                    assets: '您的标题不符合规范（涉及暴力、血腥），请修改标题'
                },
                action: 'disableToPubOrSave'
            }
        }
    }


    /**
     * 标题是否合法
     * 需求：http://tapd.oa.com/OMQQ/prong/stories/view/1010116611058200363
     *
     * title {string} 要检测的标题
     */
    exports.verify = function(title) {
        var rules = exports.getRules();
        var rulelist = [];
        for (var x in rules) {
            rulelist.push(rules[x]);
        }
        rulelist.sort(function(a, b) {
            if (a.action > b.action) {
                return 1;
            }
            if (a.action < b.action) {
                return -1;
            }
            // a must be equal to b
            return 0;
        })

        for (var k = 0, len = rulelist.length; k < len; k++) {
            var rule = rulelist[k];

            if (rule.reg) {
                if (rule.reg.test(title)) {
                    return doRuleAction(rule);
                }
            } else if (rule.method) {
                if (rule.method(title)) {
                    return doRuleAction(rule);
                }
            } else if (rule.word) {
                var results = rule.word.split('、');
                if (results && results.length) {
                    for (var i = 0, l = results.length; i < l; i++) {
                        var v = results[i];
                        var _reg = new RegExp(trim(v));
                        if (_reg.test(title)) {
                            return doRuleAction(rule);
                        }
                    }
                }
            }
        }
    }

    function doRuleAction(rule) {

        switch (rule.action) {
            case 'enableToPubOrSave':
                return {
                    rule: rule,
                    ui: function(msg, yes, btn) {
                        return $.Deferred(function(dfd) {
                            layer.open({
                                type: 1,
                                closeBtn: 1,
                                shadeClose: true,
                                title: ['温馨提示', 'border-bottom:1px solid #e9eef4;'],
                                area: ['500px', 'auto'],
                                content: template('illegaVideoTitle', {
                                    msg: msg
                                }),
                                btn: btn || ['保存', '取消'],
                                yes: function(index) {
                                    dfd.resolve();
                                    layer.close(index);
                                    if (yes) {
                                        yes.call(null, index);
                                    }

                                },
                                cancel: function() {
                                    dfd.reject();
                                }
                            });
                        }).promise();
                    }
                }
                break;
            case 'disableToPubOrSave':
                return {
                    rule: rule,
                    ui: function() {
                        layer.msg(rule.msg.assets, {
                            icon: 3
                        });
                    }
                }
                break;
            default:
        }

        return {
            rule: {},
            ui: function() {
                console.log('end!');
            }
        };
    }

});