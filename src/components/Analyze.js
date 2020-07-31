import Chess from 'chess'
import React, { Component } from 'react'
import StockfishBoard from './StockfishBoard'
import AnalysisPanel from './AnalysisPanel'
import Alert from 'react-bootstrap/Alert'
import CanvasJSReact from '../canvasjs.react.js';

import 'bootstrap/dist/css/bootstrap.min.css'
import '../stylesheet.css'

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
const loc = window.location;
const new_url = loc.protocol === "https:" ? `wss://${loc.hostname}:5000/stockfish` : `ws://${loc.hostname}:5000/stockfish`
const api_url = loc.protocol === "https:" ? `https://${loc.hostname}:5000/api` : `http://${loc.hostname}:5000/api`

export default class Board extends Component {
    focusLostFen = (input) => {
        this.processFEN(input.target.value)
    }

    focusLostPgn = (input) => {
        this.processPgn(input.target.value)
    }

    fenChange = (input) => {
        this.setState({"editfen": input.target.value})
    }

    pgnChange = (input) => {
        this.setState({"editpgn": input.target.value})
    }

    processFEN = (newfen) => {
        this.setState({"startfen": newfen, "editfen": newfen})
        
        fetch(`${api_url}/getposition?fen=${encodeURIComponent(newfen)}`).then(response => response.json()).then(data => {
            if (data.status === 0) {
                this.analysisRecieved(data.data)
            }
            else {
                this.setState({"analysis":{}})
            }
        })
        this.ws.send(JSON.stringify({"fen":newfen, "type":0}))

        this.game = new Chess(newfen)
    }

    processPgn = (newpgn) => {
        // Graph the data
        this.game = new Chess()
        this.game.load_pgn(newpgn)
        this.points = []

        this.setState({"startfen": this.game.fen(), "editpgn": newpgn})

        const graphGame = new Chess()
        var toAnalyze = [defaultPosition]

        this.game.history().forEach(async move => {
            graphGame.move(move)
            toAnalyze.push(graphGame.fen())
        })
        this.ws.send(JSON.stringify({"type":1, "positions":toAnalyze}))
    }

    analysisRecieved(analysis) {
        var workingGame = new Chess(this.state.startfen)
        var san = analysis.pv.split(" ")
        
        san = san.map(element => {
            const move = workingGame.move(element, {"sloppy":true})
            if (move === null) return ""
            return move.san
        })

        analysis.pv = san.join(" ")

        var score = analysis.score
        score = score > 0 ? `+${score}` : score
        analysis.score = score

        this.setState({"analysis":analysis,})
    }

    // Websocket hooks
    onMessage = (msg) => {
        var data = JSON.parse(msg.data)
        switch (data.type) {
            case 1:
                this.listeningId = data.id
                break;
            case 2:
                if (this.listeningId === data.id)
                    this.analysisRecieved(data.analysis)
                break;
            case 3:
                this.setState({"depthPercent":data.percent})
                break;
            case 4: // Get score to graph
                this.points.push({"y": data.score})
                this.setState({"gameData":this.points, "startfen": data.fen})
        }
    }

    constructor(props) {
        super(props)

        this.ws = new WebSocket(new_url)
        this.ws.onmessage = this.onMessage

        this.state = {
            "editfen": defaultPosition, 
            "startfen": defaultPosition, 

            "analyzing": false,
            "analysis": {}
        }
    }
    
    render() {
        const options = {title: {"text": "Analysis"}, data: [{"type":"area", "dataPoints": this.state.gameData}]}
        return (
            <div>
                <h1 class="analyzer-header">Position Analyzer</h1>
                
                <div align="right">
                    <AnalysisPanel analysis={this.state.analysis} depthPercent={this.state.depthPercent * 100}></AnalysisPanel>
                </div>
                <div class="board" align="middle">
                    <StockfishBoard fen={this.state.startfen} onUpdate={this.processFEN}/>
                    <div align="middle">
                        <label class="analyzer-input-label">FEN</label>
                        <input type="text" class='analyzer-input' onChange={this.fenChange} onBlur={this.focusLostFen} value={this.state.editfen}></input>
                    </div>
                    <div align="middle">
                        <label class="analyzer-input-label">PGN</label>
                        <textarea type="text" class='analyzer-input' onChange={this.pgnChange} onBlur={this.focusLostPgn} value={this.state.editpgn}></textarea>
                    </div>
                </div>
                <div align="middle">
                <CanvasJSChart options = {options}/>
                </div>
            </div>
        )
    }
}
