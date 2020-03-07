import React from "react";
import { useHistory } from "react-router-dom";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Container,
  Input,
  FormControl,
  FormHelperText,
  Typography
} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column"
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2)
  },
  margin: {
    margin: theme.spacing(1)
  },
  textField: {
    width: 450
  },
  button: {
    margin: theme.spacing(1),
    color: "#cb2431"
  }
}));

export default function Delete(props) {
  const { project } = props;

  const classes = useStyles();
  const history = useHistory();

  const [input, setInput] = React.useState("");

  const handleClick = () => {
    const req = new XMLHttpRequest();

    req.onreadystatechange = () => {
      // Call a function when the state changes.
      if (req.readyState === XMLHttpRequest.DONE) {
        // Request finished. Do processing here.
        history.push("/");
      }
    };

    req.open("DELETE", "/project");
    // Send the proper header information along with the request
    req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    req.send(JSON.stringify({ id: project.name }));
  };

  return (
    <div className={classes.root}>
      <Container component="main" className={classes.main} maxWidth="sm">
        <Typography variant="h2" component="h1" gutterBottom>
          Delete project
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Are you sure you want to delete this project?
        </Typography>
        <Typography variant="body1">
          Once you delete a project, it cannot be undone.
        </Typography>
        <FormControl
          className={clsx(classes.margin, classes.textField)}
          variant="filled"
        >
          <Input
            id="project-delete"
            value={input}
            onChange={e => {
              setInput(e.target.value);
            }}
          />
          <FormHelperText id="project-delete-helper">
            Please type the name of this project to confirm.
          </FormHelperText>
          <Button
            variant="contained"
            className={classes.button}
            disabled={input !== project.name}
            onClick={handleClick}
          >
            Delete this project
          </Button>
        </FormControl>
      </Container>
    </div>
  );
}
