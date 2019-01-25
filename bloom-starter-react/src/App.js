import React, { Component } from "react";

import * as api from "./api";

import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <button onClick={() => api.ping()}>Ping</button>
        </header>
      </div>
    );
  }
}

export default App;
