import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Stack, TextField } from "@mui/material";
import useLocales from "../../../hooks/useLocales";
import PageHeader from "../../../components/PageHeader";
import AddFormModal from "../../../components/AddFormModal";
import PurchaseOrderAPI from "../../../services/PurchaseOrderService";
import { PATH_PAGE } from "../../../routes/paths";
import { DatePicker } from "@mui/x-date-pickers";
import AddPurchaseOrderModal from "./../PurchaseOrder/AddPurchaseOrderModal";
import AssignContractModal from "./../PurchaseOrder/AssignContractModal";
import { createStyles, useTheme } from "@mui/styles";
import useClient from "../../../hooks/useClient";
import { PurchaseOrderTableHeader } from "../../ContractManagement/PurchaseOrder/PurchaseOrderTableRow";
import ListingPage from "../../../components/ListingPage";
import { useData } from "../../../contexts/DataContext";
import ROLES from "../../../routes/Roles";

export default function EstimationList() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();

  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const [isAddContractModel, setAddContractModel] = useState(false);
  const columns = PurchaseOrderTableHeader(translate);

  const navigateToAddContractModal = () => {
    openAddContractModel();
  };

  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    navigate(PATH_PAGE.contracts.purchaseOrderDetail, {
      state: { data: row.id },
    });
  };

  const handleRowEdit = (row) => {
    openAddModel(true);
  };

  const onItemAdded = () => {
    onCloseAddModel();
    onCloseAddContractModel();
    setRefreshCount((current) => current + 1);
  };

  const openAddModel = () => {
    setAddModel(true);
  };
  const onCloseAddModel = () => {
    setAddModel(false);
  };

  const openAddContractModel = () => {
    setAddContractModel(true);
  };
  const onCloseAddContractModel = () => {
    setAddContractModel(false);
  };

  function fetchDataListAPI(axiosPrivate, pageNumber, pageSize) {
    if (selectedClient.uuid) {
      return PurchaseOrderAPI.LIST(
        axiosPrivate,
        selectedClient.uuid,
        pageNumber,
        pageSize
      );
    } else {
      return [];
    }
  }

  // const TopRightFilters = () => {
  //   const [filterDate, setFilterDate] = React.useState(null);
  //   return (
  //     <Stack direction={"row"} spacing={2} sx={styles.filterContainer}>
  //       <DatePicker
  //         label={translate("startDate")}
  //         onChange={(value) => setFilterDate(value)}
  //         value={filterDate}
  //         renderInput={(params) => (
  //           <TextField {...params} helperText={null} sx={styles.filterItem} />
  //         )}
  //       />
  //     </Stack>
  //   );
  // };

  const RightButtonView = () => {
    const { userData } = useData(); // Accessing userData from context
    const { SUPER_ADMIN, PO_ADMIN } = ROLES;

    // Check if user has either SUPER_ADMIN or PO_ADMIN role
    const canAddPurchaseOrder =
      userData?.user_roles?.includes(SUPER_ADMIN) ||
      userData?.user_roles?.includes(PO_ADMIN);
    const canAssignContracts =
      userData?.user_roles?.includes(SUPER_ADMIN) ||
      userData?.user_roles?.includes(PO_ADMIN);
    console.log("po", canAddPurchaseOrder);

    return (
      <Stack>
        <Grid sx={{ marginLeft: "28px" }}>
          {canAddPurchaseOrder && (
            <Button
              variant="contained"
              sx={{ color: "black", margin: "4px" }}
              onClick={navigateToModal}
            >
              {translate("PurchaseOrder.ADD_PURCHASE_ORDER")}
            </Button>
          )}
          {canAssignContracts && (
            <Button
              variant="contained"
              sx={{ color: "black" }}
              onClick={navigateToAddContractModal}
            >
              {translate("PurchaseOrder.ASSIGN_CONTRACTS")}
            </Button>
          )}
        </Grid>
      </Stack>
    );
  };

  return (
    <>
      <>
        <PageHeader
          primaryTitle={translate("PurchaseOrder.PURCHASE_ORDER")}
          rightView={<RightButtonView />}
        />

        <ListingPage
          column={columns}
          noDataMsgId="PurchaseOrder.noDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={fetchDataListAPI}
          deleteItemAPI={PurchaseOrderAPI.DELETE}
          refreshCount={refreshCount}
          // filterView={<TopRightFilters />}
          screen="PO"
          searchType="purchase_order"
          clientId={selectedClient.uuid}
          setRefreshCount={setRefreshCount}
        />

        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddPurchaseOrderModal
              handleClose={onCloseAddModel}
              onPurchaseOrderAdded={onItemAdded}
            />
          </AddFormModal>
        )}

        {isAddContractModel && (
          <AddFormModal onClose={onCloseAddContractModel}>
            <AssignContractModal
              handleClose={onCloseAddContractModel}
              onPurchaseOrderAdded={onItemAdded}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  filterContainer: {
    justifyContent: "end",
    minWidth: "50%",
  },
  filterItem: {
    backgroundColor: theme.palette.primary.contrastText,
    border: theme.palette.primary.contrastText,
    borderRadius: "12px",
    width: "80%",
  },
}));
