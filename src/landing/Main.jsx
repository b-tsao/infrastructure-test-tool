import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import NavBar from "../components/NavBar";

import Home from "../tabs/Home";
import Project from "../tabs/Project";

import { MainDisplayContext } from "../Contexts";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden"
  }
}));

export default function Main() {
  const [mainDisplay, setMainDisplay] = React.useContext(MainDisplayContext);

  const classes = useStyles();

  const display = (() => {
    switch (mainDisplay) {
      case "Project":
        return <Project />;
      case "Home":
        return <Home />;
      default:
        return <Home />;
    }
  })();

  return (
    <div className={classes.root}>
      <NavBar onClick={setMainDisplay} />
      <main>{display}</main>
    </div>
  );
}
