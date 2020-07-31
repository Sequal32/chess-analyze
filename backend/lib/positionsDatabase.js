const sqlite = require("sqlite3")

class PositionDatabase {
    constructor(filename) {
        this.db = new sqlite.Database(filename)
        this.db.run("CREATE TABLE IF NOT EXISTS positions ('depth' TINYINT, 'nodes' INT, 'score' FLOAT, 'pv' TEXT, 'fen' TINYTEXT PRIMARY KEY)")
    }

    getAnalysis(fen) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM positions WHERE fen=?", fen, (err, row) => {
                if (err) reject(err)
                resolve(row)
            })
        })
    }

    getDepth(fen) {
        return this.getAnalysis(fen).then((row) => {return row.depth}).catch(() => {
            return 0
        })
    }

    writePosition(fen, data) {
        this.db.run("INSERT OR REPLACE INTO positions VALUES (?, ?, ?, ?, ?)", data.depth, data.nodes, data.score.value/100, data.pv, fen)
    }
}

module.exports = PositionDatabase