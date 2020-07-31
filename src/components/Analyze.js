import React, { Component } from 'react'
import StockfishBoard from './StockfishBoard'
import AnalysisPanel from './AnalysisPanel'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../stylesheet.css'

const defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
const loc = window.location;
const new_url = loc.protocol === "https:" ? `wss://${loc.hostname}:5000/stockfish` : `ws://${loc.hostname}:5000/stockfish`
const api_url = loc.protocol === "https:" ? `https://${loc.hostname}:5000/api` : `http://${loc.hostname}:5000/api`

export default class Board extends Component {
    processFEN = (input) => {
        this.setState({"startfen": input.target.value})
        
        fetch(`${api_url}/getposition?fen=${encodeURIComponent(this.state.startfen)}`).then((response) => {
            if (response.ok) {
                this.setState({"analysis":response.json()})
            }
            else {
                this.setState({"analysis":{}})
            }
        })
        this.ws.send(JSON.stringify({"fen":this.state.startfen, "type":"analyze"}))
    }

    fenChange = (input) => {
        this.setState({"editfen": input.target.value})
    }

    processPGN() {

    }

    constructor(props) {
        super(props)

        this.ws = new WebSocket(new_url)
        this.ws.onmessage = (msg) => {
            this.setState({"analysis":JSON.parse(msg.data)})
        }

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
                    <AnalysisPanel depth={this.state.analysis.depth} pv={this.state.analysis.pv}></AnalysisPanel>
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
