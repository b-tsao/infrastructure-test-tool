"use strict";

const fs = require("fs");
const IncomingForm = require("formidable").IncomingForm;
const EventEmitter = require("eventemitter3");
const emitter = new EventEmitter();

const pm = require("../../../models/projectmanager");

function getProjects(req, res) {
  pm.getProjects((err, projects) => {
    if (err) {
      // this should never happen
      res.status(500).end();
    } else {
      res.status(200).json(projects);
    }
  });
}

function getProject(req, res) {
  pm.getProject(req.query.id, (err, project) => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      // TODO if path is not null retrieve file (path) details and return it as well
      const path = req.query.path;
      res.status(200).send(project);
    }
  });
}

function createProject(req, res) {
  pm.createProject(req.body, err => {
    // res.set("Content-Type", "text/plain");
    if (err) {
      res.status(409).send(err.message);
    } else {
      res.status(201).end();
    }
  });
}

function deleteProject(req, res) {
  pm.deactivateProject(req.body.id, err => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(204).end();
    }
  });
}

function uploadFile(req, res) {
  var form = new IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err });
    } else {
      const project = fields.project;
      const filePath = files.file["path"];
      const fileName = files.file["name"];

      pm.uploadFile(filePath, project, fileName, err => {
        if (err) {
          if (err.code === "EEXIST") {
            res.status(409).send("File '" + fileName + "' already exists.");
          } else {
            res.status(500).send(err.message);
          }
        } else {
          res.set("Content-Type", "text/plain");
          res.status(201).end();
        }
      });
    }
  });
}

function deleteFile(req, res) {
  pm.deleteFile(req.body.id, req.body.path, err => {
    if (err) {
      res.status(404).send(err.message);
    } else {
      res.status(204).end();
    }
  });
}

function renameFile(req, res) {
  const { id, path, repath } = req.body;
  pm.renameFile(id, path, repath, err => {
    if (err) {
      res.status(409).send(err.message);
    } else {
      res.status(200).end();
    }
  });
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  uploadFile,
  deleteFile,
  renameFile
};
