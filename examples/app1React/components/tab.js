import React, { Component } from 'react'
import { Link } from 'react-router-dom'
class Tab extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render(){
        return (
            <div className="tab-inline tab-inline-alt clearfix">

                    <Link to ="#/app1">文章发布</Link>
                    <Link to ="#/article">文章发布</Link>
                    <Link to ="#/images">组图发布</Link>
                    <Link to ="#/video">视频发布</Link>
                    
                    <div className="option">
                        <a className="info" href="###">客户端查看文章指引<i className="icon icon-guide"></i></a>
                    </div>                       
            </div>
        )
    }

}
export default Tab