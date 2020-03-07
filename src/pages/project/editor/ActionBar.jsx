import React from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@material-ui/core";
import {
  Dashboard as DashboardIcon,
  PlayCircleOutline as RunIcon,
  ChromeReaderModeOutlined as ConsoleIcon
} from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  spacer: {
    flexGrow: 1
  },
  title: {
    width: 200,
    textAlign: "center",
    padding: "0px 20px"
  },
  dashboard: {
    margin: theme.spacing(1)
  },
  logViewSelected: {
    backgroundColor: theme.palette.action.selected
  }
}));

export default function ActionBar(props) {
  const { className, title, handleAction, logViewSelected } = props;

  const classes = useStyles();
  const history = useHistory();

  const { url } = useRouteMatch();

  return (
    <Toolbar className={className}>
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
      </div>
      <Button
        variant="outlined"
        size="small"
        className={classes.dashboard}
        startIcon={<DashboardIcon />}
        onClick={() => {
          const dashboardUrl = url.slice(0, url.lastIndexOf("/edit"));
          history.push(dashboardUrl);
        }}
      >
        Dashboard
      </Button>
      <div className={classes.spacer} />
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
