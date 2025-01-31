import React from "react";
import ListingPage from "../../components/ListingPage";
import { TimeSheetList_Table_Header } from "./TimeSheetListTable";
import { PATH_PAGE } from "../../routes/paths";
import { useNavigate } from "react-router-dom";
import TimeSheetAPI from "../../services/TimeSheetService";
import { anchorOrigin } from "../../utils/constants";
import useLocales from "../../hooks/useLocales";
import { useSnackbar } from "notistack";

export default function TimeSheetListScreen({ showApproveModal }) {
  const timesheetPage = true;
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const column = TimeSheetList_Table_Header;
  const isManagerView = true;
  const handleRowClick = (row) => {
    let employee_id;
    if (row && row.resource_id) {
      employee_id = row.resource_id;
    } else if (row && row.employee_number) {
      employee_id = row.employee_number;
    }
    if (employee_id) {
      navigate(PATH_PAGE.timesheetManagement.timesheetOverview, {
        state: { resource_id: employee_id },
      });
    } else {
      console.log("Not getting employee ID for overview ");
      enqueueSnackbar(translate("Application Error - Please Contact Support"), {
        anchorOrigin,
      });
    }
  };
  return (
    <>
      <ListingPage
        column={column}
        handleRowClick={handleRowClick}
        fetchListAPI={TimeSheetAPI.LIST}
        timesheetPage={timesheetPage}
        searchType="timesheet"
        isManagerView={isManagerView}
        showApproveModal={showApproveModal}
      />
    </>
  );
}
