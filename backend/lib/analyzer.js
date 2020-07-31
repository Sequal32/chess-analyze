const uci = require('node-uci')

class Analyzer {
    constructor(stockfish_path) {
        this.engine = new uci.Engine('./stockfish.exe')
        this.engine.chain().init().setoption("Contempt", 0).exec()
    }

    analyze(fen, startDepth, callback) {
        this.engine.position(fen).then(() => {
            const emitter = this.engine.goInfinite({'depth': startDepth})
            emitter.on("data", (data) => {
                if (typeof data === undefined) return
                callback(data)
            })
        }, (msg) => {
            console.log("Failed to set position: " + msg)
        })
    }

    stop() {
        this.engine.stop()
    }

    quit() {
        this.engine.quit()
    }
}

module.exports = Analyzer