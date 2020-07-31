const uci = require('node-uci')

class Analyzer {
    constructor(stockfish_path) {
        this.path = stockfish_path
        this.engine = new uci.Engine(this.path)
    }

    transformScore(data) {
        data.isMate = data.score.unit == "mate"
        data.score = (data.score.value/100).toPrecision(2)
        return data
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
                    this.transformScore(data)
                    if (typeof lastData !== "undefined" && (data.depth != lastDepth))
                        callback(lastData)

                    lastDepth = data.depth
                    lastData = data
                })
            })
            .catch(console.log)
    }

    analyzeDepth(fen, depth) {
        return this.engine.chain().init().isready().setoption("Contempt", 0).position(fen).go({"depth":depth}).then((data) => {
            const info = data.info[data.info.length - 1]
            return this.transformScore(info)
        })
    }

    stop() {
        this.engine.stop()
    }

    quit() {
        this.engine.quit().then(() => console.log("Engine quit."), (err) => console.log(`Engine quit with errors: ${err}`))
    }
}

module.exports = Analyzer