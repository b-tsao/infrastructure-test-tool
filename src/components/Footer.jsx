import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Grid, Button, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  footer: {
    bottom: 0,
    position: "absolute",
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)"
  },
  footerCaption: {
    margin: "10px auto auto",
    textAlign: "center"
  },
  footerIcons: {
    flexGrow: 1,
    textAlign: "center",
    [theme.breakpoints.up("md")]: {
      textAlign: "left"
    }
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Grid container>
        <Grid item xs={12} md={6} lg={6} className={classes.footerCaption}>
          <Typography variant="subtitle1" color="textSecondary" component="p">
            Made by
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Brian Tsao
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} lg={6} className={classes.footerIcons}>
        </Grid>
      </Grid>
    </footer>
  );
}

