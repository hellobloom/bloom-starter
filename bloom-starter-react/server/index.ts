import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compress from "compression";
import session from "express-session";
import uuid from "uuid";
import path from "path";
import http from "http";

import { applySocket, sendSocketMessage } from "./socket";
import { loggedInSession } from "./middleware";
import { env } from "./environment";

const sessionParser = session({
  saveUninitialized: false,
  secret: env.sessionSecret,
  resave: false
});

const app = express();

app.use(helmet());

app.use(sessionParser);

app.use(
  bodyParser.json({
    type: "*/*",
    verify: (req, _, buf) => {
      (req as any).rawBody = buf;
      return true;
    },
    limit: "10mb" // https://stackoverflow.com/a/19965089/1165441
  })
);

app.use(compress());

app.use(express.static(path.join(__dirname, "build/client")));

app.post("/login", (req, res) => {
  if (req.session!.userId === undefined) {
    const id = uuid.v4();
    req.session!.userId = id;
  }

  res.send({ result: "OK", message: "Session updated" });
});

app.delete("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(500).send({
          result: "ERROR",
          message: "Something went wrong while destroying session"
        });
      } else {
        res.send({ result: "OK", message: "Session destroyed" });
      }
    });
  }
});

app.get("/test", loggedInSession, async (req, res) => {
  try {
    await sendSocketMessage({
      userId: req.session!.userId,
      type: "share-kit-scan",
      payload: JSON.stringify({})
    });

    res.send({ result: "OK", message: "Message Sent" });
  } catch {
    res.status(500).send({
      result: "ERROR",
      message: "Something went wrong while sending message"
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build/client", "index.html"));
});

const server = http.createServer(app);

applySocket(server, sessionParser);

server.listen(env.port, () =>
  console.log(`Listening on http://localhost:${env.port}`)
);
