import React from 'react';
import { render } from 'react-dom';
import {Provider, connect} from 'react-redux';
import Counter from './counter';
import reactLogo from '../assets/react-logo.png';
import Article from '../components/article';
import Images from '../routes/imagesPush/components/images';
import Video from '../routes/videosPush/components/video';

import Stores from './store';  //***** 子应用开发时临时使用

import '../assets/main.css'

import {
    HashRouter as Router,
    Route,
    Link,
    Switch
  } from 'react-router-dom';
  

export default class Root extends React.Component {

    state = {
      store: this.props.store, // 接入主应用props传入全局store
      globalEventDistributor: this.props.globalEventDistributor,
    };


    componentDidCatch(error, info) {
        console.log(error, info);
    }

    chageStatus = () => {
        this.state.globalEventDistributor.dispatch({ type: 'CHANGE',value: 1 });
    };

    render() {

       return (
        <Provider store={Stores} /***** 子应用开发时使用 - 接入主应用store由props传入：this.state.store */> 
            <Router basename="/app1">
                    <div>
                            <div className="main-heading">
                                <h2>图文发布</h2>
                            </div>
                            <div className="tab-inline tab-inline-alt clearfix">

                                <ul className = "tab">
                                    <li><Link to ="/article">文章发布</Link></li>
                                    <li><Link to ="/images">组图发布</Link></li>
                                    <li><Link to ="/video">视频发布</Link></li>
                                    <li><a href="#/app2" onClick={this.chageStatus}>跳转到angularjs</a></li>
                                </ul>    

                                <div className="option">
                                    <a className="info" href="###">客户端查看文章指引<i className="icon icon-guide"></i></a>
                                </div>

                            </div>

                            <div className = "container">
                                 <Switch>
                                   <Route exact path="/">
                                        <Article />
                                    </Route>
                                    <Route exact path="/article">
                                        <img src='../assets/react-logo.png' style={{width: 100}}/> <br />
                                            微应用- App1 - 技术栈： React
                                        <Counter globalEventDistributor={this.state.globalEventDistributor}/>
                                    </Route>
                                    <Route path="/images">
                                        <Images />
                                    </Route>
                                    <Route path="/video">
                                        <Video />
                                    </Route>
                                </Switch>
                            </div>
                    </div>
            </Router>
            </Provider>
       )
    }
}
