import React, { Component } from 'react'
import Chessboard from 'chessboardjsx'
import WebSocket from 'ws'

export default class StockfishBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {"fen": props.startfen}
    }

    calculateBoardWidth(screen) {
        return parseFloat(screen.screenWidth) * 0.295
    }

    render() {
        return (
            <div>
                <Chessboard position={this.props.startfen} draggable="false" calcWidth = {this.calculateBoardWidth}></Chessboard>
            </div>
        )
    }
}
