import { fCapitalizeFirst } from "../../utils/formatString";
import { fDateMDY } from "../../utils/formatTime";

export const Allocation_Table_Header = [
  {
    id: "name",
    label: "Allocation Name",
    align: "center",
    format: (dataItem) =>
      dataItem?.name ? dataItem.name : "--",
  },
  {
    id: "contract_name",
    label: "Contract Name",
    align: "center",
    format: (dataItem) =>
      dataItem?.contractsow_name
        ? fCapitalizeFirst(dataItem.contractsow_name)
        : "--",
  },
  // {
  //   id: "estimation_name",
  //   label: "Estimation Name",
  //   align: "center",
  //   format: (dataItem) =>
  //     dataItem?.estimation_name ? dataItem.estimation_name : "--",
  // },
  {
    id: "allocation_count",
    label: "Allocations",
    align: "center",
    format: (dataItem) =>
      dataItem?.allocations_count ? dataItem.allocations_count : "--",
  },
  {
    id: "tstart_date",
    label: "Start Date",
    align: "center",
    format: (dataItem) =>
      dataItem?.start_date ? fDateMDY(dataItem.start_date) : "--",
  },
  {
    id: "end_date",
    label: "End Date",
    align: "center",
    format: (dataItem) =>
      dataItem?.end_date ? fDateMDY(dataItem.end_date) : "--",
  },
  {
    id: "planned_hrs",
    label: "Billable Hours",
    align: "center",
    format: (dataItem) =>
      dataItem?.total_billable_hours
        ? `${dataItem.total_billable_hours} Hrs`
        : "--",
  },
  // {
  //   id: "contract_hrs",
  //   label: "Contract Hours",
  //   align: "center",
  //   format: (dataItem) =>
  //     dataItem?.total_cost_hours ? `${dataItem.total_cost_hours} Hrs ` : "--",
  // },
];
