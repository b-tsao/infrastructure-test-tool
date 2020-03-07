import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Container,
  Grid,
  Snackbar,
  TextField,
  Typography
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    flex: "0 0 auto",
    padding: theme.spacing(1),
    alignItems: "center",
    "& > :not(:first-child)": {
      marginLeft: theme.spacing(1)
    }
  }
}));

export default function SignUp() {
  const classes = useStyles();
  const history = useHistory();

  const [project, setProject] = React.useState({ name: "", description: "" });
  const [alert, setAlert] = React.useState({
    open: false,
    type: "",
    message: ""
  });

  const handleSubmit = e => {
    e.preventDefault();

    setAlert({ ...alert, open: false });

    const req = new XMLHttpRequest();

    req.onreadystatechange = () => {
      // Call a function when the state changes.
      if (req.readyState === XMLHttpRequest.DONE) {
        // Request finished. Do processing here.
        if (req.status === 201) {
          history.push("/");
        } else {
          setAlert({ open: true, type: "error", message: req.response });
        }
      }
    };

    req.open("POST", "/project");
    // Send the proper header information along with the request
    req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    req.send(JSON.stringify(project));
  };

  const handleAlertClose = (event, reason) => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alert.open}
      >
        <Alert onClose={handleAlertClose} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          New project
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Project name"
                autoFocus
                onChange={event => {
                  setProject({ ...project, name: event.target.value });
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                id="description"
                label="Description (optional)"
                name="description"
                onChange={event => {
                  setProject({ ...project, description: event.target.value });
                }}
              />
            </Grid>
          </Grid>
          <div className={classes.buttons}>
            <Button
              onClick={e => {
                history.goBack();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={project.name.length === 0}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
