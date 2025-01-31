import * as React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, useTheme, Tooltip, Button } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/Download";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EditIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "../../assets/svg/DeleteIcon";
import IconButton from "@mui/material/IconButton";
import { createStyles } from "@mui/styles";
import { useData } from "../../contexts/DataContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Invoice from "../../sections/Invoicing/Invoice";
import ROLES from "../../routes/Roles";
import { TIMESHEET_STATUS } from "../../utils/constants";

TableRowWithDelete.propTypes = {
  row: PropTypes.object,
  columns: PropTypes.array,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onItemClick: PropTypes.func,
  timesheetPage: PropTypes.bool,
  invoicePage: PropTypes.bool,
  onRegenerateClick: PropTypes.func,
  onEmailClick: PropTypes.func,
};

export default function TableRowWithDelete({
  row,
  columns,
  onEditRow,
  onDeleteRow,
  onItemClick,
  timesheetPage,
  invoicePage,
  weekWiseTimesheetPage,
  onRegenerateClick,
  onSubmitTimsheetClick,
  onEmailClick,
  onPaidClick,
  screen,
}) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { userData } = useData();

  const CellDataItem = ({ row, column }) => {
    const cellFormatValue =
      typeof column.format === "function"
        ? column.format(row)
        : row[column.id] || "--";
    const cellStyle = column.hasStyle ? column.style?.(cellFormatValue) : {};
    return <span style={cellStyle}>{cellFormatValue}</span>;
  };
  const isButtonDisabled = row.is_utilized;
  const isPriceButtonDisabled = row.is_price_utilized;
  const isContractButtonDisabled = row.is_contract_utilized_po;
  const {
    EST_ADMIN,
    ALLOCATION_ADMIN,
    CLIENT_ADMIN,
    MILESTONE_ADMIN,
    PO_ADMIN,
    PRICING_ADMIN,
    SOW_ADMIN,
    SUPER_ADMIN,
    INVOICE_ADMIN,
    INVOICE_VIEW,
  } = ROLES;
  const buttonPermissions = {
    "Delete Client": [CLIENT_ADMIN, SUPER_ADMIN],
    "Delete Estimation": [EST_ADMIN, SUPER_ADMIN],
    "Delete Pricing": [PRICING_ADMIN, SUPER_ADMIN],
    "Delete Contracts": [SOW_ADMIN, SUPER_ADMIN],
    "Delete Allocation": [ALLOCATION_ADMIN, SUPER_ADMIN],
    "Delete Milestone": [MILESTONE_ADMIN, SUPER_ADMIN],
    "Delete PO": [PO_ADMIN, SUPER_ADMIN],
    "Delete customer": [SUPER_ADMIN],
  };
  const isInvoiceAdmin = userData?.user_roles?.includes(INVOICE_ADMIN);
  const isInvoiceViewer = userData?.user_roles?.includes(INVOICE_VIEW);
  const isSuperAdmin = userData?.user_roles?.includes(SUPER_ADMIN);
  const renderDelBtn = userData?.user_roles?.some((role) =>
    buttonPermissions[`Delete ${screen}`]?.includes(role)
  ) ? (
    <Tooltip
      title={
        isButtonDisabled
          ? "Contract is locked for this Estimation, You can't delete it"
          : isPriceButtonDisabled
          ? "Contract is locked for this Pricing, You can't delete it"
          : isContractButtonDisabled
          ? "Contract is locked by PO, You can't delete it"
          : null
      }
      disableHoverListener={
        !isButtonDisabled && !isPriceButtonDisabled && !isContractButtonDisabled
      }
    >
      <span>
        {!timesheetPage && !invoicePage && (
          <IconButton
            color="default"
            aria-label="delete"
            size="small"
            onClick={() => onDeleteRow(row)}
            style={{
              // Button visibility based on roles
              display: userData?.user_roles?.some((role) =>
                buttonPermissions[`Delete ${screen}`]?.includes(role)
              )
                ? "inline-flex" // Show the button if allowed
                : "none", // Hide the button if not allowed
              opacity:
                isButtonDisabled ||
                isPriceButtonDisabled ||
                isContractButtonDisabled
                  ? 0.3
                  : 1,
              pointerEvents:
                isButtonDisabled ||
                isPriceButtonDisabled ||
                isContractButtonDisabled
                  ? "none"
                  : "auto",
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </span>
    </Tooltip>
  ) : null;

  const ActionButtons = () => (
    <>
      {(isInvoiceAdmin || isSuperAdmin) && (
        <>
          <IconButton
            disabled={row.c2c_invoice_status === "Paid"}
            color="default"
            aria-label="regenerate"
            size="small"
            onClick={() => onRegenerateClick(row)}
          >
            <CachedOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            disabled={row.c2c_invoice_status === "Paid"}
            color="default"
            aria-label="email"
            size="small"
            onClick={() => onEmailClick(row)}
          >
            <EmailOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            disabled={row.c2c_invoice_status === "Paid"}
            color="default"
            aria-label="check"
            size="small"
            onClick={() => onPaidClick(row)}
          >
            <CheckCircleOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </>
      )}

      {(isSuperAdmin || isInvoiceAdmin || isInvoiceViewer) && (
        <IconButton color="default" aria-label="download" size="small">
          <PDFDownloadLink
            fileName="invoice.pdf"
            document={<Invoice row={row} />}
          >
            <DownloadOutlinedIcon style={{ color: "grey" }} fontSize="small" />
          </PDFDownloadLink>
        </IconButton>
      )}
    </>
  );

  const TimesheetStatusButtons = ({ row }) => {
    let isRecalled;
    if (row.timesheet_status === "recall") {
      isRecalled = true;
    }
    return (
      <>
        {weekWiseTimesheetPage && (
          <>
            <Button
              onClick={() => onSubmitTimsheetClick(row, isRecalled)}
              variant="contained"
              disabled={
                row.timesheet_status === TIMESHEET_STATUS.submitted ||
                row.timesheet_status === TIMESHEET_STATUS.approved
              }
              sx={{ width: 160 }}
            >
              {row.timesheet_status === TIMESHEET_STATUS.recall
                ? "Recalled"
                : row.timesheet_status === TIMESHEET_STATUS.not_submitted ||
                  row.unplanned_timesheet_status ===
                    TIMESHEET_STATUS.not_submitted
                ? "Not Submitted"
                : row.timesheet_status === TIMESHEET_STATUS.submitted
                ? "Submitted"
                : row.timesheet_status === TIMESHEET_STATUS.approved
                ? "Approved"
                : "Unknown Status"}
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <TableRow hover style={styles.rowContainer}>
      {columns?.map((column, index) => (
        <TableCell
          sx={{
            whiteSpace: "nowrap",
          }}
          align={column.align}
          onClick={() => onItemClick(row)}
          key={column.id + "_" + index}
        >
          {column.id === "action" ? (
            <ActionButtons />
          ) : column.id === TIMESHEET_STATUS.submitted ? (
            <TimesheetStatusButtons row={row} />
          ) : (
            <CellDataItem row={row} column={column} />
          )}
        </TableCell>
      ))}

      <TableCell
        sx={{ whiteSpace: "nowrap" }}
        align="center"
        key={"key_edit_delete"}
      >
        {renderDelBtn}
        {!invoicePage && !weekWiseTimesheetPage && (
          <IconButton
            color="default"
            aria-label="edit"
            size="small"
            onClick={() => {
              onItemClick(row);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}

const useStyles = createStyles((theme) => ({
  rowContainer: {
    cursor: "pointer",
  },
}));
