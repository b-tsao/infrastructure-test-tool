import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import { AppBar, Button, Grid, Toolbar } from "@material-ui/core";

import ActionBar from "./ActionBar";

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: theme.zIndex.drawer + 1
  },
  title: {
    float: "left",
    width: "288.56px",
    height: "100px"
  },
  grow: {
    flexGrow: 1
  },
  titleGrid: {
    textAlign: "center"
  },
  itemsGrid: {
    margin: "auto",
    textAlign: "center",
    [theme.breakpoints.up("md")]: {
      textAlign: "right"
    }
  },
  menuItems: {
    fontSize: "20px",
    margin: "auto 4px",
    textTransform: "inherit",
    [theme.breakpoints.up("md")]: {
      fontSize: "24px"
    }
  }
}));

export default function NavBar(props) {
  const classes = useStyles();

  return (
    <AppBar className={classes.root} position="relative" color="inherit">
      <Toolbar>
        <Grid container>
          <Grid item xs={12} md={4} lg={4} className={classes.titleGrid}></Grid>
          <Grid item xs={12} md={8} lg={8} className={classes.itemsGrid}>
            <ActionBar className={classes.menuItems} />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
