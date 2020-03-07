import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, IconButton, Tooltip } from "@material-ui/core";
import { PlayCircleOutline as RunIcon } from "@material-ui/icons";

import CustomTable from "../../../components/CustomTable";

const useStyles = makeStyles(theme => ({}));

export default function Dashboard(props) {
  const { project, ...other } = props;

  const classes = useStyles();

  const [state, setState] = React.useState({
    columns: [
      { label: "Name", field: "name" },
      {
        label: "Status",
        field: "status",
        align: "right",
        lookup: { 0: "Success", 1: "Fail" }
      }
    ],
    data: []
  });

  const runButton = (
    <Tooltip key="run-all" title="Run all" placement="top">
      <IconButton aria-label="Run all">
        <RunIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={8}>
        <CustomTable
          title="Files"
          options={{ maxBodyHeight: "calc(100vh - 181px)" }}
          columns={state.columns}
          data={state.data}
          actions={[runButton]}
          onRowSelect={row => {}}
        />
      </Grid>
      <Grid item xs={12} md={4}></Grid>
    </Grid>
  );
}

Dashboard.propTypes = {
  project: PropTypes.object.isRequired
};
