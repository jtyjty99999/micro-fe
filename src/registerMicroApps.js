import { importScript } from 'runtime-import';
import * as singleSpa from 'single-spa';
function isFunction(f) {
  return Object.prototype.toString.call(f) === '[object Function]';
}

export default async function loadApp(app, options) {
  const {
    globalEvent,
    bcBus,
    bcSubscriber,
    globalStore,
    createActivityFn: customCreateActivityFn,
  } = options;
  const { name, always, entry, store } = app;

  const applicationOrLoadingFn = () => {
    if (always) {
      return importScript(entry);
    }
    return importScript(entry);
  };

  const createActivityFn = (app) => {
    const { hash, always } = app;
    // always通用逻辑前置拦截处理
    if (always) {
      return () => true;
    }

    /**
     * 如果用户正确传递了activityFunction，则使用自定义的func
     * customCreateActivityFn: (app) => (location) => boolean
     */
    if (isFunction(customCreateActivityFn)) {
      return customCreateActivityFn(app);
    }

    return (location) => {
      const prefixList = Array.isArray(hash) ? hash : [hash];
      return prefixList.some(p => location.hash.startsWith(`#${p}`));
    };
  };

  let storeModule = {};
  const customProps = { globalEventDistributor: globalEvent, bcBus, bcSubscriber, globalStore };
  try {
    storeModule = store ? await importScript(store) : { storeInstance: null };
  } catch (e) {
    console.log(`Could not load store of app ${name}.`, e);
  }
  if (storeModule.storeInstance && globalEvent) {
    customProps.store = storeModule.storeInstance;
    globalEvent.registerStore(storeModule.storeInstance);
  }

  // 用singleSPA注册应用，并分发应用的store到globalEventDistributor
  singleSpa.registerApplication(
    name,
    applicationOrLoadingFn,
    createActivityFn(app),
    customProps,
  );
}
