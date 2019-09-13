import React from 'react'
import {RequestElement, Action} from '@bloomprotocol/share-kit-react'

import * as api from './api'
import {socketOn, socketOff, initSocketConnection} from './socket'

import './App.css'
import {IBaseAttIDDocData} from '@bloomprotocol/attestations-lib/dist/AttestationData'

type AppState = {
  status: 'loading' | 'ready' | 'scanned'
  token: string
  email?: string
  idDoc?: IBaseAttIDDocData
}

class App extends React.Component<{}, AppState> {
  readonly state: AppState = {status: 'loading', token: ''}

  private handleQRScan = (payload: {email: string; idDoc: IBaseAttIDDocData}) => {
    console.log(typeof payload.idDoc)
    this.setState(() => ({
      status: 'scanned',
      email: payload.email,
      idDoc: payload.idDoc,
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
            action: Action.attestation,
            token: this.state.token,
            url: url,
            org_logo_url: 'https://bloom.co/favicon.png',
            org_name: 'Bloom Starter',
            org_usage_policy_url: 'https://bloom.co/legal/terms',
            org_privacy_policy_url: 'https://bloom.co/legal/privacy',
            types: ['email', 'full-name', 'id-document', 'sanction-screen'],
          }}
          buttonCallbackUrl={buttonCallbackUrl}
          qrOptions={{size: 300}}
        />
      </React.Fragment>
    )
  }

  private renderIdDoc = (idDoc?: IBaseAttIDDocData): React.ReactNode => {
    if (!idDoc) {
      return (
        <span>
          unexpectedly missing{' '}
          <span role="img" aria-label="sweat-smile">
            😅
          </span>
          .
        </span>
      )
    }
    const {
      authentication_result,
      // biographic,
      // country,
      // date,
      name,
      facematch_result,
      images,
    } = idDoc
    const success = (
      <span role="img" aria-label="green-bg-white-checkmark">
        ✅
      </span>
    )
    const warning = (
      <span role="img" aria-label="warning-sign">
        ⚠️
      </span>
    )
    const unknown = (
      <span role="img" aria-label="red-question-mark">
        ❓
      </span>
    )
    const fail = (
      <span role="img" aria-label="red-cross-mark">
        ❌
      </span>
    )
    return (
      <div>
        <div>
          Authentication:{' '}
          {authentication_result === 'passed'
            ? success
            : authentication_result === 'failed'
            ? fail
            : warning}
        </div>
        <div>
          Facematch:{' '}
          {facematch_result && facematch_result.is_match ? success : warning}
        </div>
        <div>Name: {name ? name : unknown}</div>

        {images && (
          <div>
            <img
              src={`data:image/png;base64,${images.front}`}
              alt="front"
              height={300}
              width={500}
            />
            <img
              src={`data:image/png;base64,${images.back}`}
              alt="back"
              height={300}
              width={500}
            />
            <img
              src={`data:image/png;base64,${images.selfie}`}
              alt="selfie"
              height={500}
              width={360}
            />
          </div>
        )}
      </div>
    )
  }

  private renderScanned = () => (
    <React.Fragment>
      <div className="app__description">
        Thank you for sharing! You told us your email is {this.state.email} and your
        id doc is{this.renderIdDoc(this.state.idDoc)}
      </div>
    </React.Fragment>
  )

  private acquireSession = () => {
    api
      .session()
      .then(result => {
        console.log('api.session() result', result)
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
            email: result.receivedData.email,
            idDoc: result.receivedData.idDoc,
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
        <h1 className="app__header">Welcome to Bloom Starter for KYC</h1>
        {this.state.status === 'loading' && this.renderLoading()}
        {this.state.status === 'ready' && this.renderReady()}
        {this.state.status === 'scanned' && this.renderScanned()}
      </div>
    )
  }
}

export default App
