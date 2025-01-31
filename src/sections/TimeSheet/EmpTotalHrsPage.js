import React, { useState } from "react";
import ListingPage from "../../components/ListingPage";
import PageHeader from "../../components/PageHeader";
import { useLocation } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import TimeSheetAPI from "../../services/TimeSheetService";
import { TimeSheetTimeOffHrsList_Table_Header, TimeSheetUnplannedHrsList_Table_Header } from "./TimeSheetListTable";

export default function EmpTimesheetTotalHrs() {
    const location = useLocation();
    const { userData } = useData();
    const { countPage } = location.state || {};
    const unplannedColumn=TimeSheetUnplannedHrsList_Table_Header;
    const timeOffColumn=TimeSheetTimeOffHrsList_Table_Header;
    const userEmail=userData?.user_info?.email;
    const [payload, setPayload] = useState({
        "employee_email": userEmail
    });

    function fetchEmpTimesheetTotalHrsListAPI(axiosPrivate, pageNumber, pageSize) {
        if (userEmail) {
            if (countPage === "unplanned") {
                return TimeSheetAPI.EMP_TIMESHEET_TOTALUNPLANNED_HRS_LIST(
                    axiosPrivate,
                    payload,
                    pageNumber,
                    pageSize
                );
            } else {
                return TimeSheetAPI.EMP_TIMESHEET_TOTALTIMEOFF_HRS_LIST(
                    axiosPrivate,
                    payload,
                    pageNumber,
                    pageSize
                );
            }
        } else {
            return [];
        }
    }

    return (
        <>
            <PageHeader
                primaryTitle={countPage === "unplanned" ? "Unplanned Hrs" : "Time Off Hrs"}
                showBack={true}
                showSecondaryTitle={false}
            />
            <ListingPage
                column={countPage === "unplanned" ?unplannedColumn:timeOffColumn}
                fetchListAPI={fetchEmpTimesheetTotalHrsListAPI}
                handleRowClick={() => {}}
                noDataMsgId={countPage === "unplanned"?"No unplanned hours found":"No time off hours found"}
                weekWiseTimesheetPage={true}
            />
        </>
    );
}
