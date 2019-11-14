import React from 'react'
import {RequestElement, Action} from '@bloomprotocol/share-kit-react'

import * as api from './api'
import {socketOn, socketOff, initSocketConnection} from './socket'

import './App.css'

type AppState = {
  status: 'loading' | 'ready' | 'scanned'
  token: string
}

class App extends React.Component<{}, AppState> {
  readonly state: AppState = {
    status: 'loading',
    token: '',
  }

  private handleQRScan = (payload: {}) => {
    this.setState(() => ({
      status: 'scanned',
    }))
  }

  private renderLoading = () => <div>Loading...</div>

  private renderReady = () => {
    // When this is not set fall back to the current url.
    // Good for when the app is deployed and the server URL is the same as the client.
    const url = `${process.env.REACT_APP_SERVER_URL ||
      `${window.location.protocol}//${window.location.host}`}/scan`
    const buttonCallbackUrl = `${window.location.protocol}//${window.location.host}?token=${this.state.token}`

    return (
      <React.Fragment>
        <p className="app__description">Please scan the QR code to continue</p>
        <RequestElement
          {...{className: 'app__request-element-container'}}
          requestData={{
            action: Action.authentication,
            token: this.state.token,
            url: url,
            org_logo_url: 'https://bloom.co/favicon.png',
            org_name: 'Bloom Starter',
            org_usage_policy_url: 'https://bloom.co/legal/terms',
            org_privacy_policy_url: 'https://bloom.co/legal/privacy',
          }}
          buttonOptions={{callbackUrl: buttonCallbackUrl}}
          qrOptions={{size: 300}}
        />
      </React.Fragment>
    )
  }

  private renderScanned = () => (
    <React.Fragment>
      <div className="app__description">
        Thank you for sharing!  You successfully authenticated.</div>
    </React.Fragment>
  )

  private acquireSession = () => {
    api
      .session()
      .then(result => {
        initSocketConnection()
        socketOn('share-kit-scan', this.handleQRScan)
        this.setState(() => ({status: 'ready', token: result.token}))
      })
      .catch(() => {
        console.warn('Something went wrong while starting a session')
      })
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      api
        .getReceivedData(token)
        .then(result => {
          console.log('api.getReceivedData() result', result)
          this.setState(() => ({
            status: 'scanned',
          }))
        })
        .catch(() => this.acquireSession())
      return
    }

    this.acquireSession()
  }

  componentWillUnmount() {
    socketOff('share-kit-scan', this.handleQRScan)
  }

  render() {
    return (
      <div className="app">
        <h1 className="app__header">Welcome to Bloom Starter for Authentication</h1>
        {this.state.status === 'loading' && this.renderLoading()}
        {this.state.status === 'ready' && this.renderReady()}
        {this.state.status === 'scanned' && this.renderScanned()}
      </div>
    )
  }
}

export default App
