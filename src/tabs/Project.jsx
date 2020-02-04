import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

import Resizeable from "../components/Resizeable";
import Actionbar from "./project/Actionbar";
import NestedList from "./project/NestedList";
import FileDetail from "./project/FileDetail";
import LogView from "./project/LogView";

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

export default function Project() {
  const classes = useStyles();

  const [logWidth, setLogWidth] = React.useState(320);
  const [logOpened, setLogOpened] = React.useState(false);

  const dummyStruct = [
    { dir1: ["file11", "file12"] },
    { dir2: [{ dir21: ["file221", "file222"] }, "file22"] },
    "file3",
    "file4",
    { dir5: [] }
  ];

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

  const handleFileClick = file => {
    console.log(file);
  };

  return (
    <div className={classes.root}>
      <Actionbar handleAction={handleAction} logViewSelected={logOpened} />
      <div className={classes.workspace}>
        <Grid container spacing={4} className={classes.root}>
          <Grid item xs={12} md={3} lg={3}>
            <NestedList
              files={dummyStruct}
              className={classes.list}
              onClick={handleFileClick}
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
