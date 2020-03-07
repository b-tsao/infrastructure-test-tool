import React from "react";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import { IconButton, Tooltip } from "@material-ui/core";

import { AddCircle as AddIcon } from "@material-ui/icons";

import CustomTable from "../components/CustomTable";

import { ClientContext } from "../Contexts";

const useStyles = makeStyles(theme => ({}));

export default function Home() {
  const client = React.useContext(ClientContext);

  const classes = useStyles();
  const history = useHistory();

  const [state, setState] = React.useState({
    columns: [
      { label: "Name", field: "name" },
      { label: "Errors", field: "errors", align: "right" },
      {
        label: "Status",
        field: "status",
        align: "right",
        lookup: { 0: "Success", 1: "Fail" }
      }
    ],
    data: []
  });

  React.useEffect(() => {
    // Retrieve projects using SSE (Server Sent Events)
    const eventSource = new EventSource("/event/projects");

    eventSource.addEventListener("message", event => {
      const data = JSON.parse(event.data);
      setState({ ...state, data });
    });

    return () => {
      eventSource.close();
    };
  }, []);

  //     React.useEffect(() => {
  //       // Retrieve projects using HTTP REST GET
  //       const req = new XMLHttpRequest();

  //       req.onreadystatechange = () => {
  //         // Call a function when the state changes.
  //         if (req.readyState === XMLHttpRequest.DONE) {
  //           // Request finished. Do processing here.
  //           setState({ ...state, data: req.response });
  //         }
  //       };

  //       req.responseType = "json";
  //       req.open("GET", "/projects");
  //       req.send();
  //     }, []);

  const addButton = (
    <Tooltip key="new-project" title="New project">
      <IconButton aria-label="new project" component={Link} to="/new">
        <AddIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <CustomTable
      title="Projects"
      options={{ maxBodyHeight: "calc(100vh - 181px)" }}
      columns={state.columns}
      data={state.data}
      actions={[addButton]}
      onRowSelect={row => {
        history.push("/project/" + row.name);
      }}
    />
  );
}
