import { fCapitalizeFirst } from "../../utils/formatString";
import { fDateDMY, NumberTypeChecker } from "../../utils/formatTime";

export const TimeSheetList_Table_Header = [
  {
    id: "employee_full_name",
    label: "Name",
    align: "left",
    format: (dataItem) =>
      dataItem?.employee_full_name
        ? fCapitalizeFirst(dataItem?.employee_full_name)
        : "--",
  },
  {
    id: "resource_role",
    label: "Role",
    align: "left",
    format: (dataItem) =>
      dataItem?.resource_role ? dataItem.resource_role : "--",
  },
  {
    id: "ongoing_projects",
    label: "Active Projects",
    align: "center",
    format: (dataItem) =>
      dataItem?.ongoing_projects !== undefined
        ? NumberTypeChecker(dataItem?.ongoing_projects)
        : "NA",
  },
  {
    id: "completed_projects",
    label: "Completed Projects",
    align: "center",
    format: (dataItem) =>
      dataItem?.completed_projects !== undefined
        ? NumberTypeChecker(dataItem?.completed_projects)
        : "NA",
  },
];

export const TimeSheetWeekWiseStatusList_Table_Header = [
  {
    id: "start_date",
    label: "Start Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.start_date ? fDateDMY(dataItem?.start_date) : "--",
  },
  {
    id: "end_date",
    label: "End Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.end_date ? fDateDMY(dataItem?.end_date) : "--",
  },
  {
    id: "allocated_hours",
    label: "Allocated Hrs",
    align: "center",
    format: (dataItem) =>
      dataItem?.allocated_hours !== undefined ? dataItem.allocated_hours : "0",
  },
  {
    id: "billable_hours",
    label: "Timesheet Hrs",
    align: "center",
    format: (dataItem) =>
      dataItem?.billable_hours !== undefined ? dataItem.billable_hours : "0",
  },
  {
    id: "submitted",
    label: "Status",
    align: "center",
  },
];
export const MissingTimesheets_Table_Header = [
  {
    id: "start_date",
    label: "Start Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.week_start_date ? fDateDMY(dataItem?.week_start_date) : "--",
  },
  {
    id: "end_date",
    label: "End Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.week_end_date ? fDateDMY(dataItem?.week_end_date) : "--",
  },
  {
    id: "submitted",
    label: "Status",
    align: "center",
  },
];
export const TimeSheetUnplannedHrsList_Table_Header = [
  {
    id: "start_date",
    label: "Start Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.start_date ? fDateDMY(dataItem?.start_date) : "--",
  },
  {
    id: "end_date",
    label: "End Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.end_date ? fDateDMY(dataItem?.end_date) : "--",
  },
  {
    id: "unplanned_hours",
    label: "Unplanned Hrs",
    align: "center",
    format: (dataItem) =>
      dataItem?.unplanned_hours !== undefined ? dataItem.unplanned_hours : "0",
  },
  {
    id: "unplanned_hours_comments",
    label: "Comments",
    align: "center",
    format: (dataItem) =>
      dataItem?.unplanned_hours_comments !== undefined
        ? dataItem.unplanned_hours_comments
        : "--",
  },
];

export const TimeSheetTimeOffHrsList_Table_Header = [
  {
    id: "start_date",
    label: "Start Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.start_date ? fDateDMY(dataItem?.start_date) : "--",
  },
  {
    id: "end_date",
    label: "End Date",
    align: "left",
    format: (dataItem) =>
      dataItem?.end_date ? fDateDMY(dataItem?.end_date) : "--",
  },
  {
    id: "non_billable_hours",
    label: "Time Off Hrs",
    align: "center",
    format: (dataItem) =>
      dataItem?.non_billable_hours !== undefined
        ? dataItem.non_billable_hours
        : "0",
  },
  {
    id: "non_billable_hours_comments",
    label: "Comments",
    align: "center",
    format: (dataItem) =>
      dataItem?.non_billable_hours_comments !== undefined
        ? dataItem.non_billable_hours_comments
        : "--",
  },
];
