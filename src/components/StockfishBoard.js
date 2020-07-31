import React, { Component } from 'react'
import Chessboard from 'chessboardjsx'
import WebSocket from 'ws'

export default class StockfishBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {"fen": props.startfen}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    render() {
        return (
            <div>
                <Chessboard position={this.props.startfen} draggable="false"></Chessboard>
            </div>
        )
    }
}
