import React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {},
  toolbar: theme.mixins.toolbar,
  title: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "fit-content"
  },
  name: {
    margin: theme.spacing(1)
  },
  active: {
    backgroundColor: theme.palette.action.selected
  }
}));

export default function Sidebar(props) {
  const { className, open, variant, title, pages, ...other } = props;

  const classes = useStyles();

  return (
    <Drawer
      className={clsx(classes.root, className)}
      classes={{
        paper: clsx(classes.root, className)
      }}
      variant={variant}
      open={open}
    >
      <div className={classes.toolbar} />
      <div className={classes.title}>
        <Typography className={classes.name} variant="h4">
          {title}
        </Typography>
      </div>
      <Divider />
      <List>
        {pages.map((page, index) => (
          <ListItem
            button
            key={page.title}
            className={page.className}
            component={NavLink}
            exact
            to={page.href}
            activeClassName={classes.active}
          >
            <ListItemIcon>
              {page.hasOwnProperty("icon") ? page.icon : <div />}
            </ListItemIcon>
            <ListItemText primary={page.title} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired,
  title: PropTypes.string,
  pages: PropTypes.arrayOf(PropTypes.object)
};
