import { paramCase } from "change-case";
import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// @mui
import {
  Box,
  Card,
  Table,
  Switch,
  Button,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from "@mui/material";
// routes
import { PATH_PAGE } from "../routes/paths";
// import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from "../hooks/useTable";
// components
import Page from "../components/Page";
import Iconify from "../components/Iconify";
import Scrollbar from "../components/Scrollbar";
import HeaderBreadcrumbs from "../components/HeaderBreadcrumbs";
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
} from "../components/table";
// sections
import { RoleTableToolbar, RoleTableRow } from "../sections/role/list";
import RoleAPI from "../services/RoleService";
import { displayError } from "../utils/handleErrors";
import { useSnackbar } from "notistack";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useMemo } from "react";
import { debounce } from "lodash";
import useLocales from "../hooks/useLocales";
import { anchorOrigin } from "../utils/constants";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "name", label: "Name", align: "left" },
  { id: "description", label: "Description", align: "left" },
  { id: "users", label: "Users", align: "center" },
  { id: "" },
];

const SEARCH_KEY = ["name", "description"];

// ----------------------------------------------------------------------

export default function RoleList() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const themeStretch = false;

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { translate } = useLocales();

  const axiosPrivate = useAxiosPrivate();

  const [tableData, setTableData] = useState([]);

  const [filterValue, setFilterValue] = useState("");

  // Load Role List
  useEffect(() => {
    const loadList = async () => {
      try {
        const response = await RoleAPI.RoleList(axiosPrivate);
        setTableData(response?.data?.results || []);
      } catch (error) {
        displayError(enqueueSnackbar, error, {anchorOrigin});
      }
    };
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (filterValue) => {
    setFilterValue(filterValue);
    setPage(0);
  };

  const handleFilterDebounce = useMemo(() => {
    return debounce(handleFilter, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      handleFilterDebounce.cancel();
    };
  });

  const handleDeleteRow = async (uuid) => {
    if (!window.confirm(translate("message.deleteconfirm"))) return;
    try {
      await RoleAPI.DeleteRole(axiosPrivate, uuid);
      const deleteRow = tableData.filter((row) => row.uuid !== uuid);
      setTableData(deleteRow);
      enqueueSnackbar(`${translate("role")} ${translate("message.delete")}`, {anchorOrigin});
    } catch (error) {
      displayError(enqueueSnackbar, error, {anchorOrigin});
    }
  };

  const handleEditRow = (uuid) => {
    navigate(PATH_PAGE.role.edit(paramCase(uuid)));
  };

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterValue,
  });

  const denseHeight = dense ? 52 : 72;

  const isNotFound = !dataFiltered.length && !!filterValue;

  return (
    <Page title={`${translate("role")}: ${translate("list")}`}>
      <Container maxWidth={themeStretch ? false : "lg"}>
        <HeaderBreadcrumbs
          heading={`${translate("role")} ${translate("list")}`}
          links={[
            { name: translate("dashboard"), href: PATH_PAGE.dashboard },
            { name: translate("roles") },
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_PAGE.role.new}
              startIcon={<Iconify icon={"eva:plus-fill"} />}
            >
              {`${translate("new")} ${translate("role")}`}
            </Button>
          }
        />

        <Card>
          <RoleTableToolbar
            filterValue={filterValue}
            onFilter={handleFilterDebounce}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: "relative" }}>
              <Table size={dense ? "small" : "medium"}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  onSort={onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <RoleTableRow
                        key={row.uuid}
                        row={row}
                        onDeleteRow={() => handleDeleteRow(row.uuid)}
                        onEditRow={() => handleEditRow(row.uuid)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: "relative" }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataFiltered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />

            <FormControlLabel
              control={<Switch checked={dense} onChange={onChangeDense} />}
              label="Dense"
              sx={{ px: 3, py: 1.5, top: 0, position: { md: "absolute" } }}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ tableData, comparator, filterValue }) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterValue) {
    tableData = tableData.filter((item) =>
      Object.keys(item).some((key) =>
        SEARCH_KEY.includes(key)
          ? item[key]
              .toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          : false
      )
    );
  }

  return tableData;
}
