import React, { Component } from 'react'
import Progress from 'react-bootstrap/ProgressBar'

export default class AnalysisPanel extends Component {
    render() {
        return (
            <div class="analyzer-info-parent">
                <div class="analyzer-top-div">
                    <h3><b>{this.props.analysis.score ?? '+0.0'}</b></h3>
                    <h6>Depth: {this.props.analysis.depth ?? '0'}</h6>
                    <h6>Nodes: {this.props.analysis.nodes ?? '0'}</h6>
                </div>
                <div class="analyzer-info-bar">
                    <Progress now={this.props.depthPercent}></Progress>
                </div>
                <div class="analyzer-info-div">
                    <p>{this.props.analysis.pv}</p>
                </div>
            </div>
        )
    }
}
