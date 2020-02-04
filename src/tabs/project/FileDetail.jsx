import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, TextField } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  description: {
    width: "100%",
    margin: "auto"
  }
}));

function DescriptionTextField(props) {
  const classes = useStyles();

  return (
    <TextField
      id="outlined-multiline-static"
      className={classes.description}
      label="Description"
      multiline
      rows="6"
      variant="outlined"
    />
  );
}

export default function FileDetail(props) {
  const { className } = props;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={12} lg={12}>
        <DescriptionTextField />
      </Grid>
      <Grid item xs={12} md={12} lg={12}></Grid>
    </Grid>
  );
}
