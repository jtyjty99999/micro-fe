import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import NavBar from './root.component.js';

export const navBar = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: NavBar,
  domElementGetter,
});


// 项目启动的钩子
export function bootstrap(props) {
  return navBar.bootstrap(props);
}

// 项目启动后的钩子
export function mount(props) {
  console.log(props);
  return navBar.mount(props);
}

// 项目卸载的钩子
export function unmount(props) {
  return navBar.unmount(props);
}


// Finally, we specify the location we want single-spa to mount our application
function domElementGetter() {
  return document.getElementById('topBar');
}
