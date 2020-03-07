"use strict";

const fs = require("fs");
const rmdir = require("rimraf");
const path = require("path");
const uuid = require("uuid/v4");

const log4js = require("log4js");
const logger = log4js.getLogger("project-manager");

const PROJECTS_PATH = path.join("public", "projects");
const METADATA_FILE = "metadata.json";
const FILES_DIRECTORY = "files";

class ProjectManager {
  constructor() {
    this.emitter = {
      emit: () => {},
      listeners: () => {},
      on: () => {},
      removeAllListeners: () => {}
    };

    fs.mkdir(PROJECTS_PATH, err => {
      const absolutePath = path.join(process.cwd(), PROJECTS_PATH);
      if (err) {
        if (err.code == "EEXIST") {
          // ignore the error if the folder already exists
          logger.debug("[init]", "[skipped]", absolutePath);
        } else {
          logger.error("[init]", "[failed]", err.code, absolutePath);
          throw err;
        }
      } else {
        // successfully created folder
        logger.warn("[init]", "[created]", absolutePath);
      }

      // Read all projects metadata
      this.projects = {};
      fs.readdir(PROJECTS_PATH, (pserr, projects) => {
        if (pserr) throw pserr;
        projects.forEach(project => {
          const projectPath = path.join(PROJECTS_PATH, project);
          this._readProject(projectPath, (perr, projectContent) => {
            if (perr) {
              throw perr;
            }
            if (!projectContent.active) {
              logger.debug("[inactive]", projectContent.name, ";", projectPath);
              // For now every project that is deactivated on service start will be deleted
              this.deleteProject(projectPath, derr => {
                if (derr) throw derr;
              });
            } else {
              logger.debug("[load]", projectContent.name, ";", projectPath);
              this.projects[projectContent.name] = projectContent;
            }
          });
        });
      });
    });
  }

  _readProject(projectPath, cb = () => {}) {
    if (fs.lstatSync(projectPath).isDirectory()) {
      fs.readdir(projectPath, (perr, files) => {
        if (perr) return cb(perr);
        for (const file of files) {
          if (file === METADATA_FILE) {
            const filePath = path.join(projectPath, file);
            const stats = fs.statSync(filePath);
            fs.readFile(filePath, (ferr, content) => {
              if (ferr) return cb(ferr);
              const projectContent = JSON.parse(content);
              projectContent.path = projectPath;
              return cb(null, {
                ...projectContent,
                path: projectPath,
                createdTime: stats.birthtime,
                modifiedTime: stats.mtime
              });
            });
          }
        }
      });
    } else {
      return cb(new Error("Project '" + projectPath + "' not found."));
    }
  }

  _writeProject(projectPath, content, cb = () => {}) {
    const metadataPath = path.join(projectPath, METADATA_FILE);
    logger.debug("[write]", metadataPath, content);
    fs.writeFile(metadataPath, JSON.stringify(content), we => {
      if (we) {
        logger.error("[write]", we.message);
        return cb(we);
      }
      return cb();
    });
  }

  _fsMoveFile(oldFilePath, newFilePath, cb = () => {}) {
    fs.rename(oldFilePath, newFilePath, renameErr => {
      if (renameErr) {
        if (renameErr.code === "EXDEV") {
          // If rename doesn't work due to crossing partitions or using a virtual filesystem not supporting moving files, fallback to copy and delete
          fs.copyFile(
            oldFilePath,
            newFilePath,
            fs.constants.COPYFILE_EXCL,
            copyErr => {
              if (copyErr) {
                return cb(copyErr);
              }
              // Delete the old file
              fs.unlink(oldFilePath, delErr => {
                if (delErr) {
                  return cb(delErr);
                }
                return cb();
              });
            }
          );
        } else {
          return cb(renameErr);
        }
      } else {
        return cb();
      }
    });
  }

  _trim(s, c) {
    if (c === "]") c = "\\]";
    if (c === "\\") c = "\\\\";
    return s.replace(new RegExp("^[" + c + "]+|[" + c + "]+$", "g"), "");
  }

  _findFile(project, filePath, cb = () => {}) {
    const notFoundError = new Error(
      "Project '" + project.name + "' file '" + filePath + "' not found."
    );
    const corruptError = new Error(
      `Project '${project.name}' ${METADATA_FILE} file structure is corrupt`
    );

    const splitPath = this._trim(filePath, "/").split("/");
    let directory = project;
    for (let i = 0; i < splitPath.length - 1; i++) {
      const dirName = splitPath[i];
      if (!directory.files.hasOwnProperty(dirName)) {
        return cb(notFoundError);
      } else if (directory.files[dirName].hasOwnProperty("files")) {
        directory = directory.files[dirName];
      } else {
        return cb(corruptError);
      }
    }

    const fileName = splitPath[splitPath.length - 1];
    if (directory.files.hasOwnProperty(fileName)) {
      return cb(null, directory, directory.files[fileName]);
    } else {
      return cb(notFoundError);
    }
  }

  /**
   * Checks Searches through the filePath for empty directories and deletes them from the project file structure.
   * Deletes empty directories as a consequence of deleting an empty child directory.
   * @parm project project containing the directories to clean
   * @parm filePath file path of the directories to clean
   * @parm cb(err, emptyDir) returns the highest empty dir object deleted, else null if no directory is empty along the filePath
   **/
  _cleanPath(project, filePath, cb = () => {}) {
    const cleanPath = filePath.split("/");
    let dir = project;
    const stack = [dir];
    // If filePath ends with a dir, path would end with a '/' and last element of array would be empty, else filePath ends with a file
    for (let i = 0; i < cleanPath.length - 1; i++) {
      const dirName = cleanPath[i];
      if (
        dir.files.hasOwnProperty(dirName) &&
        dir.files[dirName].hasOwnProperty("files")
      ) {
        stack.push(dir.files[dirName]);
        dir = dir.files[dirName];
      } else {
        break;
      }
    }

    let emptyDirName = null;
    let emptyDir = null;
    while (stack.length > 0) {
      dir = stack.pop();
      if (emptyDirName != null) {
        emptyDir = dir.files[emptyDirName];
        delete dir.files[emptyDirName];
      }
      if (Object.keys(dir.files).length === 0) {
        emptyDirName = dir.name;
      } else {
        break;
      }
    }
    return cb(null, emptyDir);
  }

  _makePath(project, filePath, cb = () => {}) {
    const newPath = filePath.split("/");
    let dir = { path: "", files: project.files };
    for (let i = 0; i < newPath.length - 1; i++) {
      const dirName = newPath[i];
      if (!dir.files.hasOwnProperty(dirName)) {
        dir.files[dirName] = {
          name: dirName,
          path: `${dir.path}${dirName}/`,
          files: {}
        };
      }

      if (dir.files[dirName].hasOwnProperty("files")) {
        dir = dir.files[dirName];
      } else {
        return cb(new Error("EEXIST: file already exists, makePath"));
      }
    }

    return cb(null, dir);
  }

  subscribe(emitter) {
    this.emitter = emitter;
  }

  getProjects(cb = () => {}) {
    const projects = [];
    for (const name in this.projects) {
      const project = this.projects[name];
      projects.push({
        name: project.name,
        description: project.description,
        createdTime: project.createdTime,
        modifiedTime: project.modifiedTime,
        status: project.status,
        errors: project.errors
      });
    }
    return cb(null, projects);
  }

  getProject(name, cb = () => {}) {
    if (this.projects.hasOwnProperty(name)) {
      const project = this.projects[name];
      return cb(null, {
        name: project.name,
        description: project.description,
        createdTime: project.createdTime,
        modifiedTime: project.modifiedTime,
        status: project.status,
        errors: project.errors,
        files: project.files
      });
    } else {
      return cb(new Error("Project '" + name + "' not found."));
    }
  }

  createProject(options, cb = () => {}) {
    if (this.projects.hasOwnProperty(options.name)) {
      const err = new Error("Project '" + options.name + "' already exists.");
      logger.error("[create]", err.message);
      return cb(err);
    }
    const projectPath = path.join(PROJECTS_PATH, uuid());
    const projectFilesPath = path.join(projectPath, FILES_DIRECTORY);
    logger.debug("[create]", options.name, ";", projectPath);
    fs.mkdir(projectFilesPath, { recursive: true }, err => {
      if (err) {
        logger.error("[create]", err.message);
        return cb(err);
      }

      const metadata = {
        ...options,
        active: true,
        status: 0,
        errors: 0,
        files: {}
      };
      this._writeProject(projectPath, metadata, we => {
        if (we) {
          // cleanup project
          this.deleteProject(projectPath, de => {
            return cb(we); // return the error that happened during write
          });
        }
        this._readProject(projectPath, (pe, projectContent) => {
          if (pe) {
            return cb(pe);
          }
          this.projects[projectContent.name] = projectContent;

          this.emitter.emit("PROJECTS");

          return cb();
        });
      });
    });
  }

  deactivateProject(name, cb = () => {}) {
    if (!this.projects.hasOwnProperty(name)) {
      const err = new Error("Project '" + name + "' not found.");
      logger.error("[deactive]", err.message);
      return cb(err);
    }
    const project = this.projects[name];
    const projectPath = project.path;
    logger.debug("[deactivate]", name, ";", projectPath);
    project.active = false;
    this._writeProject(projectPath, project, err => {
      if (err) {
        return cb(err);
      }
      delete this.projects[name];

      this.emitter.emit("PROJECTS");
      this.emitter.emit(name);

      return cb();
    });
  }

  deleteProject(projectPath, cb = () => {}) {
    logger.debug("[delete]", projectPath);
    rmdir(projectPath, err => {
      if (err) {
        logger.error("[delete]", err.message);
        return cb(err);
      }

      return cb();
    });
  }

  reloadProject(name, cb = () => {}) {
    if (!this.projects.hasOwnProperty(name)) {
      const err = new Error("Project '" + name + "' not found.");
      logger.error("[reload]", err.message);
      return cb(err);
    }

    const projectPath = this.projects[name].path;
    logger.debug("[reload]", projectPath);
    this._readProject(projectPath, (rErr, projectContent) => {
      if (rErr) return cb(rErr);
      this.projects[name] = projectContent;
      // Get the filtered project
      this.getProject(name, (gErr, project) => {
        if (gErr) return cb(gErr);
        return cb(null, project);
      });
    });
  }

  renameProject(name, rename, cb = () => {}) {
    if (!this.projects.hasOwnProperty(name)) {
      const err = new Error("Project '" + name + "' not found.");
      logger.error("[rename]", err.message);
      return cb(err);
    } else if (this.projects.hasOwnProperty(rename)) {
      const err = new Error("Project '" + rename + "' already exists.");
      logger.error("[rename]", err.message);
      return cb(err);
    }

    const project = this.projects[name];
    const projectPath = project.path;
    logger.debug("[rename]", name + " -> " + rename, ";", projectPath);
    project.name = rename;
    this._writeProject(projectPath, project, err => {
      if (err) {
        return cb(err);
      }
      this.projects[rename] = project;
      delete this.projects[name];

      // Rewire all the emitter listeners
      const listeners = this.emitter.listeners(name);
      for (const listener of listeners) {
        this.emitter.on(rename, listener);
      }
      this.emitter.removeAllListeners(name);
      this.emitter.emit(rename);

      return cb();
    });
  }

  uploadFile(tmp, project, file, cb = () => {}) {
    if (!this.projects.hasOwnProperty(project)) {
      const err = new Error("Project '" + project + "' not found.");
      logger.error("[upload]", err.message);
      return cb(err);
    }
    const projectContent = this.projects[project];
    const projectPath = projectContent.path;
    const projectFilesPath = path.join(projectPath, FILES_DIRECTORY);
    const filePath = path.join(projectFilesPath, file);
    logger.debug("[upload]", project, ";", filePath);
    // Move the file from tmp dir to project files dir
    this._fsMoveFile(tmp, filePath, mvErr => {
      if (mvErr) {
        logger.error("[upload]", mvErr.message);
        return cb(mvErr);
      }
      projectContent.files[file] = {
        name: file,
        path: file,
        description: ""
      };
      this._writeProject(projectPath, projectContent, wErr => {
        if (wErr) {
          logger.error("[upload]", wErr.message);
          return cb(wErr);
        }

        this.emitter.emit(projectContent.name);
        return cb();
      });
    });
  }

  deleteFile(name, filePath, cb = () => {}) {
    if (!this.projects.hasOwnProperty(name)) {
      const err = new Error("Project '" + name + "' not found.");
      logger.error("[delete]", err.message);
      return cb(err);
    } else if (filePath == null || filePath.length === 0) {
      return cb();
    }
    const project = this.projects[name];
    const projectPath = project.path;
    const projectFilePath = path.join(
      projectPath,
      FILES_DIRECTORY,
      ...filePath.split("/")
    );
    logger.debug("[delete]", `${name}/${filePath}`, ";", projectFilePath);

    // Find the parent directory of the file and the file to delete in the file structure
    this._findFile(project, filePath, (err, directory, file) => {
      if (err) {
        logger.error("[delete]", err.message);
        return cb(err);
      }
      // Remove the file from file structure and write it
      delete directory.files[file.name];

      // Find highest level directory that is empty and remove it from file structure
      this._cleanPath(project, filePath, (cErr, emptyDir) => {
        const removeFilePath =
          emptyDir == null
            ? projectFilePath
            : path.join(
                projectPath,
                FILES_DIRECTORY,
                ...emptyDir.path.split("/")
              );

        this._writeProject(projectPath, project, wErr => {
          if (wErr) {
            logger.error("[delete]", wErr.message);
            return cb(wErr);
          }
          // Delete the file from the filesystem
          rmdir(removeFilePath, dErr => {
            if (dErr) {
              logger.error("[delete]", dErr.message);
              return cb(dErr);
            }
            this.emitter.emit(name);
            return cb();
          });
        });
      });
    });
  }

  renameFile(name, filePath, fileRepath, cb = () => {}) {
    if (!this.projects.hasOwnProperty(name)) {
      const err = new Error("Project '" + name + "' not found.");
      logger.error("[rename]", err.message);
      return cb(err);
    } else if (
      filePath == null ||
      fileRepath == null ||
      filePath.length === 0 ||
      fileRepath.length === 0
    ) {
      const err = new Error(
        "Project '" + name + "' file '" + filePath + "' -> '" + fileRepath + "'"
      );
      logger.error("[rename]", err.message);
      return cb(err);
    }

    // Trim off '/' and ensure file path only has one '/' per separator
    fileRepath = this._trim(fileRepath, "/").replace(
      new RegExp("/+", "g"),
      "/"
    );
    // Ensure directories end with a '/'
    if (filePath.endsWith("/")) {
      fileRepath += "/";
    }

    const project = this.projects[name];
    const projectPath = project.path;
    const projectFilePath = path.join(
      projectPath,
      FILES_DIRECTORY,
      ...filePath.split("/")
    );
    const newProjectFilePath = path.join(
      projectPath,
      FILES_DIRECTORY,
      ...fileRepath.split("/")
    );
    logger.debug(
      "[rename]",
      `${name}/${filePath}`,
      ";",
      projectFilePath + " -> " + newProjectFilePath
    );

    // Find the parent directory of the file and the file to rename in the file structure to ensure it exists first
    this._findFile(project, filePath, (fErr, directory, file) => {
      if (fErr) {
        logger.error("[rename]", fErr.message);
        return cb(fErr);
      }

      // Create the file system directory strucure of renamed file
      const sepIdx = newProjectFilePath.lastIndexOf(path.sep);
      const newFileName = newProjectFilePath.substring(sepIdx + 1);
      fs.mkdir(
        newProjectFilePath.substring(0, sepIdx),
        { recursive: true },
        mkErr => {
          if (mkErr) {
            logger.error("[rename]", mkErr.message);
            return cb(mkErr);
          }

          // Move the file in the file system
          this._fsMoveFile(projectFilePath, newProjectFilePath, mvErr => {
            if (mvErr) {
              logger.error("[rename]", mvErr.message);
              return cb(mvErr);
            }

            // Create the directory structure of the file to rename
            const trimmedPath = this._trim(fileRepath, "/");
            this._makePath(project, trimmedPath, (mErr, dir) => {
              if (mErr) {
                logger.error("[rename]", mErr.message);
                return cb(mErr);
              }
              const fileName = trimmedPath.substring(
                trimmedPath.lastIndexOf("/") + 1
              );
              if (dir.files.hasOwnProperty(fileName)) {
                const err = new Error(
                  "Project '" +
                    name +
                    "' file '" +
                    filePath +
                    "' -> '" +
                    fileRepath +
                    "': EEXIST, file already exists"
                );
                logger.error("[rename]", err.message);
                return cb(err);
              } else {
                dir.files[fileName] = file;
                delete directory.files[file.name];

                file.name = fileName;
                file.path = fileRepath;
                if (file.path.endsWith("/")) {
                  // If the file renamed is a directory, need to modify all the path of its children
                  const recurseRepath = dir => {
                    for (const f in dir.files) {
                      const child = dir.files[f];
                      const isDir = child.path.endsWith("/");
                      child.path = `${file.path}${child.name}`;
                      if (isDir) {
                        child.path += "/";
                        recurseRepath(child);
                      }
                    }
                  };

                  recurseRepath(file);
                }

                // Find highest level directory that is empty and remove it from file structure
                this._cleanPath(project, filePath, (cErr, emptyDir) => {
                  this._writeProject(projectPath, project, wErr => {
                    if (wErr) {
                      logger.error("[rename]", wErr.message);
                      return cb(wErr);
                    }

                    if (emptyDir != null) {
                      // Delete the directory from the filesystem
                      const emptyDirPath = path.join(
                        projectPath,
                        FILES_DIRECTORY,
                        ...emptyDir.path.split("/")
                      );
                      rmdir(emptyDirPath, dErr => {
                        if (dErr) {
                          logger.error("[rename]", dErr.message);
                          return cb(dErr);
                        }
                        this.emitter.emit(name);
                        return cb();
                      });
                    } else {
                      this.emitter.emit(name);
                      return cb();
                    }
                  });
                });
              }
            });
          });
        }
      );
    });
  }
}

module.exports = new ProjectManager();
