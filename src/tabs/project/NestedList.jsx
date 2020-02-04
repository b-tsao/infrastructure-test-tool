import React from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Button,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from "@material-ui/core";
import {
  CloudUpload as CloudUploadIcon,
  ExpandLess,
  ExpandMore,
  MoreVert as MoreIcon
} from "@material-ui/icons";

const buttonStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1)
  }
}));

function Options(props) {
  const classes = buttonStyles();

  return (
    <div>
      <Button
        variant="contained"
        color="default"
        className={classes.button}
        startIcon={<CloudUploadIcon />}
      >
        Upload
      </Button>
    </div>
  );
}

const listStyles = makeStyles(theme => ({
  root: {
    height: "100%"
  },
  item: {
    "&:hover": {
      "& + $action $options": {
        display: "block"
      },
      "& + $action $expand": {
        display: "none"
      }
    }
  },
  action: {
    "&:hover $expand": {
      display: "none"
    }
  },
  options: {
    display: "none",
    "&:hover, &$selected": {
      display: "block"
    }
  },
  selected: {} /* Pseudo-class applied to the options element if `selected={true}`. */,
  expand: {
    display: "block"
  }
}));

function generateListItems(files, selected, handleClick, level = 1) {
  const classes = listStyles();
  const theme = useTheme();

  const listItems = [];
  for (const file of files) {
    if (typeof file === "string") {
      listItems.push(
        <ListItem
          key={file}
          className={classes.item}
          style={{ paddingLeft: theme.spacing(2 * level) }}
          button
          selected={selected === file}
          onClick={() => {
            handleClick(file);
          }}
        >
          <ListItemText primary={file} />
          <ListItemSecondaryAction className={classes.action}>
            <IconButton
              edge="end"
              aria-label="comments"
              className={clsx(classes.options, {
                [classes.selected]: selected === file
              })}
            >
              <MoreIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    } else {
      for (const dir in file) {
        const [open, setOpen] = React.useState(false);
        listItems.push(
          <ListItem
            key={dir}
            className={classes.item}
            style={{ paddingLeft: theme.spacing(2 * level) }}
            button
            onClick={() => {
              setOpen(!open);
              handleClick(file);
            }}
          >
            <ListItemText primary={dir} />
            <ListItemSecondaryAction className={classes.action}>
              <div className={classes.expand}>
                {open ? <ExpandLess /> : <ExpandMore />}
              </div>
              <IconButton
                edge="end"
                aria-label="comments"
                className={classes.options}
              >
                <MoreIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
        listItems.push(
          <Collapse
            key={dir + "-collapse"}
            in={open}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {generateListItems(file[dir], selected, handleClick, level + 1)}
            </List>
          </Collapse>
        );
      }
    }
  }
  return listItems;
}

export default function NestedList(props) {
  const { className, files, onClick } = props;

  const classes = listStyles();

  const [selected, setSelected] = React.useState(null);

  const handleClick = file => {
    if (typeof file === "string") {
      setSelected(file);
    }
    onClick(file);
  };

  return (
    <div className={classes.root}>
      <Options />
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={className}
      >
        {generateListItems(files, selected, handleClick)}
      </List>
    </div>
  );
}
