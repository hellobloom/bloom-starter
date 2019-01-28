import React from "react";

import * as api from "./api";
import { socketOn, socketOff, resetSocketConnection } from "./socket";

import "./App.css";

type AppState = {
  status: "loading" | "ready";
};

class App extends React.Component<{}, AppState> {
  readonly state: AppState = { status: "loading" };

  private handleQRScan = () => {
    console.log("Scanned!");
  };

  private renderLoading = () => <div>Loading...</div>;
  private renderReady = () => (
    <div>
      Logged In!
      <button onClick={() => api.test()}>Test</button>
    </div>
  );

  componentDidMount() {
    api
      .login()
      .then(() => {
        resetSocketConnection();
        socketOn("share-kit-scan", this.handleQRScan);
        this.setState(() => ({ status: "ready" }));
      })
      .catch(() => {
        console.warn("Something went wrong while logging in");
      });
  }

  componentWillUnmount() {
    socketOff("share-kit-scan", this.handleQRScan);
  }

  render() {
    return (
      <div className="App">
        {this.state.status === "loading" && this.renderLoading()}
        {this.state.status === "ready" && this.renderReady()}
      </div>
    );
  }
}

export default App;
