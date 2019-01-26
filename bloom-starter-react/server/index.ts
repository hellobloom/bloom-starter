import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compress from "compression";
import session from "express-session";
import uuid from "uuid";
import path from "path";
import http from "http";

import { applySocket } from "./socket/worker";
import { loggedInSession } from "./middleware";
import { sendSocketMessage } from "./socket/sender";

const sessionParser = session({
  saveUninitialized: false,
  secret: "$eCuRiTy",
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

app.use(express.static(path.join(__dirname, "build")));

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
  await sendSocketMessage({
    userId: req.session!.userId,
    type: "share-kit-scan",
    payload: JSON.stringify({})
  });

  res.send({ result: "OK", message: "Message Sent" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const server = http.createServer(app);

applySocket(server, sessionParser);

server.listen(process.env.PORT || 8080, () =>
  console.log(`Listening on http://localhost:${process.env.PORT || 8080}`)
);
