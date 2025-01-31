import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { Box, Button, Grid, MenuItem, TextField } from "@mui/material";
import MandatoryTextField from "../../pages/MandatoryTextField";
import useLocales from "../../hooks/useLocales";
import { DatePicker } from "@mui/x-date-pickers";
import TimeSheetAPI from "../../services/TimeSheetService";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import {axiosPrivate, axiosBlobPrivate } from "../../services/axios";
import { saveAs } from "file-saver";
import { formatDateToyyMMDD } from "../../utils/formatTime";

export default function ExportTimesheet() {
    const { translate } = useLocales();
    const [allocationType, setAllocationType] = useState("Summarized View");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState("");

    async function exportTimesheet(payload) {
        try {
            let axios_Request = payload.export_type === "json" ? axiosPrivate : axiosBlobPrivate;
            const response = await TimeSheetAPI.EXPORT_TIMESHEET(axios_Request, payload);
            if (isValidResponse(response)) {
                const fileName = `Employee_Timesheets_${formatDateToyyMMDD(startDate)}to${formatDateToyyMMDD(endDate)}_${allocationType}.`;

                if (payload.export_type === "json") {
                    saveToJSON(response.data, fileName + "json");
                } else if (payload.export_type === "excel") {
                    saveToExcel(response.data, fileName + "xlsx");
                }
            }
        } catch (error) {
            console.log("Error while getting data", error);
        }
    }

    function validateDates() {
        if ((startDate && !endDate) || (!startDate && endDate)) {
            setError(translate("Both start and end dates are required or both should be optional"));
            return false;
        }
        setError("");
        return true;
    }

    function constructPayload(exportType) {
        if (!validateDates()) return;

        const payloadData = {
            allocation_type: allocationType === "Summarized View" ? "overview_timesheet" : "detailed_timesheet",
            start_date: formatDateToyyMMDD(startDate), // Use formatted date
            end_date: formatDateToyyMMDD(endDate),     // Use formatted date
            export_type: exportType
        };
        exportTimesheet(payloadData);
    }

    function handleExportToJson() {
        constructPayload("json");
    }

    function handleExportToExcel() {
        constructPayload("excel");
    }

    function saveToJSON(data, fileName) {
        console.log("JSON Data", data)
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        saveAs(blob, fileName);
    }

    function saveToExcel(data, fileName) {
        const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, fileName);
    }

    return (
        <Box height={"100vh"}>
            <PageHeader
                primaryTitle={"Export Timesheet"}
                showBack={false}
                showSecondaryTitle={false}
            />
            <Grid container spacing={2} marginTop={2} marginBottom={3}>
                <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        select
                        fullWidth
                        label={<MandatoryTextField label={translate("Timesheet Download Type")} />}
                        value={allocationType}
                        onChange={(e) => setAllocationType(e.target.value)}
                    >
                        {DownloadType.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                    <DatePicker
                        label={translate("Start Date")}
                        value={startDate}
                        onChange={(newDate) => setStartDate(newDate)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        views={["year", "month", "day"]}
                        inputFormat="yyyy-MM-dd"
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                    <DatePicker
                        label={translate("End Date")}
                        value={endDate}
                        onChange={(newDate) => setEndDate(newDate)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        views={["year", "month", "day"]}
                        inputFormat="yyyy-MM-dd"
                        minDate={startDate}
                    />
                </Grid>
            </Grid>
            {error && <Box color="red" marginBottom={2}>{error}</Box>} {/* Show error message */}
            <Box display={"flex"} gap={1}>
                <Button variant="contained" sx={{ color: "black" }} onClick={handleExportToJson}>
                    Export to JSON
                </Button>
                <Button variant="contained" sx={{ color: "black" }} onClick={handleExportToExcel}>
                    Export to Excel
                </Button>
            </Box>
        </Box>
    );
}

const DownloadType = ["Summarized View", "Allocations Wise View"];

