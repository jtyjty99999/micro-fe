import React, { Component } from 'react'
import Tab from './tab'
import Article from './article'
class App extends Component {
    render() {
        return (
                    <div>
                            <div className="main-heading">
                                <h2>图文发布</h2>
                                <a className="intr-link hideCopyrightByWhiteList" href="http://om.qq.com/notice/a/20181211/014336.htm" target="_blank">付费版权图片计费说明<i className="icon icon-pay2"></i></a>
                            </div>
                            <Tab />

                            <div className = "container">
                                {this.props.children || <Article />}
                            </div>
                    </div>
        )
    }
}

module.exports = App