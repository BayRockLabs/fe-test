import React from "react";
import ListingPage from "../../components/ListingPage";
import PageHeader from "../../components/PageHeader";
import { useLocation } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { MissingTimesheets_Table_Header } from "./TimeSheetListTable";
import TimeSheetAPI from "../../services/TimeSheetService";

export default function MissingTimesheets() {
  const location = useLocation();
  const { employeeId } = location.state || {};
  const { userData } = useData();

  const weekWiseTimesheetPage = true;
  const MissingTimesheetsPage = true;
  const column = MissingTimesheets_Table_Header;

  function fetchMissingTimesheets(axiosPrivate, pageNumber, pageSize) {
    const payload = { employee_email: userData?.user_info?.email };
    return TimeSheetAPI.MISSING_TIMESHEETS(
      axiosPrivate,
      payload,
      pageNumber,
      pageSize
    );
  }

  return (
    <>
      <PageHeader
        primaryTitle={"Missing Timesheets"}
        showBack={true}
        showSecondaryTitle={false}
      />

      <ListingPage
        column={column}
        fetchListAPI={fetchMissingTimesheets}
        employeeId={employeeId}
        weekWiseTimesheetPage={weekWiseTimesheetPage}
        MissingTimesheetsPage={MissingTimesheetsPage}
      />
    </>
  );
}
