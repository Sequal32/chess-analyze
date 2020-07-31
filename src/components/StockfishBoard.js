import Chess from 'chess'
import React, { Component } from 'react'
import Chessboard from 'chessboardjsx'

export default class StockfishBoard extends Component {
    constructor(props) {
        super(props)
        this.state = {"fen": props.startfen}
        this.onDrop = this.onDrop.bind(this)
    }

    calculateBoardWidth(screen) {
        return parseFloat(screen.screenWidth) * 0.295
    }

    componentDidMount() {
        this.setState({"fen":this.props.fen})
    }

    onDrop(data) {
        const move = this.game.move({from: data.sourceSquare, to: data.targetSquare})
        if (move == null) return
        this.setState({"fen": this.game.fen()})

        this.props.onUpdate(this.state.fen)
    }

    componentDidUpdate(prevState, prevProps) {
        if (prevProps.fen !== this.props.fen) {
            this.setState({"fen":this.props.fen})
        }
    }

    render() {
        this.game = new Chess(this.state.fen)
        return (
            <div>
                <Chessboard position={this.state.fen} draggable="false" calcWidth = {this.calculateBoardWidth} onDrop = {this.onDrop}></Chessboard>
            </div>
        )
    }
}
