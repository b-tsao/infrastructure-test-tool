import React from "react";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Snackbar } from "@material-ui/core";
import { CloudUpload as CloudUploadIcon } from "@material-ui/icons";

import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

function uploadFile(project, file, onEvent = () => {}) {
  const req = new XMLHttpRequest();

  const attachRequest = event => {
    onEvent(req, event);
  };

  req.upload.addEventListener("loadstart", attachRequest);
  req.upload.addEventListener("progress", attachRequest);
  req.upload.addEventListener("load", attachRequest);
  req.upload.addEventListener("error", attachRequest);
  req.upload.addEventListener("abort", attachRequest);
  req.upload.addEventListener("timeout", attachRequest);
  req.upload.addEventListener("loadend", attachRequest);

  /* loadend doesn't actually mean the request is "finished",
     (i.e req.readyState !== XMLHttpRequest.DONE) because the
     events above are only for the 'upload' request. At the same time,
     the current design doesn't allow for each individual uploads to
     display errors (if there are any), need to FIXME */
  req.addEventListener("load", attachRequest);

  const formData = new FormData();
  formData.append("project", project.name);
  formData.append("file", file, file.name);

  req.open("PUT", "/project/file");
  req.send(formData);
}

async function uploadFiles(project, files, onEvent = () => {}, cb = () => {}) {
  const promises = [];
  files.forEach(file => {
    promises.push(
      new Promise(resolve => {
        uploadFile(project, file, (req, event) => {
          if (event.type === "loadend") {
            resolve();
          } else {
            onEvent(file, req, event);
          }
        });
      })
    );
  });
  try {
    await Promise.all(promises);
    cb();
  } catch (e) {
    cb(e);
  }
}

export default function Upload(props) {
  const { className, project } = props;

  const classes = useStyles();

  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({});
  const [alert, setAlert] = React.useState({
    open: false,
    type: "",
    message: ""
  });

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: ["text/x-python-script", "text/javascript", ".py", ".js", ".jsx"],
    onDrop: files => {
      setUploading(true);
      const progress = {};
      uploadFiles(
        project,
        files,
        (file, request, event) => {
          let percentage = 0;
          switch (event.type) {
            case "progress":
              if (event.lengthComputable) {
                percentage = (event.loaded / event.total) * 100;
              }
              break;
            case "load":
              if (
                request.readyState === XMLHttpRequest.DONE &&
                request.status !== 201
              ) {
                setAlert({
                  open: true,
                  type: "error",
                  message: request.responseText
                });
              }
              percentage = 100;
              break;
            default:
              if (progress.hasOwnProperty(file.name)) {
                percentage = progress[file.name].percentage;
              }
              break;
          }
          progress[file.name] = {
            request,
            state: event.type,
            percentage
          };
          setUploadProgress(progress);
        },
        err => {
          setUploading(false);
        }
      );
    },
    noClick: true,
    noDrag: true,
    noKeyboard: true
  });

  const handleAlertClose = (event, reason) => {
    setAlert({ ...alert, open: false });
  };

  return (
    <React.Fragment>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alert.open}
      >
        <Alert onClose={handleAlertClose} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          startIcon={<CloudUploadIcon />}
          onClick={open}
          disabled={uploading}
        >
          Upload
        </Button>
      </div>
    </React.Fragment>
  );
}

Upload.propTypes = {
  project: PropTypes.object.isRequired
};
