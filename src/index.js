import 'zone.js';
import * as singleSpa from 'single-spa';
import GlobalEventDistributor from './globalEventDistributor';
import loadApp from './registerMicroApps';
import CustomEvent from './customEvents.js';
import SandboxClass from './sandbox.js';
import BroadcastChannel from './broadcast-channel.js';

const loadingPromises = [];
export const registerMicroApps = function (apps, config = {}) {
  const globalEventDistributor = new GlobalEventDistributor();
  // const channel = config.bc || 'micro-fe';
  const { bc: channel = 'micro-fe', globalStore, createActivityFn } = config;
  // const store = config.store;
  // 初始化总线
  const bcBus = new BroadcastChannel(channel);
  apps.forEach((app) => {
    const bcSubscriber = new BroadcastChannel(channel);
    loadingPromises.push(loadApp(app, {
      globalEventDistributor,
      bcBus,
      bcSubscriber,
      globalStore,
      createActivityFn,
    }));
  });

  // 监听第一个app加载
  window.addEventListener('single-spa:first-mount', () => {
    console.log('single-spa just mounted the very first application');
  });
  window.addEventListener('single-spa:before-first-mount', () => {
    console.log('single-spa is about to mount the very first application for the first time');
  });
};
export const start = function () {
  const init = async function () {
    await Promise.all(loadingPromises);
    singleSpa.start();
  };
  init();
};

export const Event = CustomEvent;
export const Sandbox = SandboxClass;
export const BC = BroadcastChannel;
export const EventDistributor = GlobalEventDistributor;
export const SingleSpa = singleSpa;
