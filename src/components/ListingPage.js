import * as React from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableContainer,
  Typography,
  CircularProgress,
  TableRow,
  TableCell,
  Button,
  useMediaQuery,
} from "@mui/material";
import NoDataFoundIcon from "../assets/icon_noresults.png";

import useTable, { emptyRows } from "../hooks/useTable";
import TimesheetContext from "../contexts/TimesheetContext";
import {
  TableEmptyRows,
  TableHeadCustom,
  TableRowWithDelete,
} from "../components/table";

import SearchTableToolbar from "../sections/clients/SearchTableToolbar";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import useAxiosPrivate, { isValidResponse } from "../hooks/useAxiosPrivate";
import { displayError } from "../utils/handleErrors";
import useLocales from "../hooks/useLocales";

import Pagination from "@mui/material/Pagination";

import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";

import NoDataFound from "../components/NoDataFound";
import DeletePopUp from "./DeletePopUp";
import { anchorOrigin } from "../utils/constants";
import RegenrateFormDialog from "../sections/Invoicing/GenerateInvoice";
import useClient from "../hooks/useClient";
import PDFDialog from "../sections/Invoicing/SendEmailDialog";
import { debounce } from "lodash";
import AddFormModal from "./AddFormModal";
import EmpAddTimesheet from "../sections/TimeSheet/EmpAddTimesheet";
import ResponsivePagination from "../theme/ResponsivePagination";

ListingPage.propTypes = {
  timesheetPage: PropTypes.bool,
  invoicePage: PropTypes.bool,
};
export default function ListingPage({
  column = [],
  noDataMsgId,
  filterView,
  filterItems,
  fetchListAPI,
  deleteItemAPI,
  handleRowClick,
  handleRowEdit,
  refreshCount = 0,
  timesheetPage,
  invoicePage,
  regenerateInvoiceAPI,
  markAsPaidAPI,
  sendEmailAPI,
  screen,
  searchType,
  clientId,
  setRefreshCount,
  employeeId,
  clinetNameArr,
  weekWiseTimesheetPage,
  MissingTimesheetsPage,
  ListingPage,
  isManagerView,
  showApproveModal,
}) {
  const { page, order, orderBy, rowsPerPage, scrollToTop } = useTable();
  const pageSizeAPI = 100;

  const theme = useTheme();
  const styles = useStyles(theme);

  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const [isAddModel, setAddModel] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [isNoData, setNoData] = React.useState(false);

  const [isSearching, setSearching] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [apiPageDataMap, setAPIPageDataMap] = useState({});
  const [masterDataList, setMasterDataList] = useState([]);

  const [totalAPIResultCount, setTotalAPIResultCount] = useState(0);

  const [apiPageNumber, setAPIPageNumber] = useState(1);
  const [uiPageNumber, setUiPageNumber] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalFilterRecords, setTotalFilterRecords] = useState(0);

  const [filteredRows, setFilteredRows] = useState([]);
  const { selectedClient } = useClient();
  const [alocatedDataHrs, setAllocatedDataHrs] = useState([]);
  const [isRecall, setIsRecall] = useState(false);
  const onCloseAddModel = () => {
    setAddModel(false);
    fetchList();
  };
  const { pendingApprovalCount, isTimesheetApprover } =
    React.useContext(TimesheetContext);
  const isMobile = useMediaQuery("(max-width:600px)");
  const CustomerList = {
    count: 10,
    next: "",
    previous: null,
    results: [
      {
        customer_name: "John Doe Corporation",
        customer_email: "johndoe@example.com",
        associated_clients: [
          {
            client_id: 101,
            client_name: "Acme Inc.",
          },
          {
            client_id: 102,
            client_name: "Global Tech Solutions",
          },
          {
            client_id: 103,
            client_name: "NextGen Innovations",
          },
        ],
      },
    ],
  };
  const fetchList = async () => {
    setLoading(true); // Set loading state to true before starting the fetch
    try {
      const resp = await fetchListAPI(axiosPrivate, 1, pageSizeAPI);
      if (isValidResponse(resp)) {
        if (screen === "customer") {
          setTotalAPIResultCount(CustomerList.count);
          setMasterDataList(CustomerList.results);

          const renderChunk = CustomerList.results.slice(0, 10);
          setFilteredRows(renderChunk);
        } else {
          setTotalAPIResultCount(resp.data.count);
          setMasterDataList(resp.data.results);
          console.log("called");
          const renderChunk = resp.data.results.slice(0, 10);
          setFilteredRows(renderChunk);
        }
      } else {
        onError(translate("error.fetch"));
      }
    } catch (error) {
      onError(translate("error.fetch"));
    } finally {
      setLoading(false); // Set loading state to false after the fetch is complete
    }
  };
  useEffect(() => {
    fetchList();
  }, [refreshCount]);

  const onPageChange = async (event, page) => {
    const toBeApiPageNum = Math.ceil(page / 10);

    if (toBeApiPageNum != apiPageNumber) {
      setLoading(true);
      const resp = await fetchListAPI(
        axiosPrivate,
        toBeApiPageNum,
        pageSizeAPI
      );
      setLoading(false);
      setTotalAPIResultCount(resp.data.count);
      setMasterDataList(resp.data.results);
      setAPIPageNumber(toBeApiPageNum);
      setUiPageNumber(page);
      scrollToTop();
      const SI = ((page - 1) % 10) * 10;
      const EI = SI + 10;

      const renderChunk = resp.data.results.slice(SI, EI);
      setFilteredRows(renderChunk);
    } else {
      setUiPageNumber(page);
      scrollToTop();
      const SI = ((page - 1) % 10) * 10;
      const EI = SI + 10;
      const dataToPaginate = searchTerm
        ? masterDataList.filter((row) =>
            row.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : masterDataList;

      const renderChunk = dataToPaginate.slice(SI, EI);
      setFilteredRows(renderChunk);
    }
  };

  useEffect(() => {
    setTotalPages(Math.ceil(totalFilterRecords / rowsPerPage));
  }, [totalFilterRecords]);

  useEffect(() => {
    setNoData(totalAPIResultCount === 0);
  }, [totalAPIResultCount]);

  useEffect(() => {
    updateFilterData();
  }, [searchTerm, masterDataList, filterItems]);

  const handleDeleteRow = (deletedRow) => {
    onRowDeleted(deletedRow);
  };

  const debouncedSearch = React.useCallback(
    debounce(async (searchValue, searchType, clientId) => {
      // If the search input is cleared, show the full list
      if (!searchValue) {
        setFilteredRows(masterDataList.slice(0, rowsPerPage)); // Show the full list
        setTotalFilterRecords(masterDataList.length); // Reset count
        setUiPageNumber(1); // Reset pagination
        return;
      }

      // Prepare params for the API call
      const params = {
        search_query: searchValue,
        search_type: searchType,
      };

      // Conditionally add the client_id for types that require it
      if (searchType !== "client" && !clientId) {
        console.error("client_id is required for this search type");
        if (searchType === "timesheet") {
          console.log("timesheet manager Search");
        }
        //return; // Do not proceed without client_id
      } else if (clientId) {
        params.client_id = clientId;
      }
      // Perform the search via API
      try {
        const response = await axiosPrivate.get(`/auto-search/`, { params });

        const filteredList = response.data.results;
        setFilteredRows(filteredList.slice(0, rowsPerPage)); // Update rows with API response
        setTotalFilterRecords(filteredList.length); // Update count
        setUiPageNumber(1); // Reset pagination
      } catch (error) {
        enqueueSnackbar(
          "An error occurred during the search. Please try again.",
          { variant: "error", anchorOrigin }
        );
      }
    }, 300), // 300ms debounce delay
    [axiosPrivate, masterDataList, rowsPerPage, clientId] // Add dependencies used inside the callback
  );

  // Handle input changes and trigger debounce
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue); // Update the search term state
    debouncedSearch(searchValue, searchType, clientId); // Call the debounced function
  };

  const onError = (message) => {
    enqueueSnackbar("Listing - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  async function onRowDeleted(deletedRow) {
    let updatedAPIPageDataMap = [];
    Object.keys(apiPageDataMap).forEach((key) => {
      const rows = apiPageDataMap[key];
      const updatedRows = rows.filter((row) => row.uuid !== deletedRow.uuid);
      updatedAPIPageDataMap = [...updatedAPIPageDataMap, ([key] = updatedRows)];
    });
    setAPIPageDataMap(updatedAPIPageDataMap);
    updateMasterListData(updatedAPIPageDataMap);
    setTotalAPIResultCount((current) => current - 1);

    setFilteredRows(filteredRows.filter((row) => row.uuid !== deletedRow.uuid));
    setTotalFilterRecords((current) => current - 1);
  }

  async function updateFilterData() {
    const isFilterEnabled = hasFilterValues();

    if (!searchTerm && !isFilterEnabled) {
      applyTableData(masterDataList, totalAPIResultCount);
      return;
    }

    setSearching(true);

    let list = [];

    for (const dataItem of masterDataList) {
      let rowString = "";
      let hasSelectedByFilter = isFilterEnabled;
      let filterItemCount = 0;
      let filterMatchedCount = 0;
      for (const colItem of column) {
        const cellFormatValue = colItem?.format(dataItem);

        if (searchTerm) {
          rowString += cellFormatValue + "";
        }

        if (hasSelectedByFilter) {
          const filterValue = filterItems[colItem.id];
          if (filterValue && filterValue.length > 0) {
            filterItemCount += 1;
            if (filterValue.toLowerCase() === cellFormatValue?.toLowerCase()) {
              filterMatchedCount += 1;
            }
          }
        }
      }

      if (hasSelectedByFilter) {
        hasSelectedByFilter = filterItemCount === filterMatchedCount;
      }

      let canAddToResult = false;
      if (searchTerm) {
        if (
          (!isFilterEnabled || hasSelectedByFilter) &&
          rowString.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          canAddToResult = true;
        }
      } else if (hasSelectedByFilter) {
        canAddToResult = true;
      }

      if (canAddToResult) {
        list = [...list, dataItem];
      }
    }

    applyTableData(list, list.length);
    setSearching(false);
  }

  async function fetchListFromAPI(apiPage) {
    if (isLoading) return;

    setLoading(true);
    if (fetchListAPI) {
      try {
        const response = await fetchListAPI(axiosPrivate, apiPage, pageSizeAPI);

        if (isValidResponse(response)) {
          setTotalAPIResultCount(response.data.count);
          const newDataList = response.data.results
            ? response.data.results
            : response.data;
          const updatePageDataMap = apiPageDataMap;
          updatePageDataMap[apiPage] = newDataList;
          setAPIPageDataMap(updatePageDataMap);
          updateMasterListData(updatePageDataMap);
          // onError(translate("error.fetch"));
        } else {
          onError(translate("error.fetch"));
        }
      } catch (error) {
        console.log("Error in fetchListFromAPI ", error);
        onError(translate("error.fetch"));
      }
    }

    setLoading(false);
  }

  function updateMasterListData(updatePageDataMap) {
    let list = [];
    Object.keys(updatePageDataMap).forEach((key) => {
      const rows = updatePageDataMap[key];
      if (rows?.length > 0) {
        list = [...list, ...rows];
      }
    });
  }

  function applyTableData(tableDataToSet, tableDataCount, currentPage) {
    setTotalFilterRecords(tableDataCount);
  }

  function getTotalPaginationLabel() {
    return `Showing
    ${Math.min(totalFilterRecords, (uiPageNumber - 1) * rowsPerPage + 1)} to
    ${Math.min(
      totalFilterRecords,
      uiPageNumber * rowsPerPage
    )} of ${totalFilterRecords}
    results`;
  }

  function hasFilterValues() {
    let hasValue = false;

    if (filterItems) {
      Object.keys(filterItems).forEach((key) => {
        if (filterItems[key]?.length > 0) {
          hasValue = true;
        }
      });
    }

    return hasValue;
  }

  const ListingTableRow = ({
    row,
    columns,
    onEditRow,
    onItemClick,
    onDeleteRow,
  }) => {
    const [isDeletePopUp, setDeletePopUp] = React.useState(false);
    const [isRegeneratePopUp, setRegeneratePopUp] = React.useState(false);
    const [isSendEmailPopUp, setIsSendEmailPopUp] = React.useState(false);

    const onOpenDeletePopup = () => {
      setDeletePopUp(true);
    };

    const onCloseDeletePopup = () => {
      setDeletePopUp(false);
    };

    const handleDelete = () => {
      deleteItemRow();
    };

    //Renerate
    const onOpenRegeneratePopUp = () => {
      setRegeneratePopUp(true);
    };

    const onCloseRegeneratePopUp = () => {
      setRegeneratePopUp(false);
    };

    const handleRegenerate = (newData) => {
      generateInvoiceItemRow(newData);
    };

    //Email
    const onOpenEmailPopUp = () => {
      setIsSendEmailPopUp(true);
    };

    const onCloseSendEmailPopUp = () => {
      setIsSendEmailPopUp(false);
    };

    const handleSendEmailClick = (newData) => {
      console.log(newData);
      const formData = new FormData();
      if (newData.files) {
        formData.append("files", newData.files, "invoice.pdf"); // You can specify the file name
      }
      formData.append("client_id", selectedClient.uuid);
      formData.append("invoice_id", row.c2c_invoice_id);
      Object.keys(newData).forEach((key) => {
        if (key !== "files") {
          formData.append(key, newData[key]);
        }
      });
      SendItemEmail(formData);
    };

    //PAid
    const onHandlePaidClick = (payloadData) => {
      if (payloadData.c2c_invoice_status === "Active") {
        const payload = {
          client_id: selectedClient.uuid,
          invoice_id: payloadData.c2c_invoice_id,
          invoice_status: "Paid",
        };
        markAsPaidInvoiceItemRow(payload);
      } else {
        enqueueSnackbar(translate("message.alreadyPaid"), { anchorOrigin });
      }
    };

    //timesheetsubmit
    const onSubmitTimsheetClick = (row, isRecalled = false) => {
      if (isRecalled) {
        setIsRecall(true);
      }
      if (MissingTimesheetsPage) {
        setAllocatedDataHrs([
          {
            client_name: row.client_name,
            contract_sow_name: row.contract_sow_name,
            allocated_hours: row.allocated_hours,
            week_number: row.week_number,
            start_date: row.week_start_date,
            end_date: row.week_end_date,
          },
        ]);
      } else
        setAllocatedDataHrs([
          {
            client_name: row.client_name,
            contract_sow_name: row.contract_sow_name,
            allocated_hours: row.allocated_hours,
            week_number: row.week_number,
            start_date: row.start_date,
            end_date: row.end_date,
          },
        ]);
      openAddTimesheetModel();
    };

    const openAddTimesheetModel = () => {
      setAddModel(true);
    };

    async function generateInvoiceItemRow(payload) {
      if (regenerateInvoiceAPI) {
        try {
          const response = await regenerateInvoiceAPI(
            axiosPrivate,
            row.c2c_invoice_id,
            payload
          );
          if (isValidResponse(response)) {
            onCloseRegeneratePopUp();
            enqueueSnackbar(translate("message.regenerate"), { anchorOrigin });
            fetchListFromAPI(apiPageNumber);
            fetchList();
          } else {
            displayError(enqueueSnackbar, {
              message: translate("error.RegenerateFail"),
              anchorOrigin,
            });
          }
        } catch (error) {
          displayError(enqueueSnackbar, error, {
            anchorOrigin,
          });
        }
      }
    }

    //Mark as paid
    async function markAsPaidInvoiceItemRow(payload) {
      if (markAsPaidAPI) {
        try {
          const response = await markAsPaidAPI(axiosPrivate, payload);
          if (isValidResponse(response)) {
            enqueueSnackbar(translate("message.markAsPaid"), { anchorOrigin });
            fetchListFromAPI(apiPageNumber);
            fetchList();
          } else {
            displayError(enqueueSnackbar, {
              message: translate("error.MarkAsPaidFailed"),
              anchorOrigin,
            });
          }
        } catch (error) {
          displayError(enqueueSnackbar, error, {
            anchorOrigin,
          });
        }
      }
    }

    //Send mail
    async function SendItemEmail(payload) {
      if (sendEmailAPI) {
        try {
          const response = await sendEmailAPI(axiosPrivate, payload);
          if (isValidResponse(response)) {
            onCloseSendEmailPopUp();
            enqueueSnackbar(translate("message.emailSent"), { anchorOrigin });
            fetchListFromAPI(apiPageNumber);
            fetchList();
          } else {
            displayError(enqueueSnackbar, {
              message: translate("error.sendEmailFailed"),
              anchorOrigin,
            });
          }
        } catch (error) {
          displayError(enqueueSnackbar, error, {
            anchorOrigin,
          });
          onCloseSendEmailPopUp();
        }
      }
    }

    async function deleteItemRow() {
      if (deleteItemAPI) {
        try {
          const response = await deleteItemAPI(
            axiosPrivate,
            row.uuid ?? row.id
          );
          if (isValidResponse(response)) {
            onDeleteRow(row);
            onCloseDeletePopup();

            enqueueSnackbar(translate("message.delete"), { anchorOrigin });
            setRefreshCount((current) => current + 1);
          } else {
            displayError(enqueueSnackbar, {
              message: translate("error.deleteFail"),
              anchorOrigin,
            });
          }
        } catch (error) {
          displayError(enqueueSnackbar, error, {
            anchorOrigin,
          });
        }
      }
    }

    return (
      <>
        <TableRowWithDelete
          row={row}
          columns={columns}
          onEditRow={onEditRow}
          onDeleteRow={onOpenDeletePopup}
          onItemClick={onItemClick}
          timesheetPage={timesheetPage}
          invoicePage={invoicePage}
          weekWiseTimesheetPage={weekWiseTimesheetPage}
          MissingTimesheetsPage={MissingTimesheetsPage}
          onRegenerateClick={onOpenRegeneratePopUp}
          onEmailClick={onOpenEmailPopUp}
          onSubmitTimsheetClick={onSubmitTimsheetClick}
          onPaidClick={onHandlePaidClick}
          screen={screen}
        />

        {isDeletePopUp && (
          <DeletePopUp onClose={onCloseDeletePopup} onDelete={handleDelete} />
        )}
        {isRegeneratePopUp && (
          <RegenrateFormDialog
            onClose={onCloseRegeneratePopUp}
            handleRegenerate={handleRegenerate}
            row={row}
          />
        )}
        {isSendEmailPopUp && (
          <PDFDialog
            onClose={onCloseSendEmailPopUp}
            handleSendEmailClick={handleSendEmailClick}
            row={row}
          />
        )}
      </>
    );
  };

  const SearchFilterHeader = () => {
    return (
      <Box sx={styles.searchBarContainer}>
        <Box sx={styles.searchInput}>
          <SearchTableToolbar
            searching={isSearching}
            searchQuery={searchTerm}
            onSearch={handleSearch}
          />
        </Box>

        {filterView}
      </Box>
    );
  };

  const ListingTable = () => {
    return (
      <Box>
        <Card sx={{ padding: "12px", marginTop: "15px" }}>
          <TableContainer>
            <Table>
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={column}
                rowCount={filteredRows?.length}
                sx={styles.TableHeadCustom}
              />

              <TableBody sx={{ cursor: "pointer" }}>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <ListingTableRow
                      key={row.uuid + "_" + index}
                      columns={column}
                      row={row}
                      onDeleteRow={handleDeleteRow}
                      onEditRow={() => handleRowEdit(row)}
                      onItemClick={() => handleRowClick(row)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={column.length} align="center">
                      <div style={styles.noDataContainer}>
                        <img
                          src={NoDataFoundIcon}
                          alt="No Data Found"
                          style={styles.noDataImage}
                        />
                        <div style={styles.noDataMessage}>
                          {MissingTimesheetsPage
                            ? "No data found"
                            : "No data found for your search query"}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                <TableEmptyRows
                  height={60}
                  emptyRows={emptyRows(page, rowsPerPage, filteredRows.length)}
                />
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={styles.bottomPaginationLabel}>
            <Typography variant="body2">{getTotalPaginationLabel()}</Typography>
            <ResponsivePagination
              variant="outlined"
              shape="rounded"
              page={uiPageNumber}
              count={totalPages}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 0 : 2}
              size={isMobile ? "small" : "medium"}
              onChange={onPageChange}
            />
          </Box>
        </Card>
      </Box>
    );
  };

  return (
    <>
      {isLoading ? (
        <Box sx={styles.loading}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isNoData ? (
            <NoDataFound msgId={noDataMsgId} />
          ) : (
            <>
              {isManagerView ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 1,
                    width: "100%",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <SearchFilterHeader />
                  </Box>
                  {isTimesheetApprover && (
                    <Button
                      variant="contained"
                      onClick={showApproveModal}
                      disabled={pendingApprovalCount === 0}
                    >
                      {translate(
                        `Approve Timesheets${
                          pendingApprovalCount
                            ? ` (${pendingApprovalCount})`
                            : ""
                        }`
                      )}
                    </Button>
                  )}
                </Box>
              ) : (
                <SearchFilterHeader />
              )}

              <ListingTable />
              {isAddModel && (
                <AddFormModal onClose={onCloseAddModel}>
                  <EmpAddTimesheet
                    alocatedDataHrs={alocatedDataHrs}
                    ongoingProjectArr={alocatedDataHrs}
                    employeeId={employeeId}
                    handleClose={onCloseAddModel}
                    clinetNameArr={clinetNameArr}
                    weekWiseTimesheetPage={weekWiseTimesheetPage}
                    isRecall={isRecall}
                    setIsRecall={setIsRecall}
                  />
                </AddFormModal>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

const useStyles = createStyles((theme) => ({
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
    marginTop: "-5%",
  },
  clientInput: {
    width: 170,
    backgroundColor: theme.palette.primary.contrastText,
    border: theme.palette.primary.contrastText,
    borderRadius: "12px",
  },
  searchInput: {
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: "12px",
    width: "40%",
  },
  TableHeadCustom: {
    margin: 0,
    width: 100,
    "&:hover": {
      backgroundColor: theme.palette.primary.contrastText,
    },
  },
  searchBarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  bottomPaginationLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mt: 2,
  },
  noDataContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
    marginTop: "90px",
  },
  noDataImage: {
    width: "100px",
    marginBottom: "10px",

    filter: "brightness(0) saturate(1000%) hue-rotate(0deg)",
  },
  noDataMessage: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "red",
  },
}));
