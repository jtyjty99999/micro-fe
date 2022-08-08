define(function(require, modules, exports) {
    var omlayer = require('layer/layer');

    var schedule_pub = {
        schedule_unbind: function() {
            $('#schedule_dialog_confirm').unbind('click');
            $('#s_day,#s_hour,#s_minute').unbind('change');
        },
        schedule_bind: function() {
            $('#schedule_dialog_confirm').bind('click', schedule_pub.confirm);
            //$('#schedule_dialog_cancel').bind('click', schedule_pub.cancel);
            $('#s_day').bind('change', function() {
                schedule_pub.timeChange('day')
            });
            $('#s_hour').bind('change', function() {
                schedule_pub.timeChange('hour')
            });
            $('#s_minute').bind('change', function() {
                schedule_pub.timeChange('minute')
            });
        },
        init: function() {
            var template = '<option value="{v}">{text}</option>';
            initData = {};
            initData.schedule_days = 4;
            initData.extra = {};
            if (!initData.extra.schedule_pub_server_time || initData.extra.schedule_pub_server_time == '') {
                api.getServerTimeUrl().then(function(res) {
                    if (res.response.code == 0) {
                        var date = new Date();
                        var timestamp = res.data.serverTime;
                        var ceil5Minute = Math.ceil(timestamp / (5 * 60)) * (5 * 60) * 1000; //upper to 5minute
                        date.setTime(ceil5Minute);
                        var month = date.getMonth() + 1;
                        var today = date.getDate();
                        var i = 0;
                        var d_text = '';
                        for (var i = 0; i < initData.schedule_days; i++) {
                            var t = template;
                            var _date = new Date(ceil5Minute + i * 24 * 60 * 60 * 1000).getDate();
                            t = t.replace('{v}', _date);
                            t = t.replace('{text}', _date);
                            d_text += t;
                        }
                        $('#s_day').html(d_text);

                        var h_text = '';

                        for (i = 0; i < 24; i++) {
                            var t = template;
                            t = t.replace('{v}', i.toString());
                            t = t.replace('{text}', i.toString());
                            h_text += t;
                        }
                        $('#s_hour').html(h_text);
                        var c_hour = date.getHours();
                        $('#s_hour').val(c_hour);

                        var m_text = '';
                        for (i = 0; i < 60; i += 5) {
                            var t = template;
                            t = t.replace('{v}', i.toString());
                            t = t.replace('{text}', i.toString());

                            m_text += t;
                        }
                        $('#s_minute').html(m_text);
                        var c_minute = date.getMinutes();
                        c_minute = (Math.ceil(c_minute / 5) * 5) % 60;
                        $('#s_minute').val(c_minute.toString());
                        initData.extra = {
                            schedule_pub_server_time: timestamp * 1000,
                            date: date,
                            day: today,
                            hour: c_hour,
                            minute: c_minute
                        }
                        var pub_tip = date.getFullYear().toString() + '年' + (date.getMonth() + 1).toString() + '月' + today.toString() + '日&nbsp;&nbsp;' + c_hour.toString() + '时' + c_minute + '分';
                        $('#schedule-pub-tip').html(pub_tip);
                        schedule_pub.schedule_bind();
                        $('#s_day').change();

                        $('#s_day').chosen("destroy").chosen({
                            width: "70px",
                            disable_search: true
                        });
                        $('#s_hour').chosen("destroy").chosen({
                            width: "70px",
                            disable_search: true
                        });
                        $('#s_minute').chosen("destroy").chosen({
                            width: "70px",
                            disable_search: true
                        });
                    }

                });
            }
        },

        getData: function() {
            var d = this.getDate();
            var d_timestamp = d.getTime();

            var t = new Date();
            t.setTime(parseInt(initData.extra.schedule_pub_server_time));
            var t_timestamp = t.getTime();

            if (d_timestamp < t_timestamp) {
                omlayer.msg('小于当前时间', {
                    icon: 3
                });
                return "";
            };
            // return "28#12#0"
            return d.getDate() + "#" + d.getHours() + "#" + d.getMinutes();
        },

        confirm: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var d_timestamp = this.getDate().getTime();

            var t = new Date();
            t.setTime(parseInt(initData.extra.schedule_pub_server_time));
            var t_timestamp = t.getTime();
            if (d_timestamp < t_timestamp) {
                omlayer.msg('小于当前时间', {
                    icon: 3
                });
                return;
            };
        },

        getDate: function() {
            var day = +$('#s_day').val();
            var hour = +$('#s_hour').val();
            var minute = +$('#s_minute').val();
            var d = new Date(parseInt(initData.extra.schedule_pub_server_time));
            var curDateStr = "";

            // dateObject 的月份字段，使用本地时间。返回值是 0（一月） 到 11（十二月） 之间的一个整数。
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            if (day < d.getDate()) {
                if (month == 12) {
                    curDateStr = "" + (year + 1) + "/01/" + day;
                    // d.setYear(d.getYear() + 1);
                    // d.setMonth(0);
                } else {
                    curDateStr = "" + year + "/" + (month + 1) + "/" + day;
                    // 异常 set2 get3 
                    // 3月31，变为4月31，实质为5月1号
                    // 使用该方法前需要保证date不会超过
                    // d.setMonth(month + 1);
                }
            } else {
                curDateStr = "" + year + "/" + month + "/" + day;
            }

            curDateStr = curDateStr + " " + hour + ":" + minute;
            console.log(curDateStr);
            return new Date(Date.parse(curDateStr));
        },

        timeChange: function(timeType) {
            var date = this.getDate();
            var pub_tip = date.getFullYear().toString() + '年' + (date.getMonth() + 1).toString() + '月' + date.getDate() + '日&nbsp;&nbsp;' + date.getHours() + '时' + date.getMinutes() + '分';
            $('#schedule-pub-tip').html(pub_tip);
        }
    };



    /////////////////////////////////////////////////////////////////////
    var api = require('base/api/article');
    var omtemplate = require('base/dialog/template');
    var layerId;
    var datetimePicker;

    DialogSchedule = function(params) {
        var config = {};
        $.extend(true, config, params);
        this.config = config;
    };

    DialogSchedule.prototype = {
        show: function(callback, option) {
            var _this = this;
            layerId = layer.open({
                type: 1,
                // title: "定时发布",
                title: ['定时发布', 'border-bottom:1px solid #e9eef4;'],
                content: omtemplate("art-dialog-schedule", option || {}),
                area: ['660px'],
                skin:'layer-ext-om select',
                // area: ['660px', '360px'],
                move: false,
                btn: [
                    '确定',
                    '取消'
                ],
                success: function($container, index) {
                    datetimePicker || new DatetimePicker();
                },
                yes: function(index, $container) {
                    var time = schedule_pub.getData();
                    if (time) {
                        callback && callback(time);
                    }
                },
                end: function() {

                },
                cancel: function() {
                    callback && callback();
                }
            });
        },
        hide: function() {
            layer.close(layerId);
        }
    };
    // 定时器
    function DatetimePicker() {
        this.init();
    }
    DatetimePicker.prototype = {
        init: function() {
            schedule_pub.init();
        }
    };
    return DialogSchedule;
});