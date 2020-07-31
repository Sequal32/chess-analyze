const stockfish = require("stockfish");
const engine = stockfish();

engine.onmessage = function(msg) {
    console.log(msg);
  };
  
engine.postMessage("uci");