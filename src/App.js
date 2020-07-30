import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route} from "react-router-dom";

import Board from './components/Analyze'
import Welcome from './components/Welcome'

import 'bootstrap/dist/css/bootstrap.min.css'
import './stylesheet.css'

function App() {
  return (
    <Router>
        <div>
        <Route path="/" exact component={Welcome}/>
        <Route path="/analyze" exact component={Board}/>
        </div>
    </Router>
  );
}

export default App;
