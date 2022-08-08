/**
 * Created by xiabingwu on 2015/10/29.
 */
define(function (require, exports, module) {
    var Subject = require('base/tool/subject');
    var subject = new Subject();
    var control = {};
    control.addObserver = function (newObserver) {
        subject.observe(newObserver);
        return this;
    };
    control.notify = function (type, data) {
        subject.notify(type, data);
    };
    return control;
});
