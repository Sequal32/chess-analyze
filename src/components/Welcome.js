import React, { Component } from 'react'

export default class Welcome extends Component {
    render() {
        function go() {
            window.location = '/analyze'
        }

        return (
            <div style={{position: 'absolute', left: '50%', top: '45%', transform: 'translate(-50%, -50%)', 'text-align':'center'}}>
                <h1>Chess Position Analyzer</h1>
                <button type='button' class='btn btn-primary' onClick={go}>Let's go on a chess adventure!</button>
            </div>
        )
    }
}
