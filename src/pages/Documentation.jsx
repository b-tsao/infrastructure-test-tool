import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

import {
  AppBar,
  Dialog,
  IconButton,
  Slide,
  Toolbar,
  Typography
} from "@material-ui/core";

import { Close as CloseIcon } from "@material-ui/icons";

import Construction from "./Construction";

const useStyles = makeStyles(theme => ({
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  }
}));

const Transition = React.forwardRef((props, ref) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Documentation(props) {
  const { dialog, open, onClose, ...other } = props;

  const classes = useStyles();

  const content = <Construction />;

  if (dialog) {
    return (
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
      >
        <AppBar position="relative" color="inherit">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Documentation
            </Typography>
          </Toolbar>
        </AppBar>
        {content}
      </Dialog>
    );
  } else {
    return content;
  }
}

Documentation.propTypes = {
  dialog: PropTypes.bool,
  open: (props, propName, componentName) => {
    if (
      props.dialog &&
      (props[propName] == undefined || typeof props[propName] != "boolean")
    ) {
      return new Error("Please provide an open boolean for dialog!");
    }
  },
  onClose: (props, propName, componentName) => {
    if (
      props.dialog &&
      (props[propName] == undefined || typeof props[propName] != "function")
    ) {
      return new Error("Please provide an onClose function for dialog!");
    }
  }
};
