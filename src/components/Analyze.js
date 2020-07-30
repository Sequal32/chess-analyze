import React, { Component } from 'react'
import Chessboard from 'chessboardjsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../stylesheet.css'

const defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export default class Board extends Component {
    processFEN = (input) => {
        this.setState({"fen":input.target.value, "editfen": this.state.editfen})
    }

    fenChange = (input) => {
        this.setState({"fen": this.state.fen, "editfen": input.target.value})
    }

    processPGN() {

    }

    constructor() {
        super()
        this.processFEN.bind(this)
        this.processPGN.bind(this)
        this.fenChange.bind(this)
    }
    
    state = {"fen": defaultPosition, "editfen": defaultPosition}
    
    render() {
        return (
            <div>
                <h1 class="analyzer-header">Position Analyzer</h1>
                <div class="board" align="middle">
                    <Chessboard position={this.state.fen}/>
                    <div align="middle">
                        <label class="analyzer-input-label">FEN</label>
                        <input type="text" class='analyzer-input' onChange={this.fenChange} onBlur={this.processFEN} value={this.state.editfen}></input>
                    </div>
                    <div align="middle">
                        <label class="analyzer-input-label">PGN</label>
                        <textarea type="text" class='analyzer-input'></textarea>
                    </div>
                </div>
            </div>
        )
    }
}
