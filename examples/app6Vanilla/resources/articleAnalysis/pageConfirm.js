
define(function (require, exports, module) {
    // var OM = require('old/utils');
    let base = require('OM_BASE');
    let Method = base.tool.method;
    let filter = require('biz/article/articleAnalysis/filter');// 过滤器
    let totalData = require('biz/article/articleAnalysis/totalData');// table主体展示

    let userAnalysis = require('biz/article/articleAnalysis/userAnalysis');
    // 确认来着哪个页面(单篇统计、整体统计、订阅数统计复用该页面)
    function pageConfirm(pageName) {
        let curDate = new Date();
        let curDate1 = Method.clone(curDate);
        let sd; let ed;
        // 单篇统计
        function articleStatisticPageConfirm() {
            // 更新左侧导航
            $('.menu').find('li').removeClass('active');
            $('.menu').find('.mediaStatistic').addClass('active').parents('li').addClass('active');
            sd = curDate.setDate(curDate.getDate() - 6);
            ed = curDate1.setDate(curDate1.getDate());
            $('#startdate').val('请选择');
            $('#enddate').val(new Date(ed).Format('yyyy-MM-dd'));
            filter.change({
                type: 'article',
            });
        }
        // 整体统计
        function mediaStatisticPageConfirm() {
            // 更新左侧导航
            $('.menu').find('li').removeClass('active');
            $('.menu').find('.mediaStatistic').addClass('active').parents('li').addClass('active');

            sd = curDate.setDate(curDate.getDate() - 7);
            ed = curDate1.setDate(curDate1.getDate() - 1);
            $('#startdate').val(new Date(sd).Format('yyyy-MM-dd'));
            $('#enddate').val(new Date(ed).Format('yyyy-MM-dd'));

            filter.change({
                type: 'media',
                clientType: 'total',
                btime: Math.round(sd / 1000),
                etime: Math.round(ed / 1000)
            });
            totalData.update();
        }
        // 订阅数统计
        function subscribeStatisticConfirm() {
            // 更新左侧导航
            $('.menu').find('li').removeClass('active');
            $('.menu').find('.subscribeStatistic').addClass('active').parents('li').addClass('active');

            sd = curDate.setDate(curDate.getDate() - 7);
            ed = curDate1.setDate(curDate1.getDate() - 1);
            $('#startdate').val(new Date(sd).Format('yyyy-MM-dd'));
            $('#enddate').val(new Date(ed).Format('yyyy-MM-dd'));

            filter.change({
                type: 'subscribe',
                // subType:'allKind',
                clientType: 'total',
                btime: Math.round(sd / 1000),
                etime: Math.round(ed / 1000)
            });
            totalData.update();
        }

        // 单视频统计
        function videoStatisticConfirm() {
            $('.menu').find('li').removeClass('active');
            $('.menu').find('.videoStatistic').addClass('active').parents('li').addClass('active');

            sd = curDate.setDate(curDate.getDate() - 6);
            ed = curDate1.setDate(curDate1.getDate());
            $('#startdate').val('请选择');
            // $('#startdate').val(new Date(sd).Format('yyyy-MM-dd'));
            $('#enddate').val(new Date(ed).Format('yyyy-MM-dd'));

            filter.change({
                type: 'video',
            });
        }
        // 视频整体统计
        function videoMediaStatisticConfirm() {
            $('.menu').find('li').removeClass('active');
            $('.menu').find('.videoStatistic').addClass('active').parents('li').addClass('active');

            sd = curDate.setDate(curDate.getDate() - 7);
            ed = curDate1.setDate(curDate1.getDate() - 1);
            $('#startdate').val(new Date(sd).Format('yyyy-MM-dd'));
            $('#enddate').val(new Date(ed).Format('yyyy-MM-dd'));

            filter.change({
                type: 'videomedia',
                clientType: 'total',
                btime: Math.round(sd / 1000),
                etime: Math.round(ed / 1000)
            });
            totalData.update();
        }
        // 视频用户分析
        function videoUserAnalysisConfirm() {
            $('.menu').find('li').removeClass('active');
            $('.menu').find('.videoStatistic').addClass('active').parents('li').addClass('active');

            if (!userAnalysis.isInit) {
                userAnalysis.bizInit().render();
            }
        }
        switch (pageName) {
            case 'articleStatistic':
                articleStatisticPageConfirm();
                break;
            case 'mediaStatistic':
                mediaStatisticPageConfirm();
                break;
            case 'subscribeStatistic':
                subscribeStatisticConfirm();
                break;
            case 'videoStatistic':
                videoStatisticConfirm();
                break;
            case 'videoMediaStatistic':
                videoMediaStatisticConfirm();
                break;
            case 'videoUserAnalysis':
                videoUserAnalysisConfirm();
                break;
        }
    }
    return {
        confirm: pageConfirm
    };

});