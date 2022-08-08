/**
 * Created by chuangwang on 2019/11/07.
 * 单篇统计、整体统计、订阅数统计复用该页面
 */

let tableTbody = require('./tableTbody');

function Main() {

    let self = this;
    let isBind = false;
    let isChangeTab = false;
       
    function eventBind() {
    }
    this.bizInit = function(pageName) {
       tableTbody.update(pageName);
       return this;
    };
    this.render = function() {
        if (!isBind) {
            isBind = true;
            eventBind();
        }
        return this;
    };
}
let mainEnter = new Main();
export {mainEnter}


