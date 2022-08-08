import React, { Component } from 'react'
import { navigateToUrl } from 'single-spa'
import * as singleSpa from 'single-spa';
import {nav} from './nav.config.js';
import { connect } from 'react-redux';


class SlideNav extends Component{
	
	constructor(props) {
		super(props);
	}

	componentDidMount(props) {
		nav.map(e => {
			e.children && e.children.map(
				k => {
					 location.hash.indexOf(k.url) != -1 ? this.props.dispatch({ type: 'CHANGE',value: k.index }):'';
				}
			)
		});
	}
	
	handleClick = (v) => {
		console.log('888');
		this.props.dispatch({ type: 'CHANGE',value: v });
	}

	render(){
		
		return (
			<ul className="menu">
				{
					nav && nav.map(e => {
						return (
							<li key={e.name}>
								<span className="menu-text"><span className="addicon"><i className="icon icon-menu-manage"></i></span>{e.name}</span>
								<ul className="menu-sub">
									{
										e.children && e.children.map(k => {
											return (
												<li key={k.url} onClick={() => {this.handleClick(k.index)}} className={this.props.index == k.index ? 'active' : ''}>
													<a href={k.url}  className='menu-sub-text'>{k.child}</a>
												</li>
											)
										})
									}
								</ul>	
							</li>
						)
					})
				}
			</ul>
		)
		
	}
} 

function mapStateToProps(state) {
	return {
		count: state.count,
		index:state.index,
	};
  }
export default connect(mapStateToProps)(SlideNav);