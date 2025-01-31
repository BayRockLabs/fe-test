import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import { useLocation } from "react-router-dom";
import AllocationAPI from "../../services/AllocationService";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import { axiosPrivate } from "../../services/axios";
import { anchorOrigin } from "../../utils/constants";
import { useSnackbar } from "notistack";
import AddFormModal from "../../components/AddFormModal";
import AllocationForm from "./AllocationForm";
import { fDateMDY } from "../../utils/formatTime";
import Item from "../../common/Item";

export default function AllocationDetail() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { translate } = useLocales();
  const { state } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [isAddModel, setAddModel] = useState(false);
  const [allocationArray, setAllocationArray] = useState([]);
  const [resourceTableData, setResourceTableData] = useState([]);
  const [preSelectedResourceTableData, setPreSelectedResourceTableData] =
    useState([]);

  const [detailData, setDetailData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [oldResData, setOldResData] = useState([]);

  const allocationId = state?.uuid ?? "";
  useEffect(() => {
    getDetail();
  }, []);
  useEffect(() => {
    updatePageData();
  }, [detailData]);

  const onError = (message) => {
    enqueueSnackbar("AllocationDetail - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  async function updatePageData() {
    setAllocationArray([
      {
        id: "contractName",
        value: detailData ? detailData?.contractsow_name : "--",
      },

      {
        id: "Estimations.ESTIMATION_NAME",
        value: detailData ? detailData?.estimation_name : "--",
      },
      {
        id: "Allocation.NAME",
        value: detailData ? detailData?.name : "--",
      },
      {
        id: "Allocation.COUNT",
        value: detailData ? detailData?.allocations_count : "--",
      },
      {
        id: "Allocation.START_DATE",
        value: detailData ? detailData?.start_date : "--",
      },
      {
        id: "Allocation.END_DATE",
        value: detailData ? detailData?.end_date : "--",
      },
      {
        id: "Allocation.TOTAL_BILL_HRS",
        value: detailData ? detailData?.total_billable_hours : "--",
      },
      {
        id: "Allocation.APPROVER",
        value: detailData?.approver
          ? detailData.approver.map((item) => item.approver_name).join(", ")
          : "--",
      },
      // {
      //     id: "Allocation.TOTAL_CNT_HRS",
      //     value: detailData ?detailData?.total_cost_hours:"--",
      // },
    ]);
  }

  async function getDetail() {
    try {
      const response = await AllocationAPI.DETAIL(axiosPrivate, allocationId);
      if (isValidResponse(response)) {
        setDetailData(response?.data);
        setResourceTableData(response?.data?.resource_data);
        setPreSelectedResourceTableData(response?.data?.resource_data);
        setOldResData(response?.data?.resource_data);
      } else {
        onError(translate("error.fetch"));
      }
    } catch (error) {
      console.log("Error in C - ", error);
      onError(translate("error.fetch"));
    }
  }

  const navigateToAllocationModel = () => {
    setAddModel(true);
    setIsEditMode(true);
  };
  const onCloseAddModel = () => {
    getDetail();
    setAddModel(false);
  };
  const AllocationItem = ({ translateLabelId, value }) => {
    return (
      <Item sx={{ alignItems: "baseline" }}>
        <Typography
          className="text-base text-gray-900_02 w-auto"
          size="txtInterBold16"
          variant="body1"
        >
          {translate(translateLabelId)}
        </Typography>
        <Typography
          className="text-base text-dark w-auto"
          size="txtInterBold16"
          variant="subtitle2"
          align="center"
          sx={{
            width: "200px",
            whiteSpace: "normal",
            wordBreak: "break-word",
            marginBottom: "4px", // Adds space between names
            textAlign: "left",
          }}
        >
          {value}
        </Typography>
      </Item>
    );
  };

  const AllocationContainer = () => {
    return (
      <Box sx={styles.costBox}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          padding={3}
        >
          {allocationArray.map((item, index) => (
            <Grid item xs={2} sm={3} md={3} key={index}>
              <AllocationItem translateLabelId={item.id} value={item.value} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  const ResourceTable = () => {
    return Array.isArray(resourceTableData) && resourceTableData.length > 0 ? (
      <TableContainer component={Paper}>
        <Table sx={styles.table} aria-label="resource table">
          <TableHead sx={{ marginTop: "10px" }}>
            <TableRow>
              <TableCell sx={styles.headerCell}>Resource Name</TableCell>
              <TableCell sx={styles.headerCell}>Role</TableCell>
              <TableCell sx={styles.headerCell}>Start Date</TableCell>
              <TableCell sx={styles.headerCell}>End Date</TableCell>
              <TableCell sx={styles.headerCell}>Billable Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resourceTableData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.resource_name}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{fDateMDY(item.start_date)}</TableCell>
                <TableCell>{fDateMDY(item.end_date)}</TableCell>
                <TableCell>{item.billable_hours} Hrs</TableCell>
              </TableRow>
            ))}
            <TableRow sx={styles.footer}>
              <TableCell colSpan={2} sx={styles.footerCell}>
                {detailData?.allocations_count} Allocations
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell sx={styles.footerCell}>
                {detailData?.total_billable_hours} Hrs
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography sx={styles.noDataMessage}>
        No resource data available.
      </Typography>
    );
  };

  return (
    <>
      <PageHeader
        primaryTitle={translate("Allocations")}
        buttonText={translate("edit")}
        onClickButton={navigateToAllocationModel}
        showBack={true}
        buttonStyle={""}
        isDisabled={""}
        screen="Allocation"
      />
      <AllocationContainer />
      <ResourceTable />
      {isAddModel && (
        <AddFormModal onClose={onCloseAddModel}>
          <AllocationForm
            handleClose={onCloseAddModel}
            allocationData={detailData}
            isEditMode={isEditMode}
            preSelectedResourceData={preSelectedResourceTableData}
            oldResData={oldResData}
          />
        </AddFormModal>
      )}
    </>
  );
}

const useStyles = createStyles((theme) => ({
  costBox: {
    borderRadius: "8px",
    marginTop: 2,
    padding: 2,
    background: theme.palette.background.paper,
    marginBottom: 2,
  },
  costTitle: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "normal",
    color: "#1C1D24",
  },

  costItemBox: {
    padding: theme.spacing(1),
  },
  costLabel: {
    fontFamily: "Inter",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: "normal",
    color: theme.palette.text.secondary,
  },
  costValue: {
    fontFamily: "Inter",
    fontSize: "13px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: "normal",
    color: theme.palette.text.primary,
    marginTop: theme.spacing(0.5),
  },
  table: {
    minWidth: 650,
    marginTop: 1,
  },
  footer: {
    backgroundColor: "#DFDAEF",
    fontWeight: "bold",
  },
  summaryRow: {
    backgroundColor: "#E0E0E0",
    fontWeight: "bold",
  },
  noDataMessage: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#F0F0F0",
  },
  footerCell: {
    fontWeight: "bold",
  },
}));
