import { fCapitalizeFirst } from "../../utils/formatString";
export const Designation_Table_Header = [
    {
        id: "designation",
        label: "Designation",
        align: "left",
        format: (dataItem) =>
            dataItem?.designation
                ? fCapitalizeFirst(dataItem?.designation)
                : "--",
    },
    {
        id: "number_of_resources",
        label: "No Of Resources",
        align: "center",
        format: (dataItem) =>
            dataItem?.number_of_resources ? dataItem.number_of_resources : "--",
    },
];

export const Skill_Table_Header = [
    {
        id: "skill",
        label: "Skill",
        align: "left",
        format: (dataItem) =>
            dataItem?.skill
                ? fCapitalizeFirst(dataItem?.skill)
                : "--",
    },
    {
        id: "number_of_resources",
        label: "No Of Resources",
        align: "center",
        format: (dataItem) =>
            dataItem?.number_of_resources ? dataItem.number_of_resources : "--",
    },
];


export const EmpType_Table_Header = [
    {
        id: "employee_type",
        label: "Emp Type",
        align: "left",
        format: (dataItem) =>
            dataItem?.employee_type
                ? fCapitalizeFirst(dataItem?.employee_type)
                : "--",
    },
    {
        id: "number_of_resources",
        label: "No Of Resources",
        align: "center",
        format: (dataItem) =>
            dataItem?.number_of_resources ? dataItem.number_of_resources : "--",
    },
    {
        id: "region",
        label: "Region",
        align: "center",
        format: (dataItem) =>
            dataItem?.region !== undefined
                ? dataItem.region
                : "0",
    },
];