/**
 * Created by chuangwang on 2019/11/8.
 */

/* 加载工具箱结束 */
let user = require('./user/user');
let plugin = require('./component/pluginable');
let newPaging = require('./component/newPaging');
let base = {
    $: plugin.get$(),
    component:{
        newPaging: newPaging,
    },
    user:user
}
module.exports  = base;

