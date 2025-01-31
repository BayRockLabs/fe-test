import React, { useState } from "react";
import useLocales from "../../../hooks/useLocales";

import PageHeader from "../../../components/PageHeader";
import AddFormModal from "../../../components/AddFormModal";

import MilestoneAPI from "../../../services/MilestoneService";

import { Milestone_Table_Header } from "../Milestones/MilestoneTableRow";
import AddMilestoneModal from "./AddMilestoneModal";
import useClient from "../../../hooks/useClient";
import ListingPage from "../../../components/ListingPage";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../../routes/paths";

export default function MilestonesList() {
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();

  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const columns = Milestone_Table_Header(translate);

  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    navigate(PATH_PAGE.contracts.milestoneDetail, {
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
      return MilestoneAPI.LIST(
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
          primaryTitle={translate("MILESTONES.MILESTONES")}
          buttonText={translate("MILESTONES.ADD_MILESTONE")}
          onClickButton={navigateToModal}
        />

        <ListingPage
          column={columns}
          noDataMsgId="MILESTONES.noDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={fetchDataListAPI}
          deleteItemAPI={MilestoneAPI.DELETE}
          refreshCount={refreshCount}
          screen="Milestone"
          searchType="milestone"
          clientId={selectedClient.uuid}
          setRefreshCount={setRefreshCount}
        />

        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddMilestoneModal
              handleClose={onCloseAddModel}
              onAddMilestone={onItemAdded}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}
