import React from 'react';
import { connect } from 'react-redux';
class Counter extends React.Component {

    increment = () => {
        this.props.dispatch({ type: 'INCREMENT' });
    };

    decrement = () => {
        this.props.dispatch({ type: 'DECREMENT' });
    };

    globalIncrement = () => {
        this.props.globalEventDistributor.dispatch({ type: 'INCREMENT' });
    };

    globalDecrement = () => {
        this.props.globalEventDistributor.dispatch({ type: 'DECREMENT' });
    };

    changeNum = () => {
        window.PUBLISH_EVENT.dispatch('SHOW_NAME', { name: 'GitHub' })
    };

    render() {
        let pstyle = {
            lineHeight:'35px'
        }
        return (
            <div>
                <br />
                <div>
                    <b> 微应用之间通信： </b><br/><br/>
                    <b> Count1: {this.props.count}</b><br/><br/>

                    <b> Count2: {this.props.count}</b><br/><br/>
                

                    <p style = {pstyle}>
                        <button onClick={this.increment}>局部增加</button>
                        &nbsp; <b>局部事件监听</b>  只会在当前(app1-react)子应用起作用。
                    </p>    

                    <p style = {pstyle}>
                        <button onClick={this.decrement}>局部减少</button>
                        &nbsp; <b>局部事件监听</b>  只会在当前(app1-react)子应用起作用。
                    </p>  
                    <p style = {pstyle}>
                        <button onClick={this.globalIncrement}>全局增加</button>
                        &nbsp; <b>全局事件监听</b>  全局分发 - 所有子应用都会接收到并增加。
                    </p>
                    
                    <p style = {pstyle}>
                        <button onClick={this.globalDecrement}>全局减少</button>
                        &nbsp; <b>全局事件监听</b>  全局分发 - 所有子应用都会接收到并减少。
                    </p >

                     <p style = {pstyle}>
                        <button onClick={this.changeNum}>事件订阅通信方式</button>
                        &nbsp; <b>事件订阅通信方式</b>  全局分发 - 所有子应用都会接收到并减少。控制台打印：{'name: "GitHub"'}
                    </p >
                </div>

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        count: state.count
    };
}

export default connect(mapStateToProps)(Counter);