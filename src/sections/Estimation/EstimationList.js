// @mui

import { useState } from "react";
import ListingPage from "../../components/ListingPage";
import PageHeader from "../../components/PageHeader";
import useClient from "../../hooks/useClient";
import useLocales from "../../hooks/useLocales";
import AddFormModal from "../../components/AddFormModal";
import AddEstimationForm from "./AddEstimationForm";
import EstimationAPI from "../../services/EstimationService";
import { Estimation_Table_Header } from "../clients/ClientTableRow";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../routes/paths";

export default function EstimationList() {
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();

  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const columns = Estimation_Table_Header(translate);

  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    navigate(PATH_PAGE.estimation.detail, {
      state: { uuid: row.uuid },
    });
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
      return EstimationAPI.LIST(
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
          primaryTitle={translate("estimations")}
          buttonText={translate("addEstimation")}
          onClickButton={navigateToModal}
        />

        <ListingPage
          column={columns}
          noDataMsgId="Estimations.noDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={fetchDataListAPI}
          deleteItemAPI={EstimationAPI.DELETE}
          refreshCount={refreshCount}
          screen="Estimation"
          searchType="estimation"
          clientId={selectedClient.uuid}
          setRefreshCount={setRefreshCount}
        />

        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddEstimationForm
              handleClose={onCloseAddModel}
              onEstimationAdded={onItemAdded}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}
