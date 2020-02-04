import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Toolbar, Tooltip, Typography } from "@material-ui/core";
import {
  PlayCircleOutline as RunIcon,
  ChromeReaderModeOutlined as ConsoleIcon
} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1
  },
  logViewSelected: {
    backgroundColor: theme.palette.action.selected
  }
}));

export default function Actionbar(props) {
  const { className, handleAction, logViewSelected } = props;

  const classes = useStyles();

  return (
    <Toolbar className={className}>
      <Typography variant="h6" className={classes.title}>
        Project
      </Typography>
      <Tooltip title="Run" placement="top">
        <IconButton
          onClick={() => {
            handleAction("run");
          }}
          aria-label="Run"
        >
          <RunIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Logs" placement="top">
        <IconButton
          className={clsx({ [classes.logViewSelected]: logViewSelected })}
          onClick={() => {
            handleAction("logs");
          }}
          aria-label="Logs"
        >
          <ConsoleIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}
