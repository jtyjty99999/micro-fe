import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import SlideNav from './root.component.js';

export  const slideNav = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: SlideNav,
  domElementGetter,
});


// 项目启动的钩子
export function bootstrap(props) {
  return slideNav.bootstrap(props);
}

// 项目启动后的钩子
export function mount(props) {
  console.log(props);
  return slideNav.mount(props);
}

// 项目卸载的钩子
export function unmount(props) {
  return slideNav.unmount(props);
}

// Finally, we specify the location we want single-spa to mount our application
function domElementGetter() {
  return document.getElementById('slideNav');
}
