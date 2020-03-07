"use strict";

const EventEmitter = require("eventemitter3");
const emitter = new EventEmitter();

const pm = require("../../../models/projectmanager");
pm.subscribe(emitter);

const eventHeader = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive"
};

function subscribeProjects(req, res) {
  res.writeHead(200, eventHeader);

  const sendProjects = () => {
    pm.getProjects((err, projects) => {
      res.write(`data: ${JSON.stringify(projects)}\n\n`);
    });
  };

  sendProjects();
  emitter.on("PROJECTS", sendProjects);
  req.on("close", () => {
    emitter.removeListener("PROJECTS", sendProjects);
  });
}

function subscribeProject(req, res) {
  const id = req.query.id;

  const sendProject = () => {
    pm.getProject(id, (err, project) => {
      if (err) {
        res.end();
      } else {
        res.write(`data: ${JSON.stringify(project)}\n\n`);
      }
    });
  };

  // On first subscription get the project and return it if exists, else return 404
  pm.getProject(id, (err, project) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.writeHead(200, eventHeader);
      res.write(`data: ${JSON.stringify(project)}\n\n`);
    }
  });
  emitter.on(id, sendProject);
  req.on("close", () => {
    emitter.removeListener(id, sendProject);
  });
}

module.exports = {
  subscribeProjects,
  subscribeProject
};
