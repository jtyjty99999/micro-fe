/**
 * Created by xiabingwu on 2016/3/23.
 */
define(function (require, exports, module) {
//观察者模式类
    function subject() {
        this._list = [];
    }

    subject.prototype.observe = function observeObject(obj) {
        this._list.push(obj);
    };
    subject.prototype.unobserve = function unobserveObject(obj) {
        for (var i = 0, len = this._list.length; i < len; i++) {
            if (this._list[ i ] === obj) {
                this._list.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    subject.prototype.notify = function notifyObservers() {
        var args = Array.prototype.slice.call(arguments, 0);
        for (var i = 0, len = this._list.length; i < len; i++) {
            var update=this._list[ i ].update;
            update&&update.apply(null, args);
        }
    };
    return subject;
});