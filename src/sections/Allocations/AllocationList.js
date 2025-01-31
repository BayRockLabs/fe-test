import { useState } from "react";
import ListingPage from "../../components/ListingPage";
import PageHeader from "../../components/PageHeader";
import useClient from "../../hooks/useClient";
import useLocales from "../../hooks/useLocales";
import AllocationAPI from "../../services/AllocationService";
import { Allocation_Table_Header } from "./AllocationsTableRow";
import AddFormModal from "../../components/AddFormModal";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../routes/paths";
import AllocationForm from "./AllocationForm";

const AllocationList = () => {
  const navigate = useNavigate();
  const { selectedClient } = useClient();
  const columns = Allocation_Table_Header;
  const [isAddModel, setAddModel] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const { translate } = useLocales();
  const openAddModel = () => {
    setAddModel(true);
  };

  const navigateToModal = () => {
    openAddModel();
  };

  const onCloseAddModel = () => {
    setAddModel(false);
  };

  const onItemAdded = () => {
    onCloseAddModel();
    setRefreshCount((current) => current + 1);
  };

  function fetchDataListAPI(axiosPrivate, pageNumber, pageSize) {
    if (selectedClient.uuid) {
      return AllocationAPI.LIST(
        axiosPrivate,
        selectedClient.uuid,
        pageNumber,
        pageSize
      );
    } else {
      return [];
    }
  }
  const handleRowClick = (row) => {
    console.log("row", row);

    navigate(PATH_PAGE.allocation.detail, {
      state: { uuid: row.uuid },
    });
  };
  return (
    <>
      <PageHeader
        primaryTitle={translate("Allocation.ALLOCATIONS")}
        buttonText={translate("Allocation.ADD_ALLOCATION")}
        onClickButton={navigateToModal}
      />

      <ListingPage
        column={columns}
        noDataMsgId="CONTRACTS.noDataMsg"
        handleRowClick={handleRowClick}
        handleRowEdit={""}
        fetchListAPI={fetchDataListAPI}
        deleteItemAPI={AllocationAPI.DELETE}
        refreshCount={refreshCount}
        screen="Allocation"
        setRefreshCount={setRefreshCount}
        searchType={"allocation"}
        clientId={selectedClient.uuid}
      />
      {isAddModel && (
        <AddFormModal onClose={onCloseAddModel}>
          <AllocationForm
            handleClose={onCloseAddModel}
            onAllocationAdded={onItemAdded}
          />
        </AddFormModal>
      )}
    </>
  );
};
export default AllocationList;
