### 微前端测试

[single-spa](https://github.com/CanopyTax/single-spa)

## run

1. run command below

   - `$ yarn install`
   - `$ yarn examples:install`
   - `$ yarn examples:start`

2. open browser  http://localhost:9000 

## usage

main entry
 
  
```
import { registerMicroApps ,start} from 'micro-fe'
    registerMicroApps(
        [{
                name:'slideNav',
                hash:'',
                entry:'/baseComponent/slideNav.js',
                always:true,
                store:'/baseComponent/store.js',
                globalEventDistributor:''
            },{
                name:'app1',            //子应用1 - react应用
                hash:'/app1',
                entry:'/app1/singleSpaEntry.js',
                always:false,
                store:'/app1/store.js',
                globalEventDistributor:''
            }
         ]
    )
    start();
```

- `registerMicroApps`

|参数名|参数类型|参数说明|
|--|--|---|
| `hash`| `string | Array<string>`  | 子应用激活hash |



## 目录结构
```shell

├── app1React                             // 微应用1 - 技术栈react
│   ├── components                        // 页面组件
│   ├── routes                            // 页面路由
│   ├── src                               // 项目入口目录
│   │    └── root.component.js            // react项目根入口
│   │    └── singleSpaEntry.js            // react项目对外提供入口
│   │    └── store.js                     // react项目对外接口
│   │    └── ...                     
│   └── ...
├── app4vue                               // 微应用4 - 技术栈vue
├── app6Vanilla                           // 微应用6 - 技术栈jQuery
├── baseComponent                         // 微应用 - 通用组件
├── portal                                // 微应用主应用（主入口） 
│   ├── libs                              // 外部依赖js
│   ├── src                               // 项目主目录
│   │    └── common.css                   // 通用样式表
│   │    └── globalEventDistributor.js    // 消息总线 - 全局事件派发
│   │    └── help.js                      // 对single-spa-加载子应用的封装
│   │    └── index.html                   // 项目首页
│   │    └── portal.js                    // 项目入口js
│   │    └── style.css                    // 通用样式表          
└── README.md                             

```

## 消息通信机制

每个应用都会拥有一个全局的消息总线 bcBus 和 自己应用的订阅者 bcSubscriber；你可以在应用生命周期函数props中拿到.
注意！ bcBus发消息的时候，所有的bcSubscriber都会接收到，而 bcSubscriber 发送时，自己不会接收到，其他应用会接收到。
这是因为bcBus不是属于当前应用的，而bcSubscriber则是跟着当前应用的。
一般情况下，需要发送消息的应用使用自己的bcSubscriber发送即可，除非是需要自己也收到消息。

```
export function mount(props) {
	const bcBus = props.bcBus;
	const bcSubscriber = props.bcSubscriber;
	bcSubscriber.onmessage = function (e) {
	  console.log('get message', e);
	};
	bcBus.postMessage('11111');
  return reactLifecycles.mount(props);
}

```


## 全局动态store
#### 背景
涉及到初始的用户数据、权限、项目等全局数据需要实时从主应用获取
#### 设计方案
基于react-redux
主应用维护全局store, 初始化时注入到子应用props，主应用负责顶层store数据的更新
子应用如果需要如需使用全局动态store，可通过props store获取
#### 原理
- 顶层store注册应用时的动态传递
- react-redux基于context的多store支持

***
#### 使用方式

- 子应用接入数据 (后续提供Provider自动注入初始Store数据)
**rootComponent.jsx**
```javascript
import { createDispatchHook, createSelectorHook, Provider } from 'react-redux';
const globalCtx = React.createContext();

export const useGlobalSelector = createSelectorHook(globalCtx);
export default class Root extends React.Component {
  static propTypes = {
    store: propTypes.object,
    globalEventDistributor: propTypes.object,
  };

  state = {
    store: this.props.globalStore, // 接入主应用props传入全局store
    globalEventDistributor: this.props.globalEventDistributor,
  };

  render() {
    return (
      <Provider store={Stores} >
        <Provider store={this.state.store} context={globalCtx}>
          <Router basename="/quality">
            <Suspense fallback={null}>
              <Switch>
                <Route path="/tables" component={QualityTables}></Route>
              </Switch>
            </Suspense>
          </Router>
        </Provider>
      </Provider>
    );
  }
}

```
**数据使用**

**Component.jsx**
```javascript
import { useGlobalSelector } from '@src/rootComponent';

const state = useGlobalSelector(state => state);

```

#### 注意
由于webpack针对每个entry对module的引用都有一份单独的cache，故需要使用统一的entry，否则会有多个store实例
**webpack.config.js**
```javascript
entry: {
  main: './src/index.js',
},
```
**index.js**
```javascript
import('./bootstrap');
import('./portal');
```

## 自定义createActivityFn

支持自己定义createActiveFn

#### example

```javascript
import { registerMicroApps } from 'micro-fe';
registerMicroApps(microApps, {
  createActivityFn: (app) => {
    const { hash } = app;
    return (location) => {
      const prefixList = Array.isArray(hash) ? hash : [hash];
      return prefixList.some(p => location.hash.startsWith(`#${p}`));
    };
  }
});
```
