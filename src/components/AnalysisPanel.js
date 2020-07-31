import React, { Component } from 'react'

export default class AnalysisPanel extends Component {
    render() {
        return (
            <div class="analyzer-info-parent">
                <div class="analyzer-top-div">
                    <h3><b>{this.props.depth}</b></h3>
                </div>
                <div class="analyzer-info-div" align="left">
                    <p>{this.props.pv}</p>
                </div>
            </div>
        )
    }
}
