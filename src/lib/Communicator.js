import events from 'events'

export default class Communicator {
    #ResponseTypes = {
        1:"analysis",
        2:"graph",
        3:"progress"    
    }

    constructor(url, apiUrl) {
        this.apiUrl = this.apiUrl
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.onMessage

        this.events = new events.EventEmitter()
    }

    onMessage(msg) {
        // Message structure {type: int, reqId: int, data: Object}
        const data = JSON.parse(msg)
        this.events.emit(this.ResponseTypes[data.number], data.data)
    }

    startAnalysis(fen, depth) {
        this.ws.send(JSON.stringify({
            fen:fen,
            type: 0
        }))
    }

    startGraph(fens) {
        this.ws.send(JSON.stringify({
            positions: fens,
            type: 1
        }))
    }
}