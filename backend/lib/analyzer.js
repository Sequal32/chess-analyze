const uci = require('node-uci')

class Analyzer {
    constructor(stockfish_path) {
        this.path = stockfish_path
        this.engine = new uci.Engine(this.path)
    }

    analyze(fen, callback) {
        this.engine.init()
            .then(engine => engine.isready())
            .then(engine => engine.setoption("Contempt", 0))
            .then(engine => engine.position(fen))
            .then(engine => engine.goInfinite())
            .then((emitter) => {
                var lastDepth = 0
                var lastData
                emitter.on("data", (data) => {
                    if (typeof data.score === "undefined") return
                    if (typeof lastData !== "undefined" && (data.depth != lastDepth))
                        callback(lastData)

                    lastDepth = data.depth
                    lastData = data
                })
            })
            .catch(console.log)
    }

    stop() {
        this.engine.stop()
    }

    quit() {
        this.engine.quit().then(() => console.log("Engine quit."), (err) => console.log(`Engine quit with errors: ${err}`))
    }
}

module.exports = Analyzer