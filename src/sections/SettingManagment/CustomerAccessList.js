import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddCustomerAccess from "./CustomerAccess";
import { Customer_Tabel_Header } from "./CustomerTabelRow";
import PageHeader from "../../components/PageHeader";
import useClient from "../../hooks/useClient";
import useLocales from "../../hooks/useLocales";
import AddFormModal from "../../components/AddFormModal";
import ListingPage from "../../components/ListingPage";
import { PATH_PAGE } from "../../routes/paths";
import CustomerAPI from "../../services/CustomerService";

export default function CustomerList() {
  // we are keeping some exisitng code for ui and functionality as it is whenever api is ready will remove this
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();
  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const columns = Customer_Tabel_Header;
  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    navigate(PATH_PAGE.setting.customerdeatil, { state: { data: row.id } });
  };
  const handleRowEdit = (row) => {
    console.log(row);
    openAddModel();
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

  return (
    <>
      <>
        <PageHeader
          primaryTitle={translate("Customer Access")}
          buttonText={translate("CustomerAccess.Add")}
          onClickButton={navigateToModal}
          showSecondaryTitle={false}
        />

        <ListingPage
          column={columns}
          noDataMsgId="CustomerAccess.noDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={CustomerAPI.LIST}
          deleteItemAPI={CustomerAPI.DELETE}
          refreshCount={refreshCount}
          // filterView={<TopRightFilters />}
          screen="customer"
          // searchType="customer access"
          clientId={selectedClient.uuid}
          setRefreshCount={setRefreshCount}
        />

        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddCustomerAccess
              handleClose={onCloseAddModel}
              onCustomerAdded={onItemAdded}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}
