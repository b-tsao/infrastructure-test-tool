import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  lighten,
  makeStyles,
  useTheme,
  withStyles
} from "@material-ui/core/styles";
import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  FirstPage as FirstPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage as LastPageIcon
} from "@material-ui/icons";

function descendingComparator(a, b, orderBy) {
  if (b.value[orderBy] < a.value[orderBy]) {
    return -1;
  }
  if (b.value[orderBy] > a.value[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

const CustomTableRow = withStyles({
  root: {
    // "&$selected": {
    //   backgroundColor: 'x',
    // },
    "&$hover:hover": {
      cursor: "pointer"
    }
  },
  selected: {},
  hover: {}
})(TableRow);

function CustomTableHead(props) {
  const {
    classes,
    checkable,
    columns,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort
  } = props;
  const createSortHandler = idx => event => {
    onRequestSort(event, idx);
  };

  return (
    <TableHead>
      <CustomTableRow>
        {checkable ? (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all desserts" }}
            />
          </TableCell>
        ) : null}
        {columns.map((column, idx) => (
          <TableCell
            key={column.field}
            align={column.align}
            padding={idx === 0 && checkable ? "none" : "default"}
            sortDirection={orderBy === idx ? order : false}
          >
            <TableSortLabel
              active={orderBy === idx}
              direction={orderBy === idx ? order : "asc"}
              onClick={createSortHandler(idx)}
            >
              {column.label}
              {orderBy === idx ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </CustomTableRow>
    </TableHead>
  );
}

CustomTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  title: {
    flex: "1 1 100%"
  },
  actions: {
    display: "flex"
  }
}));

const CustomTableToolbar = props => {
  const classes = useToolbarStyles();
  const { title, numSelected, actions } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle">
          {title}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <div className={classes.actions}>
          <Tooltip title="Filter list">
            <IconButton aria-label="filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          {actions}
        </div>
      )}
    </Toolbar>
  );
};

CustomTableToolbar.propTypes = {
  title: PropTypes.string,
  numSelected: PropTypes.number.isRequired,
  actions: PropTypes.arrayOf(PropTypes.object)
};

const usePaginationActionsStyles = makeStyles(theme => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5)
  }
}));

function CustomTablePaginationActions(props) {
  const classes = usePaginationActionsStyles();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = event => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = event => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = event => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

CustomTablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  paper: {
    width: "100%"
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  }
}));

export default function CustomTable(props) {
  const {
    title,
    columns,
    data,
    actions,
    checkable = false,
    selectable = true,
    onRowSelect = () => {},
    options = {},
    ...other
  } = props;

  const classes = useStyles();

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState(0);
  const [selected, setSelected] = React.useState({
    map: {},
    tail: { data: null, prev: null },
    length: 0
  });
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState({ data: [], empty: rowsPerPage });

  const handleRequestSort = (event, idx) => {
    const isAsc = orderBy === idx && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(idx);
  };

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      let tail = selected.tail;
      const map = data.reduce((map, el) => {
        if (!map.hasOwnProperty(el.id)) {
          tail = {
            data: el.id,
            prev: tail
          };
          map[el.id] = tail;
        }
        return map;
      }, selected.map);
      setSelected({ map, tail, length: data.length });
    } else {
      setSelected({ map: {}, tail: { data: null, prev: null }, length: 0 });
    }
  };

  const handleClick = (event, row) => {
    if (selectable) {
      if (selected.map.hasOwnProperty(row.id)) {
        setSelected(selected => {
          const sel = selected.map[row.id];
          sel.data = sel.prev.data;
          sel.prev = sel.prev.prev;
          delete selected.map[row.id];
          return {
            ...selected,
            length: selected.length - 1
          };
        });
      } else {
        setSelected(selected => {
          const tail = {
            data: row.id,
            prev: selected.tail
          };
          selected.map[row.id] = tail;
          return {
            ...selected,
            tail,
            length: selected.length + 1
          };
        });
        onRowSelect(row.value);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = id => selected.map.hasOwnProperty(id);

  React.useEffect(() => {
    const wrappedData = [];
    for (let i = 0; i < data.length; i++) {
      wrappedData.push({ id: i, value: data[i] });
    }

    let sortedData = stableSort(
      wrappedData,
      getComparator(order, columns[orderBy].field)
    );
    if (rowsPerPage > 0) {
      sortedData = sortedData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );
    }
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    setRows({ data: sortedData, empty: emptyRows });
  }, [data, page, rowsPerPage, order, orderBy]);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <CustomTableToolbar
          title={title}
          numSelected={selected.length}
          actions={actions}
        />
        <TableContainer
          style={{
            minHeight: options.minBodyHeight,
            maxHeight: options.maxBodyHeight
          }}
        >
          <Table
            stickyHeader
            aria-labelledby="tableTitle"
            aria-label="custom table"
          >
            <CustomTableHead
              classes={classes}
              checkable={checkable}
              columns={columns}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.data.length}
            />
            <TableBody>
              {rows.data.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `custom-table-checkbox-${index}`;

                return (
                  <CustomTableRow
                    hover={selectable}
                    onClick={event => handleClick(event, row)}
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                    {checkable ? (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((col, idx) => (
                      <TableCell
                        key={idx}
                        align={col.align}
                        padding={idx === 0 && checkable ? "none" : "default"}
                      >
                        {col.hasOwnProperty("lookup") &&
                        col.lookup.hasOwnProperty(row.value[col.field])
                          ? col.lookup[row.value[col.field]]
                          : row.value[col.field]}
                      </TableCell>
                    ))}
                  </CustomTableRow>
                );
              })}
              {rows.empty > 0 && (
                <CustomTableRow style={{ height: 53 * rows.empty }}>
                  <TableCell
                    colSpan={checkable ? columns.length + 1 : columns.length}
                  />
                </CustomTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Table>
          <TableFooter>
            <CustomTableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={CustomTablePaginationActions}
              />
            </CustomTableRow>
          </TableFooter>
        </Table>
      </Paper>
    </div>
  );
}

CustomTable.propTypes = {
  title: PropTypes.string,
  checkable: PropTypes.bool,
  selectable: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.arrayOf(PropTypes.object),
  onRowSelect: PropTypes.func,
  options: PropTypes.object
};
