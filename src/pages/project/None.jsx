import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column"
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2)
  }
}));

export default function None() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container component="main" className={classes.main} maxWidth="sm">
        <Typography variant="h2" component="h1" gutterBottom>
          404 Not found
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The requested project could not be found.
        </Typography>
        <Typography variant="body1">Check for typos.</Typography>
      </Container>
    </div>
  );
}
