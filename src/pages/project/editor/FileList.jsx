import React from "react";
import PropTypes from "prop-types";
import { useHistory, useRouteMatch } from "react-router-dom";
import clsx from "clsx";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import {
  Collapse,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  Edit as RenameIcon,
  ExpandLess,
  ExpandMore,
  MoreVert as MoreIcon
} from "@material-ui/icons";

import Upload from "./Upload";

const optionsStyles = makeStyles(theme => ({
  root: {
    textAlign: "center"
  }
}));

function Options(props) {
  const { project } = props;

  const classes = optionsStyles();

  return (
    <div className={classes.root}>
      <Upload project={project} />
    </div>
  );
}

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5"
  }
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "left"
    }}
    {...props}
  />
));

const StyledInput = withStyles(theme => ({
  root: {
    fontSize: "inherit",
    fontFamily: "inherit",
    fontWeight: "inherit",
    lineHeight: "inherit",
    letterSpacing: "inherit"
  }
}))(InputBase);

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%"
  },
  list: {
    overflow: "auto"
  },
  item: {
    "&:hover, &$expanded": {
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
  },
  expanded: {
    backgroundColor: theme.palette.action.hover
  },
  focus: {
    backgroundColor: theme.palette.action.hover + " !important"
  }
}));

export default function FileList(props) {
  const { className, project, selected } = props;

  const classes = useStyles();
  const theme = useTheme();

  const { url } = useRouteMatch();
  const history = useHistory();

  const editEl = React.useRef(null);

  const [dirState, setDirState] = React.useState({});
  const [anchorEl, setAnchorEl] = React.useState({});
  const [editFile, setEditFile] = React.useState(null);

  const closeOptions = () => {
    setAnchorEl({});
  };

  const handleRename = file => {
    const repath = editEl.current.value.replace(new RegExp("/+", "g"), "/");

    if (repath !== file.path) {
      const req = new XMLHttpRequest();

      req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE && req.status === 200) {
          history.replace(`${url}?path=${repath}`);
        }
      };

      req.open("POST", "/project/file/rename");
      // Send the proper header information along with the request
      req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
      req.send(JSON.stringify({ id: project.name, path: file.path, repath }));
    }
  };

  const closeEditFile = () => {
    handleRename(editFile);
    setEditFile(null);
  };

  const handleKeyDown = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      editEl.current.blur();
    }
  };

  const options = [
    {
      label: "Rename",
      icon: <RenameIcon fontSize="small" />,
      handleClick: file => {
        closeOptions();
        setEditFile(file);
      }
    },
    {
      label: "Delete",
      icon: <DeleteIcon fontSize="small" />,
      handleClick: file => {
        if (confirm(`Delete ${file.path}?`)) {
          const req = new XMLHttpRequest();

          req.onreadystatechange = () => {
            // Call a function when the state changes.
            if (req.readyState === XMLHttpRequest.DONE) {
              // Request finished. Do processing here.
              closeOptions();
            }
          };

          req.open("DELETE", "/project/file");
          // Send the proper header information along with the request
          req.setRequestHeader(
            "Content-Type",
            "application/json; charset=UTF-8"
          );
          req.send(JSON.stringify({ id: project.name, path: file.path }));
        }
      }
    }
  ];

  React.useEffect(() => {
    if (editFile != null) {
      editEl.current.focus();
    }
  }, [editFile]);

  React.useEffect(() => {
    let splitIdx = selected != null ? selected.lastIndexOf("/") : -1;
    const openDirs = {};
    while (splitIdx > 0) {
      const dir = selected.substring(0, splitIdx);
      openDirs[dir + "/"] = true;
      splitIdx = dir.lastIndexOf("/");
    }
    setDirState({ ...dirState, ...openDirs });
  }, [selected]);

  const generateListItems = (project, files, selected, level = 1) => {
    const listItems = [];
    for (const f in files) {
      const file = files[f];
      const isDir = file.path.endsWith("/");
      let callback;
      let expandIcon;
      let sublist;
      let selectedFile = false;
      if (isDir) {
        callback = () => {
          setDirState({ ...dirState, [file.path]: !dirState[file.path] });
        };
        expandIcon = (
          <div className={classes.expand}>
            {dirState[file.path] ? <ExpandLess /> : <ExpandMore />}
          </div>
        );
        sublist = (
          <Collapse
            key={file.name + "-collapse"}
            in={dirState[file.path]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {generateListItems(project, file.files, selected, level + 1)}
            </List>
          </Collapse>
        );
      } else {
        callback = () => {
          history.replace(`${url}?path=${file.path}`);
        };
        selectedFile = !isDir && selected === file.path;
      }

      listItems.push(
        <ListItem
          key={file.name}
          className={clsx(classes.item, {
            [classes.expanded]: Boolean(anchorEl[file.path])
          })}
          focusVisibleClassName={classes.focus}
          style={{ paddingLeft: theme.spacing(2 * level) }}
          selected={selectedFile}
          dense
          button
          onClick={callback}
          onDoubleClick={() => {
            setEditFile(file);
          }}
        >
          {editFile != null && editFile.path === file.path ? (
            <StyledInput
              inputRef={editEl}
              defaultValue={file.path}
              inputProps={{ "aria-label": "rename" }}
              onBlur={closeEditFile}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <ListItemText primary={file.name} />
          )}
          <ListItemSecondaryAction className={classes.action}>
            {expandIcon}
            <IconButton
              size="small"
              edge="end"
              aria-label="actions"
              className={clsx(classes.options, {
                [classes.selected]: selectedFile
              })}
              onClick={event => {
                setAnchorEl({ ...anchorEl, [file.path]: event.currentTarget });
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
            <StyledMenu
              id="customized-menu"
              anchorEl={anchorEl[file.path]}
              keepMounted
              open={Boolean(anchorEl[file.path])}
              onClose={closeOptions}
            >
              {options.map(option => (
                <MenuItem
                  key={option.label}
                  onClick={() => {
                    option.handleClick(file);
                  }}
                >
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </StyledMenu>
          </ListItemSecondaryAction>
        </ListItem>
      );
      if (sublist !== undefined) {
        listItems.push(sublist);
      }
    }
    return listItems;
  };

  return (
    <div className={classes.root}>
      <Options project={project} />
      <List
        component="nav"
        aria-labelledby="file-list"
        className={clsx(classes.list, className)}
      >
        {generateListItems(project, project.files, selected)}
      </List>
    </div>
  );
}

FileList.propTypes = {
  project: PropTypes.object.isRequired,
  selected: PropTypes.string
};
