import Chess from 'chess'
import React, { Component } from 'react'
import StockfishBoard from './StockfishBoard'
import AnalysisPanel from './AnalysisPanel'
import CanvasJSReact from '../canvasjs.react.js';
import Communicator from '../lib/Communicator'

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
        this.communicator.startAnalysis(newfen)
        this.game = new Chess(newfen)
    }

    processPgn = (newpgn) => {
        // Graph the data
        this.game = new Chess()
        this.game.load_pgn(newpgn)
        this.points = []

        this.setState({"startfen": this.game.fen(), "editpgn": newpgn})

        const graphGame = new Chess()
        var toAnalyze = [{"fen":defaultPosition}]

        this.game.history().forEach(async move => {
            const newMove = graphGame.move(move)
            toAnalyze.push({"fen": graphGame.fen(), "extra":newMove.san})
        })
        this.communicator.startGraph(toAnalyze)
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

    constructor(props) {
        super(props)

        this.communicator = new Communicator(new_url)
        this.communicator.events.on("analysis", (data) => this.setState({"analysis":data}))
        this.communicator.events.on("graph", this.analysisRecieved)
        this.communicator.events.on("progress", (percent) => this.setState({"depthPercent":percent}))

        this.state = {
            "editfen": defaultPosition, 
            "startfen": defaultPosition, 
            "analysis": {}
        }
    }
    
    render() {
        const options = {title: {"text": "Analysis"}, data: [{"type":"area", "dataPoints": this.state.gameData}]}
        return (
            <div class='parent'>
                <div class="grid-container" align="middle">
                    <h1 class="analyzer-header grid-top">Position Analyzer</h1>
                    <div class="grid-main square">
                        <StockfishBoard fen={this.state.startfen} onUpdate={this.processFEN}/>
                    </div>
                    <div class="grid-bottom">
                        <div align='left' class='input-yes'>
                            <label class="analyzer-input-label">FEN</label>
                            <input type="text" class='analyzer-input' onChange={this.fenChange} onBlur={this.focusLostFen} value={this.state.editfen}></input>
                        </div>
                        <div align='left' class='input-yes'>
                            <label class="analyzer-input-label">PGN</label>
                            <textarea type="text" class='analyzer-input' onChange={this.pgnChange} onBlur={this.focusLostPgn} value={this.state.editpgn}></textarea>
                        </div>
                    </div>
                    <div class="grid-right">
                        <AnalysisPanel analysis={this.state.analysis} depthPercent={this.state.depthPercent * 100}></AnalysisPanel>
                    </div>
                </div>
                <div class="chart" align="center">
                    <CanvasJSChart options = {options}/>
                </div>
            </div>
        )
    }
}
