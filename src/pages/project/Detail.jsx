import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon
} from "@material-ui/icons";

import Sidebar from "./detail/Sidebar";
import Dashboard from "./detail/Dashboard";
import Delete from "./detail/Delete";
import Construction from "../Construction";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    width: 240
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(4)
  },
  delete: {
    backgroundColor: "rgba(203,36,49,.4)"
  }
}));

export default function Detail(props) {
  const { project, ...other } = props;

  const classes = useStyles();

  const { url } = useRouteMatch();
  
  const pages = [
    { title: "Dashboard", icon: <DashboardIcon />, href: `${url}` },
    { title: "Editor", icon: <EditIcon />, href: `${url}/edit` },
    { title: "Schedule", icon: <ScheduleIcon />, href: `${url}/schedule` },
    { title: "History", icon: <HistoryIcon />, href: `${url}/history` },
    {
      title: "Delete",
      icon: <DeleteIcon />,
      className: classes.delete,
      href: `${url}/delete`
    }
  ];

  return (
    <div className={classes.root}>
      <Sidebar
        className={classes.drawer}
        variant="permanent"
        open
        title={project.name}
        pages={pages}
      />
      <div className={classes.content}>
        <Switch>
          <Route path={`${url}/schedule`}>
            <Construction />
          </Route>
          <Route path={`${url}/history`}>
            <Construction />
          </Route>
          <Route path={`${url}/delete`}>
            <Delete project={project} />
          </Route>
          <Route path={`${url}`}>
            <Dashboard project={project} />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

Detail.propTypes = {
  project: PropTypes.object.isRequired
};
