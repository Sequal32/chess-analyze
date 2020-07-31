const cors = require('cors')
const express = require('express')
const queue = require('queue')
const app = express()
const port = 5000

require('express-ws')(app);
app.use(cors())
app.use(express.static('../public'))
app.use('/analyze', express.static('../public'))

const PositionsDatabase = new require('./lib/positionsDatabase')
const Analyzer = new require('./lib/analyzer')

const GRAPH_DEPTH = 25

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

async function graph(positions, cb) {
    var flip = true
    for (const fen of positions) {
        const previousAnalysis = await db.getAnalysis(fen)
        flip = !flip
        if (typeof previousAnalysis !== "undefined" && GRAPH_DEPTH <= previousAnalysis.depth) {
            cb(previousAnalysis.score * (flip ? -1 : 1), fen)
        }
        else {
            const a = new Analyzer("./stockfish.exe")
            const info = await a.analyzeDepth(fen, GRAPH_DEPTH)
            db.writePosition(fen, info)

            if (info.isMate) return null

            cb(info.score * (flip ? -1 : 1), fen)
            a.quit()
        }
    }
}

var requestId = 0

app.ws('/stockfish', function(ws, req) {
    ws.on('message', function(msg) {
        const data = JSON.parse(msg)
        switch (data.type) {
            case 0:
                quitStockfish()
                stockfish = new Analyzer("./stockfish.exe")
                // Know when to start recording data
                db.getDepth(data.fen).then(prevDepth => {
                    // Start stockfish
                    id = requestId++
                    ws.send(JSON.stringify({"type": 1, "id":id}))

                    stockfish.analyze(data.fen, (info) => {
                        if (ws.readyState != 1) return
                        // Record data
                        if (info.depth > prevDepth) {
                            ws.send(JSON.stringify({"type": 2, "id":id, "analysis": info}))
                            db.writePosition(data.fen, info)
                        }
                        else
                            ws.send(JSON.stringify({"type": 3, "percent": info.depth/(prevDepth + 1)}))
                    })
                })
                
                break;
            case 1:
                graph(data.positions, (score,fen) => {
                    if (score == null) return
                    ws.send(JSON.stringify({"type":4, "score":score, "fen":fen}))
                }).then(console.log, console.log)
                break;
        }
    })

    ws.on('close', quitStockfish)
})

app.get("/", function(req, res) {
    res.status(200).send("OK")
})

app.listen(port, () => console.log(`Listening on port ${port}`))