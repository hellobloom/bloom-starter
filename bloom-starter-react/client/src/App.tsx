import React from "react";
import { RequestQRCode, Action } from "@bloomprotocol/share-kit";

import * as api from "./api";
import { socketOn, socketOff, initSocketConnection } from "./socket";

import "./App.css";

type AppState = {
  status: "loading" | "ready" | "scanned";
  token: string;
  name?: string;
};

class App extends React.Component<{}, AppState> {
  readonly state: AppState = { status: "loading", token: "" };

  private handleQRScan = (payload: { name: string }) => {
    this.setState(() => ({ status: "scanned", name: payload.name }));
  };

  private renderLoading = () => <div>Loading...</div>;
  private renderReady = () => {
    // When this is not set fall back to the current url.
    // Good for when the app is deployed and the server URL is the same as the client.
    const url = `${process.env.REACT_APP_SERVER_URL ||
      `${window.location.protocol}//${window.location.host}`}/scan`;

    return (
      <div>
        Please Scan To Login
        <RequestQRCode
          size={300}
          requestData={{
            action: Action.attestation,
            token: this.state.token,
            url: url,
            org_logo_url: "",
            org_name: "",
            org_usage_policy_url: "",
            org_privacy_policy_url: "",
            types: ["full-name"]
          }}
        />
      </div>
    );
  };
  private renderScanned = () => <div>Welcome, {this.state.name}!</div>;

  componentDidMount() {
    api
      .session()
      .then(result => {
        initSocketConnection();
        socketOn("share-kit-scan", this.handleQRScan);
        this.setState(() => ({ status: "ready", token: result.token }));
      })
      .catch(() => {
        console.warn("Something went wrong while starting a session");
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
        {this.state.status === "scanned" && this.renderScanned()}
      </div>
    );
  }
}

export default App;
