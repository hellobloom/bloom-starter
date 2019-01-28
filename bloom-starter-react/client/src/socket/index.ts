type Callback = (data: any) => void;

type SocketHandlers = {
  [type: string]: Callback[];
};

let socket: WebSocket;

const host: string = (() => {
  let protocol: string, port: string;

  if (window.location.hostname === "localhost") {
    protocol = "ws";
    port = "8080";
  } else {
    protocol = "wss";
    port = "443";
  }

  return `${protocol}://${window.location.hostname}:${port}`;
})();

let socketHandlers: SocketHandlers = {};

const resetSocketConnection = () => {
  socket = new WebSocket(host);

  socket.onmessage = (e: MessageEvent) => {
    try {
      const decoded = JSON.parse(e.data);
      if (decoded instanceof Array) {
        const callbacks = socketHandlers[decoded[0]];
        if (callbacks) callbacks.forEach(callback => callback(decoded[1]));
      }
    } catch (e) {
      console.log("Error in websocket callback", e);
    }
  };

  socket.onclose = (e: Event) => {
    return;
  };
};

// Init websocket
resetSocketConnection();

setInterval(() => {
  if (!socket || socket.readyState !== 1) {
    if (socket) {
      socket.close();
    }
    resetSocketConnection();
  }
}, 10000);

const socketOn = (type: string, callback: Callback) => {
  if (typeof socketHandlers[type] === "undefined") {
    socketHandlers[type] = [];
  }

  socketHandlers[type].push(callback);
};

const socketOff = (type: string, callback?: Callback) => {
  if (typeof socketHandlers[type] === "undefined") return;
  if (socketHandlers[type].length <= 0) return;

  if (!callback) {
    socketHandlers[type].length = 0;
  } else {
    const index = socketHandlers[type].indexOf(callback);

    if (index >= 0) {
      socketHandlers[type].splice(index, 1);
    }
  }
};

export { resetSocketConnection, socketOn, socketOff };
