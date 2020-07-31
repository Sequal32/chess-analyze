import Chess from 'chess'
import React, { Component } from 'react'
import StockfishBoard from './StockfishBoard'
import AnalysisPanel from './AnalysisPanel'
import util from 'util'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../stylesheet.css'

const defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
const loc = window.location;
const new_url = loc.protocol === "https:" ? `wss://${loc.hostname}:5000/stockfish` : `ws://${loc.hostname}:5000/stockfish`
const api_url = loc.protocol === "https:" ? `https://${loc.hostname}:5000/api` : `http://${loc.hostname}:5000/api`

export default class Board extends Component {
    processFEN = (input) => {
        const newfen = input.target.value

        this.setState({"startfen": newfen})
        
        fetch(`${api_url}/getposition?fen=${encodeURIComponent(newfen)}`).then((response) => {
            if (response.ok) {
                this.setState({"analysis":response.json()})
            }
            else {
                this.setState({"analysis":{}})
            }
        })
        this.ws.send(JSON.stringify({"fen":newfen, "type":"analyze"}))

        this.game = new Chess()
        this.game.load(newfen)
    }

    fenChange = (input) => {
        this.setState({"editfen": input.target.value})
    }

    processPGN(msg) {
        
    }

    analysisRecieved(msg) {
        var analysis = JSON.parse(msg.data)
        var san = analysis.pv.split(" ")
        
        san = san.map(element => {
            const move = this.game.move(element, {"sloppy":true})
            return move.san
        })

        analysis.pv = san.join(" ")

        var score = (analysis.score.value/100).toFixed(1)
        score = score > 0 ? `+${score}` : `-${score}`
        analysis.score = score

        this.game.load(this.state.startfen)
        this.setState({"analysis":analysis})
    }

    constructor(props) {
        super(props)

        this.ws = new WebSocket(new_url)
        this.ws.onmessage = (msg) => this.analysisRecieved(msg)
        this.game = null

        this.state = {
            "editfen": defaultPosition, 
            "startfen": defaultPosition, 

            "analyzing": false,
            "analysis": {}
        }
    }
    
    render() {
        return (
            <div>
                <h1 class="analyzer-header">Position Analyzer</h1>
                <div align="right">
                    <AnalysisPanel analysis={this.state.analysis}></AnalysisPanel>
                </div>
                <div class="board" align="middle">
                    <StockfishBoard startfen={this.state.startfen}/>
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
