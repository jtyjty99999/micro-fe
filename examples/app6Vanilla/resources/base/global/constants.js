define(function(require, modules, exports) {

    let defineConstants = {};
    defineConstants.DefineConstants = function() {
        let constantsObj = {};
        constantsObj = Object.prototype.hasOwnProperty;

        return {
            set: function (name, value) {
                if (this.isDefined(name)) {
                    return false;
                }
                constantsObj[name] = value;
                return true;
            },
            isDefined: function (name) {
                return constantsObj.call(constantsObj, name);
            },
            get: function (name) {
                if (this.isDefined(name)) {
                    return constantsObj[name];
                }
                return null;
            }
        };
    };

    let constants = defineConstants.DefineConstants();
    // 全局通用字符串
    constants.set('UNPUSHED', '未发布');
    constants.set('PUSHED', '已发布');
    constants.set('PUSH', '发布');
    constants.set('REVIEW', '审核中');
    constants.set('STOP', '被下线');
    constants.set('UNSTARTE', '未开始');
    constants.set('LIVERADIOSTARTING', '直播中');
    constants.set('LIVERADIODONE', '已结束');
    constants.set('GALLERY', '图集');
    constants.set('VIDEO', '视频');
    constants.set('LIVE', '直播');
    constants.set('VIDEOLIVE', '视频直播发布');
    constants.set('HASERROR', '获得地域信息出错了');
    constants.set('SELECTCATEGORY', '选择分类');
    constants.set('PLEASE_SELECTCATEGORY', '请选择分类');
    constants.set('PLEASE_SELECTAREA', '请选择地域');
    constants.set('SELECTCATEGORYERROR', '获得分类出错了');
    constants.set('NOCHOSE', '缺少chosen插件');
    constants.set('SELECTPROVINCE', '选择省份');
    constants.set('GLOBAL', '全国');
    constants.set('SELECTCITY', '选择城市');
    constants.set('ALL', '全部');
    constants.set('SELECTCOUNTY', '选择区域');

    // 手动发文管理页面字符串
    constants.set('WZGL_CENSORROLLBACK_BFHGF', '资料不符合规范');
    constants.set('WZGL_CENSORROLLBACK_FMBFHGF', '封面不符合规范');
    constants.set('WZGL_CENSORROLLBACK_BTBFHGF', '标题不符合规范');
    constants.set('WZGL_CENSORROLLBACK_WFBBFHGF', '未发布（资料不符合规范）');
    constants.set('WZGL_CENSORROLLBACK_WFBFMBFHGF', '未发布（封面不符合规范）');
    constants.set('WZGL_CENSORROLLBACK_WFBBTBFHGF', '未发布（标题不符合规范）');
    constants.set('WZGL_CENSORROLLBACK_RESOURCETIP', '视频标题和封面图不符合规范，请修改后提交。');
    constants.set('WZGL_USERAPPLY_CGZS', '不能超过100个字!');
    constants.set('WZGL_USERAPPLY_APPLYOK', '感谢你提出反馈！我们非常重视收到的每一条意见，虽然不能逐一回复，但我们会参考你的意见，竭力改善你对腾讯视频产品使用体验。');

    // 发表文章页面字符串
    constants.set('FWGL_PUSH_OVERTIME', '今日投稿已超上限');
    constants.set('FWGL_PUSH_TOUGAO', '投稿');
    constants.set('FWGL_PUSH_DESCNOEMPTY', '导语不能为空');
    constants.set('FWGL_PUSH_DESCNOLESS10', '导语不能少于10个字');
    constants.set('FWGL_PUSH_DESCNOMORE55', '导语不能大于55个字');

    // 发文模块标题的最大长度
    constants.set('TITLEMAXLENGTH', 35);

    return constants;

});