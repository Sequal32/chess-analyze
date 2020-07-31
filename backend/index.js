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
            res.status(200).json({'status': 1})
        else
            res.status(200).json({'status': 0, 'data': analysis})
    })
})

function quitStockfish() {
    if (stockfish === null) return
    stockfish.quit()
    stockfish = null
}
var analysisCurId = 0

app.ws('/stockfish', function(ws, req) {
    ws.on('message', function(msg) {
        const data = JSON.parse(msg)
        switch (data.type) {
            case 'analyze':
                quitStockfish()
                stockfish = new Analyzer("./stockfish.exe")
                // Know when to start recording data
                db.getDepth(data.fen).then(prevDepth => {
                    // Start stockfish
                    id = analysisCurId++
                    ws.send(JSON.stringify({"type": 1, "id":id}))

                    stockfish.analyze(data.fen, (info) => {
                        if (ws.readyState != 1) return
                        // Record data
                        if (info.depth > prevDepth)
                            ws.send(JSON.stringify({"type": 2, "id":id, "analysis": info}))
                            db.writePosition(data.fen, info)
                    })
                })
                
                break;
            case 'stop':
                stockfish.quit()
                break;
        }
    })

    ws.on('close', quitStockfish)
})

app.get("/", function(req, res) {
    res.status(200).send("OK")
})

app.listen(port, () => console.log(`Listening on port ${port}`))