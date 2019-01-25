import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compress from "compression";
import path from "path";

const app = express();

app.use(helmet());

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

app.get("/ping", function(req, res) {
  return res.json({ response: "pong" });
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 8080);
