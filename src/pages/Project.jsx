import React from "react";
import {
  Switch,
  Route,
  useParams,
  useLocation,
  useRouteMatch
} from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import Detail from "./project/Detail";
import Editor from "./project/Editor";
import Loading from "./project/Loading";
import None from "./project/None";

const useStyles = makeStyles(theme => ({}));

// React Router does not have any opinions about
// how you should parse URL query strings.
//
// If you use simple key=value query strings and
// you do not need to support IE 11, you can use
// the browser's built-in URLSearchParams API.
//
// If your query strings contain array or object
// syntax, you'll probably need to bring your own
// query parsing function.

// A custom hook that builds on useLocation to parse the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Project() {
  const { url } = useRouteMatch();
  const { id } = useParams(); // retrieve project id from path
  const query = useQuery();
  const path = query.get("path"); // retrieve file path from query

  const classes = useStyles();

  const [project, setProject] = React.useState();

  React.useEffect(() => {
    // Retrieve project using SSE (Server Sent Events)
    const eventSource = new EventSource(`/event/project?id=${id}`);

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);
      setProject(data);
    };

    eventSource.onopen = () => {
      console.log("Connected");
    };

    eventSource.onerror = err => {
      if (eventSource.readyState === 0) {
        console.log("Reconnecting...");
      } else if (eventSource.readyState === 2) {
        setProject(null);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  //   React.useEffect(() => {
  //     // Retrieve project using SSE (Server Sent Events)
  //     const req = new XMLHttpRequest();

  //     req.onreadystatechange = () => {
  //       // Call a function when the state changes.
  //       if (req.readyState === XMLHttpRequest.DONE) {
  //         // Request finished. Do processing here.
  //         if (req.status === 404) {
  //           setProject(null);
  //         } else {
  //           setProject(req.response);
  //         }
  //       }
  //     };

  //     req.responseType = "json";
  //     req.open("GET", `/project?id=${id}&path=${path}`);
  //     req.send();
  //   }, [id]);

  if (project === undefined) {
    return <Loading />;
  } else if (project === null) {
    return <None />;
  } else {
    return (
      <Switch>
        <Route path={`${url}/edit`}>
          <Editor project={project} path={path} />
        </Route>
        <Route path={`${url}`}>
          <Detail project={project} />
        </Route>
      </Switch>
    );
  }
}
