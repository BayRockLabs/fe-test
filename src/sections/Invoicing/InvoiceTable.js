import { fCapitalizeFirst } from "../../utils/formatString";

export const Invoice_List_Table_Header = [
  {
    id: "c2c_invoice_id",
    label: "Invoice No",
    align: "left",
    format: (dataItem) =>
      dataItem?.c2c_invoice_id ? dataItem.c2c_invoice_id : "--",
  },
  {
    id: "c2c_invoice_contract_name",
    label: "Contract Name",
    align: "left",
    format: (dataItem) =>
      dataItem?.c2c_invoice_contract_name
        ? fCapitalizeFirst(dataItem.c2c_invoice_contract_name)
        : "--",
  },
  {
    id: "c2c_invoice_amount",
    label: "Invoice Amount",
    align: "left",
    format: (dataItem) =>
      dataItem?.c2c_invoice_amount ? dataItem.c2c_invoice_amount : "--",
  },
  {
    id: "c2c_invoice_type",
    label: "Invoice Type",
    align: "left",
    format: (dataItem) =>
      dataItem?.c2c_invoice_type ? dataItem.c2c_invoice_type : "--",
  },
  {
    id: "c2c_invoice_generated_on",
    label: "Generated On",
    align: "left",
    format: (dataItem) =>
      dataItem?.c2c_invoice_generated_on
        ? formatDate(dataItem.c2c_invoice_generated_on)
        : "--",
  },
  {
    id: "c2c_invoice_status",
    label: "Status",
    align: "left",
    format: (dataItem) =>
      dataItem?.c2c_invoice_status ? dataItem.c2c_invoice_status : "--",
  },
  {
    id: "action",
    label: "Actions",
    align: "center",
  },
];

const formatDate = (dateString) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
