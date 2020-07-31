const cors = require('cors')
const express = require('express')
const app = express()
const port = 5000

require('express-ws')(app);
app.use(cors())

const PositionsDatabase = new require('./lib/positionsDatabase')
const Analyzer = new require('./lib/analyzer')

var stockfish = null
const db = new PositionsDatabase("./data/positions.db")

app.get("/api/getposition", function(req, res) {
    db.getAnalysis(req.query.fen).then((analysis) => {
        if (typeof analysis == "undefined")
            res.status(500).send("FEN not analyzed.")
        else
            res.status(200).json(analysis)
    })
})

app.ws('/stockfish', function(ws, req) {
    ws.on('message', function(msg) {
        const data = JSON.parse(msg)
        switch (data.type) {
            case 'analyze':
                stockfish = new Analyzer("./stockfish.exe")
                // Know when to start recording data
                db.getDepth(data.fen).then(prevDepth => {
                    // Start stockfish
                    stockfish.analyze(data.fen, (info) => {
                        if (ws.readyState != 1) return
                        ws.send(JSON.stringify(info))
                        // Record data
                        if (info.depth > prevDepth)
                            db.writePosition(data.fen, info)
                    })
                })
                
                break;
            case 'stop':
                stockfish.quit()
                break;
        }
    })

    ws.on('close', function() {
        if (stockfish === null) return
        stockfish.quit()
        stockfish = null
    })
})

app.get("/", function(req, res) {
    res.status(200).send("OK")
})

app.listen(port, () => console.log(`Listening on port ${port}`))