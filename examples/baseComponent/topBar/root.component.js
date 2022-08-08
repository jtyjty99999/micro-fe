import { Component } from 'react';
import './index.css';
import './common.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <div className="topNav">
          <img  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAAAUCAYAAACH+XEaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjI3NjE5NzMzQjI2RjExRTlBQjU1QjMyRjBGMTAzNUREIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjI3NjE5NzM0QjI2RjExRTlBQjU1QjMyRjBGMTAzNUREIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Mjc2MTk3MzFCMjZGMTFFOUFCNTVCMzJGMEYxMDM1REQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Mjc2MTk3MzJCMjZGMTFFOUFCNTVCMzJGMEYxMDM1REQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5rCf29AAAKZklEQVR42uxc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" alt="" className="logo" />
          <div className="homeMenu">
            <ul className="ivu-menu ivu-menu-dark ivu-menu-horizontal">
              <li className="ivu-menu-item ivu-menu-item-active ivu-menu-item-selected"> 首页 </li>
              <li className="ivu-menu-item"> 资产目录 </li>
              <li className="ivu-menu-item"> 资产治理 </li>
              <li className="ivu-menu-item"> 资产运营 </li>
              <li className="ivu-menu-item"> 资产安全 </li>
              <li className="ivu-menu-item"> 系统管理 </li>
            </ul>
          </div>

          <div className="homeUser">
            <div className="user-avator-dropdown">
              <div className="ivu-dropdown">
                <div className="ivu-dropdown-rel">
                  <span className="ivu-avatar ivu-avatar-circle ivu-avatar-default ivu-avatar-image"><img src="http://dayu.oa.com/avatars/adamsjiang/avatar.jpg" />
                  <i className="ivu-icon ivu-icon-md-arrow-dropdown"></i>
                  </span>
                </div>
                <div className="ivu-select-dropdown">
                  <ul className="ivu-dropdown-menu">
                    <li className="ivu-dropdown-item" style={{ textAlign: 'center' }}>
                      <span className="ivu-avatar ivu-avatar-circle ivu-avatar-default ivu-avatar-image">
                        <img src="http://dayu.oa.com/avatars/adamsjiang/avatar.jpg" />
                        </span>
                    </li>
                    <li className="ivu-dropdown-item ivu-dropdown-item-divided"><p>姓名:姜天意</p><p>部门:医疗健康事业部</p></li>
                    <li className="ivu-dropdown-item ivu-dropdown-item-divided">CE反馈</li>
                    <li className="ivu-dropdown-item">帮助中心</li>
                    <li className="ivu-dropdown-item ivu-dropdown-item-divided">退出登录</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
    );
  }
}
export default NavBar;
