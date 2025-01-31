import React, { useState } from "react";
import useLocales from "../../hooks/useLocales";

import PageHeader from "../../components/PageHeader";
import AddFormModal from "../../components/AddFormModal";
import ContractAPI from "../../services/ContractService";

import { Contract_Table_Header } from "../ContractManagement/ContractTableRow";

import useClient from "../../hooks/useClient";
import ListingPage from "../../components/ListingPage";
import { PATH_PAGE } from "../../routes/paths";
import { useNavigate } from "react-router-dom";
import AddContractForm from "./AddContractForm";

export default function ContractList() {
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();

  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const columns = Contract_Table_Header;

  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    const uuid = row.uuid;
    navigate(PATH_PAGE.contracts.detail, { state: { uuid } });
  };

  const handleRowEdit = (row) => {
    openAddModel(true);
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

  function fetchDataListAPI(axiosPrivate, pageNumber, pageSize) {
    if (selectedClient.uuid) {
      return ContractAPI.LIST(
        axiosPrivate,
        selectedClient.uuid,
        pageNumber,
        pageSize
      );
    } else {
      return [];
    }
  }

  return (
    <>
      <>
        <PageHeader
          primaryTitle={translate("CONTRACTS.CONTRACTS")}
          buttonText={translate("CONTRACTS.ADD_CONTRACT")}
          onClickButton={navigateToModal}
        />

        <ListingPage
          column={columns}
          noDataMsgId="CONTRACTS.noDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={fetchDataListAPI}
          deleteItemAPI={ContractAPI.DELETE}
          refreshCount={refreshCount}
          screen="Contracts"
          searchType="contractsow"
          clientId={selectedClient.uuid}
          setRefreshCount={setRefreshCount}
        />

        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddContractForm
              handleClose={onCloseAddModel}
              onContractAdded={onItemAdded}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}
