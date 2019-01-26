import express from "express";
import http from "http";
import WebSocket from "ws";
import * as redis from "redis";

type WebSocketMap = {
  [userId: string]: WebSocket | undefined;
};

const sub = redis.createClient(process.env.REDIS_URL || "");

const webSockets: WebSocketMap = {};

export const applySocket = (
  server: http.Server,
  sessionParser: express.RequestHandler
) => {
  const wss = new WebSocket.Server({
    verifyClient: (info, done) => {
      console.log("Parsing session from request...");
      sessionParser(info.req as any, {} as any, () => {
        done((info.req as any).session.userId);
      });
    },
    server
  });

  wss.on("connection", (ws, req) => {
    const userId = (req as any).session.userId;

    if (!userId) {
      return ws.terminate();
    }

    webSockets[userId] = ws;
  });

  sub.on("message", (channel, encodedMessage) => {
    console.log(`Receiving Message: ${encodedMessage}`);
    if (channel !== "socket") return;

    const decoded = JSON.parse(encodedMessage);
    const socketForUser = webSockets[decoded.userId];

    if (socketForUser && socketForUser.readyState === WebSocket.OPEN) {
      socketForUser.send(JSON.stringify([decoded.type, decoded.payload]));
    }
  });
};
