import React, { Component } from 'react'
import Progress from 'react-bootstrap/ProgressBar'

export default class AnalysisPanel extends Component {
    render() {
        return (
            <div class="analyzer-info-parent">
                <div class="analyzer-top-div">
                    <h3><b>{this.props.analysis.score}</b></h3>
                    <h6>Depth: {this.props.analysis.depth}</h6>
                    <h6>Nodes: {this.props.analysis.nodes}</h6>
                </div>
                <div class="analyzer-info-bar">
                    <Progress now={this.props.depthPercent}></Progress>
                </div>
                <div class="analyzer-info-div" align="left">
                    <p>{this.props.analysis.pv}</p>
                </div>
            </div>
        )
    }
}
