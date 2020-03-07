import React, { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import { Button } from "@material-ui/core";

import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from "@material-ui/icons";

import Documentation from "../pages/Documentation";

import { ThemeContext } from "../Contexts";

const useStyles = makeStyles(theme => ({}));

export default function ActionBar(props) {
  const [theme, toggleTheme] = React.useContext(ThemeContext);

  const classes = useStyles();

  const [destination, setDestination] = React.useState(null);
  const [documentation, setDocumentation] = React.useState(false);

  const openDocumentation = event => {
    if (event.ctrlKey || event.metaKey) {
      // Open in a new tab
      window.open("/doc", "_blank");
    } else {
      setDocumentation(true);
    }
  };

  const closeDocumentation = () => {
    setDocumentation(false);
  };

  const tabs = [
    <Button key="home" className={props.className} component={Link} to="/">
      Home
    </Button>,
    <Button
      key="documentation"
      className={props.className}
      onClick={openDocumentation}
    >
      Documentation
    </Button>
  ];

  return (
    <React.Fragment>
      {tabs}
      <Button className={props.className} onClick={toggleTheme}>
        {theme.palette.type === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </Button>
      <Documentation dialog open={documentation} onClose={closeDocumentation} />
    </React.Fragment>
  );
}

ActionBar.propTypes = {
  className: PropTypes.string
};
