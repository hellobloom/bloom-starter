# bloom-starter-react

> Bloom Starter written in React + Express

## Development

There are two parts to this app the server-side (express) and client-side (react).

### Install dependencies

```
yarn deps
```

### Start app (client and server)

```
yarn start
```

#### What does this do?

- Start the express server
- Start ngrok to proxy the express server
  - This is so the mobile app can POST share-kit data to the url
- Start the react app
  - The `REACT_APP_SERVER_URL` env var is set to the ngrok url.

### Build app (client and server)

This will build client and server code and output to the `build/` directory

```
yarn build
```
