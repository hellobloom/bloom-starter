import React from 'react'
import {RequestElement, Action} from '@bloomprotocol/share-kit-react'

import * as api from './api'
import {socketOn, socketOff, initSocketConnection} from './socket'

import './App.css'
import {IBaseAttIDDocData} from '@bloomprotocol/attestations-lib/dist/AttestationData'

type TImgState = {
  height: number
  width: number
  show: boolean
}

type AppState = {
  status: 'loading' | 'ready' | 'scanned'
  token: string
  email?: string
  phone?: string
  fullname?: string
  address?: string
  income?: string
  incomeLow?: string
  incomeHigh?: string
}

/**
 * Source: https://stackoverflow.com/a/14731922/1165441
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
 */
function calculateAspectRatioFit(imgEl: HTMLImageElement) {
  const srcHeight = imgEl.naturalHeight
  const srcWidth = imgEl.naturalWidth
  const maxWidth = 360
  const maxHeight = 480
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {width: srcWidth * ratio, height: srcHeight * ratio}
}

class App extends React.Component<{}, AppState> {
  readonly state: AppState = {
    status: 'loading',
    token: '',
  }

  private handleQRScan = (payload: {
    email: string
    phone: string
    fullname: string
    address: string
    income: string
    incomeLow: string
    incomeHigh: string
  }) => {
    this.setState(() => ({
      status: 'scanned',
      email: payload.email,
      phone: payload.phone,
      fullname: payload.fullname,
      address: payload.address,
      income: payload.income,
      incomeLow: payload.incomeLow,
      incomeHigh: payload.incomeHigh,
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
            types: ['email', 'full-name', 'address', 'phone', 'income'],
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
        Thank you for sharing, {this.state.fullname}! You told us your email is{' '}
        {this.state.email}, address is {this.state.address}, phone is{' '}
        {this.state.phone}, income is between {this.state.incomeLow} and{' '}
        {this.state.incomeHigh},
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
            fullname: result.receivedData.fullname,
            email: result.receivedData.email,
            phone: result.receivedData.phone,
            address: result.receivedData.address,
            income: result.receivedData.income,
            incomeLow: result.receivedData.incomeLow,
            incomeHigh: result.receivedData.incomeHigh,
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
        <h1 className="app__header">Welcome to Bloom Starter for NDI</h1>
        {this.state.status === 'loading' && this.renderLoading()}
        {this.state.status === 'ready' && this.renderReady()}
        {this.state.status === 'scanned' && this.renderScanned()}
      </div>
    )
  }
}

export default App
