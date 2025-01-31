import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocales from "../../../hooks/useLocales";

import AddPricingForm from "./AddPricingForm";
import PageHeader from "../../../components/PageHeader";
import AddFormModal from "../../../components/AddFormModal";
import PricingAPI from "../../../services/PricingService";
import { PATH_PAGE } from "../../../routes/paths";
import { Pricing_Table_Header } from "../Pricing/PricingTableRow";
import useClient from "../../../hooks/useClient";
import ListingPage from "../../../components/ListingPage";
import { isValidResponse } from "../../../hooks/useAxiosPrivate";
import { axiosPrivate } from "../../../services/axios";
import EstimationAPI from "../../../services/EstimationService";
import NoEstimationPopUp from "../../../components/NoEstimationPopUp";

export default function Pricing() {
  const { selectedClient } = useClient();
  const { translate } = useLocales();
  const navigate = useNavigate();
  const [estimationDataList, setEstimationDataList] = useState([]);
  const [noEstimationPopUp, setNoEstimationPopUp] = useState(false);

  const [refreshCount, setRefreshCount] = useState(0);
  const [isAddModel, setAddModel] = useState(false);
  const columns = Pricing_Table_Header;
  const navigateToModal = () => {
    openAddModel();
  };

  const handleRowClick = (row) => {
    navigate(PATH_PAGE.estimation.pricingDetail, { state: { data: row.uuid } });
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
      return PricingAPI.LIST(
        axiosPrivate,
        selectedClient.uuid,
        pageNumber,
        pageSize
      );
    } else {
      return [];
    }
  }
  async function fetchEstimations() {
    if (selectedClient.uuid) {
      try {
        const response = await EstimationAPI.LIST(
          axiosPrivate,
          selectedClient.uuid,
          1,
          1000
        );

        if (isValidResponse(response)) {
          setEstimationDataList(response.data.results);
          if (response?.data?.results?.length === 0) {
            setNoEstimationPopUp(true);
          }
        } else {
          console.log("Invalid response from Estimation List API ");
        }
      } catch (error) {
        console.log("Error in fetchEstimations : ", error);
      }
    }
  }
  const onClosePopup = () => {
    setNoEstimationPopUp(false);
  };

  const onGotoEstimation = () => {
    navigate(PATH_PAGE.estimation.root);
  };

  const TopRightFilters = () => {
    return <></>;
  };
  useEffect(() => {
    fetchEstimations();
  }, [selectedClient]);

  return (
    <>
      <>
        <PageHeader
          primaryTitle={translate("PriceEstimation.PRICING")}
          buttonText={translate("PriceEstimation.ADD_PRICING")}
          onClickButton={navigateToModal}
        />

        <ListingPage
          column={columns}
          noDataMsgId="PriceEstimation.noDataMsg"
          handleRowClick={handleRowClick}
          handleRowEdit={handleRowEdit}
          fetchListAPI={fetchDataListAPI}
          deleteItemAPI={PricingAPI.DELETE}
          refreshCount={refreshCount}
          filterView={<TopRightFilters />}
          screen="Pricing"
          searchType="pricing"
          clientId={selectedClient.uuid}
          setRefreshCount={setRefreshCount}
        />
        {noEstimationPopUp && (
          <NoEstimationPopUp
            onClose={onClosePopup}
            onGotoEstimation={onGotoEstimation}
          />
        )}
        {isAddModel && (
          <AddFormModal onClose={onCloseAddModel}>
            <AddPricingForm
              handleClose={onCloseAddModel}
              onPricingAdded={onItemAdded}
            />
          </AddFormModal>
        )}
      </>
    </>
  );
}
