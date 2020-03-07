import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import NavBar from "../navigation/NavBar";

import Home from "../pages/Home";
import Project from "../pages/Project";
import NewProject from "../pages/project/New";
import Documentation from "../pages/Documentation";
import Construction from "../pages/Construction";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden"
  }
}));

export default function Main() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Router>
        <NavBar />
        <main>
          <Switch>
            <Route path="/project/:id?">
              <Project />
            </Route>
            <Route path="/new">
              <NewProject />
            </Route>
            <Route path="/doc">
              <Documentation />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </main>
      </Router>
    </div>
  );
}
