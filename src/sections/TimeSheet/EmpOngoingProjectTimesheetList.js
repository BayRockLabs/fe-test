import React, { useState } from "react";
import ListingPage from "../../components/ListingPage";
import PageHeader from "../../components/PageHeader";
import { useLocation } from "react-router-dom";
import TimeSheetAPI from "../../services/TimeSheetService";
import { useData } from "../../contexts/DataContext";
import { TimeSheetWeekWiseStatusList_Table_Header } from "./TimeSheetListTable";

export default function OngoinProjectTimesheetList() {
  const location = useLocation();
  const {userData}=useData();
  const { selectedItem, employeeId } = location.state || {};
  const column=TimeSheetWeekWiseStatusList_Table_Header;
  const userEmail=userData?.user_info?.email;
  const weekWiseTimesheetPage=true;
  const [payload,setPayload]=useState({
      "client_name":selectedItem.client_name,
      "contract_sow_name":selectedItem.contractsow_name,
      "employee_email":userEmail
  });
  const [clinetNameArr,setClientNameArr]=useState([selectedItem?.client_name]);
  console.log(selectedItem);


  function fetchEmpTimesheetWeekWiseStatusListAPI(axiosPrivate,pageNumber, pageSize) {
    if (selectedItem) {
      return TimeSheetAPI.EMP_TIMESHEET_WEEKWISE_STATUSLIST(
        axiosPrivate,
        payload,
        pageNumber,
        pageSize
      );
    } else {
      return [];
    }
  }

  return (
      <>
        <PageHeader
         primaryTitle={selectedItem.client_name}
         showBack={true}
         showSecondaryTitle={false}
         />
        <ListingPage
          column={column}
          fetchListAPI={fetchEmpTimesheetWeekWiseStatusListAPI}
          handleRowClick={()=>{}}
          weekWiseTimesheetPage={weekWiseTimesheetPage}
          employeeId={employeeId}
          clinetNameArr={clinetNameArr}
        />  
      </>
  );
}
