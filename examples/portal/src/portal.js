import { registerMicroApps, start, Event } from '../../../src/index.js';

window.PUBLISH_EVENT = Event;

// step 1 注册子应用
registerMicroApps([
  {
    name: 'navBar',                      // 子应用名字
    hash: '',                           // 路由hash，如果是组件类型子应用置空
    entry: '/baseComponent/topBar.js', // 子应用入口js
    always: true,                     // 子应用是否默认加载显示
    store: '/baseComponent/store.js', // 子应用store通信用
    globalEventDistributor: '',       // 消息总线通信用
  }, {
    name: 'slideNav',
    hash: '',
    entry: '/baseComponent/slideNav.js',
    always: true,
    store: '/baseComponent/store.js',
    globalEventDistributor: '',
  }, {
    name: 'app1',            // 子应用1 - react应用
    hash: '/app1',
    entry: '/app1/singleSpaEntry.js',
    always: false,
    store: '/app1/store.js',
    globalEventDistributor: '',
  }, {
    name: 'app4',            // 子应用4 - vue应用
    hash: '/app4',
    entry: '/app4/singleSpaEntry.js',
    always: false,
    store: '',
    globalEventDistributor: '',
  }, {
    name: 'app6',            // 子应用6 - jquery应用
    hash: '/app6',
    entry: '/app6/singleSpaEntry.js',
    always: false,
    store: '',
    globalEventDistributor: '',
  },

], {
  bc: 'demo',
});

// 启动子应用

start();

// 全局事件订阅-用于事件通信

window.PUBLISH_EVENT.on('SHOW_NAME', (data) => {
  console.log(data.detail); // { name: 'GitHub' }
});
window.PUBLISH_EVENT.dispatch('SHOW_NAME', { name: 'GitHub' });


