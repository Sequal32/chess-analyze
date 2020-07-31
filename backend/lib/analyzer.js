const uci = require('node-uci')

class Analyzer {
    constructor(stockfish_path) {
        this.path = stockfish_path
        this.engine = new uci.Engine(this.path)
    }

    analyze(fen, startDepth, callback) {
        this.engine.init()
            .then(engine => engine.isready())
            .then(engine => engine.setoption("Contempt", 0))
            .then(engine => engine.position(fen))
            .then(engine => engine.goInfinite())
            .then((emitter) => {
                emitter.on("data", (data) => {
                    if (typeof data.score === "undefined") return
                    callback(data)
                })
            })
            .catch(console.log)
    }

    stop() {
        this.engine.stop()
    }

    quit() {
        this.engine.quit()
    }
}

module.exports = Analyzer