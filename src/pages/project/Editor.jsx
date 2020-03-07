import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useHistory, useRouteMatch } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

import Resizeable from "../../components/Resizeable";
import ActionBar from "./editor/ActionBar";
import FileList from "./editor/FileList";
import FileDetail from "./editor/FileDetail";
import LogView from "./editor/LogView";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "calc(100vh - 64px)",
    margin: "inherit"
  },
  workspace: {
    display: "flex"
  },
  list: {
    width: "100%",
    height: "80%",
    maxWidth: 360,
    margin: "auto",
    backgroundColor: theme.palette.background.paper
  },
  fileDetail: {
    width: "100%",
    margin: "auto"
  },
  logView: {
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  logViewOpen: {
    width: 320,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  logViewClose: {
    overflowX: "hidden",
    width: 0,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  }
}));

export default function Editor(props) {
  const { project, path, ...other } = props;

  const { url } = useRouteMatch();
  const classes = useStyles();
  const history = useHistory();

  // Console/log view
  const [logWidth, setLogWidth] = React.useState(320);
  const [logOpened, setLogOpened] = React.useState(false);

  const handleAction = action => {
    switch (action) {
      case "logs":
        setLogOpened(!logOpened);
        break;
      default:
    }
  };

  const handleResize = width => {
    setLogWidth(width);
  };

  // File structure
  const [files, setFiles] = React.useState([]);

  //   const dummyFiles = [
  //     {
  //       name: "dir1",
  //       path: "dir1",
  //       type: "DIRECTORY",
  //       files: [
  //         { name: "file11", path: "dir1/file11", type: "FILE" },
  //         { name: "file12", path: "dir1/file12", type: "FILE" }
  //       ]
  //     },
  //     {
  //       name: "dir2",
  //       path: "dir2",
  //       type: "DIRECTORY",
  //       files: [
  //         {
  //           name: "dir21",
  //           path: "dir2/dir21",
  //           type: "DIRECTORY",
  //           files: [
  //             { name: "file221", path: "dir2/dir21/file221", type: "FILE" },
  //             { name: "file222", path: "dir2/dir21/file222", type: "FILE" }
  //           ]
  //         },
  //         { name: "file22", path: "dir2/file22", type: "FILE" }
  //       ]
  //     },
  //     { name: "file3", path: "file3", type: "FILE" },
  //     { name: "file4", path: "file4", type: "FILE" },
  //     { name: "dir5", path: "dir5", type: "DIRECTORY", files: [] }
  //   ];

  //   project.files = dummyFiles;

  return (
    <div className={classes.root}>
      <ActionBar
        title={project.name}
        handleAction={handleAction}
        logViewSelected={logOpened}
      />
      <div className={classes.workspace}>
        <Grid container spacing={4} className={classes.root}>
          <Grid item xs={12} md={3} lg={3}>
            <FileList
              className={classes.list}
              project={project}
              selected={path}
            />
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            <FileDetail />
          </Grid>
        </Grid>
        <Resizeable
          className={clsx(classes.logView, {
            [classes.logViewOpen]: logOpened,
            [classes.logViewClose]: !logOpened
          })}
          style={{ width: logOpened ? logWidth : 0 }}
          left
          onResize={handleResize}
        >
          <LogView />
        </Resizeable>
      </div>
    </div>
  );
}

Editor.propTypes = {
  project: PropTypes.object.isRequired,
  path: PropTypes.string
};
