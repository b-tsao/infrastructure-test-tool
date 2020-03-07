// server.js
// where your node app starts

"use strict";

// init project
const express = require("express");
const path = require("path");
const cors = require("cors");
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
const bodyParser = require("body-parser");

const http = require("http");
const router = require("./controllers/routes/index");
const IOServer = require("./controllers/IOServer");

// resources
const log4js = require("log4js");
log4js.configure("log4js.config.json");

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  const app = express();
  const logger = log4js.getLogger("server");

  // Allow cross-origin requests to be able to access our API from a react application with a different origin
  app.use(
    cors({
      origin: "*",
      optionsSuccessStatus: 200
    })
  );

  // Redirect HTTP to HTTPS,
  // app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  // Enable router to parse json and url-encoded payloads
  app.use(bodyParser.json({ limit: "2mb" }));
  app.use(bodyParser.urlencoded({ limit: "2mb", extended: false }));

  // Logging for each received request
  app.use((req, res, next) => {
    const path = `"${req.method} ${req.path}"`;
    const body =
      req.body.constructor === Object && Object.entries(req.body).length === 0
        ? false
        : JSON.stringify(req.body);
    const payload = body ? ` ${body.length} ${body}` : "";
    const log = `${req.ip} - ${path}${payload}`;
    log4js.getLogger("receive").info(log);
    next();
  });

  // Logging for each returned request
  app.use(log4js.connectLogger(log4js.getLogger("return"), { level: "info" }));

  // Serve static assets normally
  app.use(express.static(__dirname + "/public"));

  // Router setup
  app.use(router);

  // Handle every other route with index.html, which will contain a script tag to your application's JavaScript file(s).
  // This is the catch-all approach for rendering; redirecting to index.html for client-side rendering on routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  });

  const server = http.createServer(app);

  const sio = new IOServer(server);

  // Start the server
  server.listen(process.env.PORT, () => {
    logger.info("Your app is listening on port " + server.address().port);
  });

  return server;
}

startServer();
