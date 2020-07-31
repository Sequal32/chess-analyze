const express = require('express')
const app = express()
const port = 3000

require('express-ws')(app);

const PositionsDatabase = new require('./lib/positionsDatabase')
const Analyzer = new require('./lib/analyzer')

var stockfish = null
const db = new PositionsDatabase("./data/positions.db")

app.get("/api/getposition", function(req, res) {
    db.getAnalysis(req.params.fen).then((analysis) => {
        if (typeof analysis === undefined)
            res.status(500)
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
                const prevDepth = db.getDepth(data.fen)
                // Start stockfish
                stockfish.analyze(data.fen, prevDepth, (info) => {
                    ws.send(JSON.stringify(info))
                    console.log(info)
                    // Record data
                    db.writePosition(data.fen, info)
                })
                break;
            case 'stop':
                stockfish.quit()
                break;
        }
    })

    ws.on('close', function() {
        stockfish.quit()
    })
})

app.get("/", function(req, res) {
    res.status(200).send("OK")
})

app.listen(port, () => console.log(`Listening on port ${port}`))