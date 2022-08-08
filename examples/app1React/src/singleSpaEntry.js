import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import rootComponent from './rootComponent';


// 创建生命周期实例
const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent,
  domElementGetter,
});

// 项目启动的钩子
export function bootstrap(props) {
  return reactLifecycles.bootstrap(props);
}

// 项目启动后的钩子
export function mount(props) {
  const { bcBus } = props;
  const { bcSubscriber } = props;
  bcSubscriber.onmessage = function (e) {
	  console.log('get message', e);
  };
  bcBus.postMessage('11111');
  return reactLifecycles.mount(props);
}

// 项目卸载的钩子
export function unmount(props) {
  return reactLifecycles.unmount(props);
}

function domElementGetter() {
  let el = document.getElementById('app1');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app1';
    document.body.appendChild(el);
  }
  return el;
}
