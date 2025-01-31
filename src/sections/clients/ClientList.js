import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TextField, MenuItem, useTheme, Stack } from "@mui/material";

import { Client_Table_Header } from "../../sections/clients/ClientTableRow";

import useLocales from "../../hooks/useLocales";

import { PATH_PAGE } from "../../routes/paths";

import useClient from "../../hooks/useClient";
import PageHeader from "../../components/PageHeader";
import ListingPage from "../../components/ListingPage";
import AddFormModal from "../../components/AddFormModal";
import AddClientStepper, {
  invoicingProcessOptions,
  paymentTermsOptions,
} from "./AddClientStepper";
import ClientAPI from "../../services/ClientService";
import { createStyles } from "@mui/styles";
import { useEffect } from "react";
import { useData } from "../../contexts/DataContext";

export default function ClientList() {
  const { userData } = useData();
  const theme = useTheme();
  const styles = useStyles(theme);
  const { setSelectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();

  const [filterPayment, setFilterPayment] = React.useState("");
  const [filterInvoice, setFilterInvoice] = React.useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const [filterData, setFilterData] = useState({});
  const columns = Client_Table_Header(translate);

  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    const clientData = {
      uuid: row.uuid,
      name: row.name,
    };
    localStorage.setItem("selectedClient", JSON.stringify(clientData));
    setSelectedClient(clientData);
    navigate(PATH_PAGE.client.detail);
  };

  const handleRowEdit = (row) => {
    openAddModel(true);
  };
  const onUpdateFilerValues = (data) => {
    setFilterData(data);
  };

  const onItemAdded = () => {
    onCloseAddModel();
    setRefreshCount((current) => current + 1);
  };

  const openAddModel = () => {
    setAddModel(true);
  };
  const onCloseAddModel = () => {
    setAddModel(false);
  };

  useEffect(() => {
    onUpdateFilerValues({
      client_payment_terms: filterPayment,
      client_invoice_terms: filterInvoice,
    });
  }, [filterPayment, filterInvoice]);

  const TopRightFilters = () => {
    return (
      <Stack direction={"row"} spacing={2} sx={styles.filterContainer}>
        <TextField
          select
          label={translate("payment")}
          value={filterPayment}
          onChange={(event) => setFilterPayment(event.target.value)}
          sx={styles.filterItem}
        >
          <MenuItem key={"id_none"} value="">
            <em>None</em>
          </MenuItem>
          {paymentTermsOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label={translate("invoicing")}
          value={filterInvoice}
          onChange={(event) => setFilterInvoice(event.target.value)}
          sx={styles.filterItem}
        >
          <MenuItem key={"id_none"} value="">
            <em>None</em>
          </MenuItem>
          {invoicingProcessOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    );
  };

  let apiRoles = userData?.user_roles;

  let roles = apiRoles || [];
  return (
    <>
      <>
        <PageHeader
          primaryTitle={
            translate("Client Management")
          }
          buttonText={
            translate("Add Client")
          }
          onClickButton={navigateToModal}
          showSecondaryTitle={false}
        />

        <ListingPage
          column={columns}
          noDataMsgId="client.addClientNoDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={ClientAPI.LIST}
          deleteItemAPI={ClientAPI.DELETE}
          refreshCount={refreshCount}
          setRefreshCount={setRefreshCount}
          screen="Client"
          searchType="client"
          // filterView={<TopRightFilters />}
          // filterItems={filterData}
        />

        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddClientStepper
              handleClose={onCloseAddModel}
              setOpen={isAddModel}
              onClientAdded={onItemAdded}
              userData={userData}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  filterContainer: {
    justifyContent: "space-evenly",
    minWidth: "50%",
  },
  filterItem: {
    backgroundColor: theme.palette.primary.contrastText,
    border: theme.palette.primary.contrastText,
    borderRadius: "12px",
    width: "100%",
  },
}));
