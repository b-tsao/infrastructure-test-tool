"use strict";

const express = require("express");
const HelloWorld = require("./requests/HelloWorld");
const pm = require("./requests/projectmanager");
const epm = require("./requests/eventprojectmanager");

const router = express.Router();

router.get("/heartbeat", HelloWorld);
router.get("/projects", pm.getProjects);
router.get("/project", pm.getProject);
router.post("/project", pm.createProject);
router.delete("/project", pm.deleteProject);
router.put("/project/file", pm.uploadFile);
router.delete("/project/file", pm.deleteFile);
router.post("/project/file/rename", pm.renameFile);

router.get("/event/projects", epm.subscribeProjects);
router.get("/event/project", epm.subscribeProject);

module.exports = router;
