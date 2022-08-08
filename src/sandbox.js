function isFunction(func) {
  return func && typeof func === 'function';
}
export default class Sandbox {
  constructor(props = {}) {
    this.multiMode = false;
    this.eventListeners = {};
    this.timeoutIds = [];
    this.intervalIds = [];
    this.propertyAdded = {};
    this.originalValues = {};
    const { multiMode } = props;
    if (!window.Proxy) {
      console.warn('proxy sandbox is not support by current browser');
      this.sandboxDisabled = true;
    }
    // enable multiMode in case of create mulit sandbox in same time
    this.multiMode = multiMode;
    this.sandbox = null;
  }
  createProxySandbox() {
    const { propertyAdded, originalValues, multiMode } = this;
    const proxyWindow = Object.create(null);
    const originalWindow = window;
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    const originalSetInerval = window.setInterval;
    const originalSetTimeout = window.setTimeout;
    // hijack addEventListener
    proxyWindow.addEventListener = (eventName, fn, ...rest) => {
      const listeners = this.eventListeners[eventName] || [];
      listeners.push(fn);
      return originalAddEventListener.apply(originalWindow, [eventName, fn, ...rest]);
    };
    // hijack removeEventListener
    proxyWindow.removeEventListener = (eventName, fn, ...rest) => {
      const listeners = this.eventListeners[eventName] || [];
      if (listeners.includes(fn)) {
        listeners.splice(listeners.indexOf(fn), 1);
      }
      return originalRemoveEventListener.apply(originalWindow, [eventName, fn, ...rest]);
    };
    // hijack setTimeout
    proxyWindow.setTimeout = (...args) => {
      const timerId = originalSetTimeout(...args);
      this.timeoutIds.push(timerId);
      return timerId;
    };
    // hijack setInterval
    proxyWindow.setInterval = (...args) => {
      const intervalId = originalSetInerval(...args);
      this.intervalIds.push(intervalId);
      return intervalId;
    };
    const sandbox = new Proxy(proxyWindow, {
      set(target, p, value) {
        // eslint-disable-next-line no-prototype-builtins
        if (!originalWindow.hasOwnProperty(p)) {
          // recorde value added in sandbox
          propertyAdded[p] = value;
          // eslint-disable-next-line no-prototype-builtins
        } else if (!originalValues.hasOwnProperty(p)) {
          // if it is already been setted in orignal window, record it's original value
          originalValues[p] = originalWindow[p];
        }
        // set new value to original window in case of jsonp
        // js bundle which will be execute outof sandbox
        if (!multiMode) {
          originalWindow[p] = value;
        }
        // eslint-disable-next-line no-param-reassign
        target[p] = value;
        return true;
      },
      get(target, p) {
        if (p === Symbol.unscopables) {
          return undefined;
        }
        if (['top', 'window', 'self', 'globalThis'].includes(p)) {
          return sandbox;
        }
        if (p === 'hasOwnProperty') {
          // eslint-disable-next-line no-prototype-builtins
          return key => !!target[key] || originalWindow.hasOwnProperty(key);
        }
        const targetValue = target[p];
        if (targetValue) {
          // 处理addEventListener, removeEventListener, setTimeout, setInterval setted in sandbox
          return targetValue;
        }

        const value = originalWindow[p];
        if (isFunction(value)) {
          // 简单判断是否是函数
          return value.bind(originalWindow);
        }

        // case of window.clientWidth、new window.Object()
        return value;
      },
      has(target, p) {
        return p in target || p in originalWindow;
      },
    });
    this.sandbox = sandbox;
  }
  getSandbox() {
    return this.sandbox;
  }
  execScriptInSandbox(script) {
    if (!this.sandboxDisabled) {
      if (!this.sandbox) {
        this.createProxySandbox();
      }
      try {
        const execScript = `with (sandbox) {;${script}\n}`;
        // eslint-disable-next-line no-new-func
        const code = new Function('sandbox', execScript).bind(this.sandbox);
        code(this.sandbox);
      } catch (error) {
        console.error(`error occurs when execute script in sandbox: ${error}`);
        throw error;
      }
    }
  }
  // 清理沙箱内容，避免内存溢出
  clear() {
    if (!this.sandboxDisabled) {
      // 清理事件绑定
      Object.keys(this.eventListeners).forEach((eventName) => {
        (this.eventListeners[eventName] || []).forEach((listener) => {
          window.removeEventListener(eventName, listener);
        });
      });
      // 清理计时器
      this.timeoutIds.forEach(id => window.clearTimeout(id));
      this.intervalIds.forEach(id => window.clearInterval(id));
      // 恢复window属性
      Object.keys(this.originalValues).forEach((key) => {
        window[key] = this.originalValues[key];
      });
      Object.keys(this.propertyAdded).forEach((key) => {
        delete window[key];
      });
    }
  }
}
