import * as React from "react";
import PropTypes from "prop-types";
// components
import palette from "../../theme/palette";
import { fCapitalizeFirst } from "../../utils/formatString";
import { fDateMDY } from "../../utils/formatTime";
import { TableRowWithDelete } from "../../components/table";
import DeletePopUp from "../../components/DeletePopUp";
import ClientAPI from "../../services/ClientService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { useSnackbar } from "notistack";
import { fCurrency, fPercent } from "../../utils/formatNumber";
import { anchorOrigin } from "../../utils/constants";
import { countryData } from "./CountryData";

ClientTableRow.propTypes = {
  row: PropTypes.object,
  columns: PropTypes.array,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onItemClick: PropTypes.func,
  onDeleteRow: PropTypes.func,
};

export default function ClientTableRow({
  row,
  columns,
  onEditRow,
  onItemClick,
  onDeleteRow,
}) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const axiosPrivate = useAxiosPrivate();
  const [isDeletePopUp, setDeletePopUp] = React.useState(false);

  const onOpenDeletePopup = () => {
    setDeletePopUp(true);
  };

  const onCloseDeletePopup = () => {
    setDeletePopUp(false);
  };

  const handleDelete = () => {
    deleteItemRow();
  };

  async function deleteItemRow() {
    try {
      const response = await ClientAPI.DELETE(axiosPrivate, row.uuid);
      if (response.status >= 200 && response.status < 300) {
        onDeleteRow(row);
        onCloseDeletePopup();
        enqueueSnackbar(translate("message.delete"), { anchorOrigin });
      } else {
        displayError(enqueueSnackbar, {
          message: translate("error.deleteFail"),
          anchorOrigin,
        });
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
    }
  }

  return (
    <>
      <TableRowWithDelete
        row={row}
        columns={columns}
        onEditRow={onEditRow}
        onDeleteRow={onOpenDeletePopup}
        onItemClick={onItemClick}
      />

      {isDeletePopUp && (
        <DeletePopUp onClose={onCloseDeletePopup} onDelete={handleDelete} />
      )}
    </>
  );
}

export const Client_Table_Header = (translate) => [
  {
    id: "name",
    label: translate("clientName"),
    align: "left",
    format: (client) => {
      return client?.name ? fCapitalizeFirst(client.name) : "--";
    },
  },
  {
    id: "country",
    label: translate("Country"),
    align: "center",
    format: (client) => {
      const getCountryName = countryData.find(
        (country) => country.country_id === client?.country
      );
      return getCountryName?.country_name || "--"; // Return the country name or fallback to "--"
    },
  },
  {
    id: "end_type",
    label: translate("contractType"),
    align: "center",
    format: (client) => {
      const contract = client.client_contracts?.[0];
      return contract?.end_type ? contract.end_type : "--";
    },
  },
  {
    id: "client_payment_terms",
    label: translate("payment"),
    align: "center",
    format: (client) => {
      return client?.client_payment_terms
        ? fCapitalizeFirst(client.client_payment_terms)
        : "--";
    },
  },
  // {
  //   id: "client_invoice_terms",
  //   label: translate("invoicing"),
  //   align: "center",
  //   hasStyle: true,
  //   style: (value1) => {
  //     const value = value1.toLowerCase();
  //     let bgColor = palette.light.warning.lighter;
  //     let textColor = palette.light.warning.main;

  //     if (value === "potential lead") {
  //       bgColor = palette.light.error.lighter;
  //       textColor = palette.light.error.main;
  //     } else if (value === "active") {
  //       bgColor = palette.light.success.lighter;
  //       textColor = palette.light.success.main;
  //     } else if (value === "onboarded") {
  //       bgColor = palette.light.info.lighter;
  //       textColor = palette.light.info.main;
  //     }

  //     return {
  //       backgroundColor: bgColor,
  //       color: textColor,
  //       padding: "4px 12px",
  //       borderRadius: "5px",
  //       margin: "40px 10px",
  //     };
  //   },
  //   format: (client) => {
  //     return client?.client_invoice_terms
  //       ? fCapitalizeFirst(client.client_invoice_terms)
  //       : "NA";
  //   },
  // },
];

export const Estimation_Table_Header = (translate) => [
  {
    id: "name",
    label: translate("PriceEstimation.ESTIMATION_NAME"),
    align: "left",
    format: (row) => {
      return row?.name ? fCapitalizeFirst(row.name) : "--";
    },
  },

  {
    id: "resources",
    label: translate("RESOURCES"),
    align: "center",
    format: (row) => {
      const totalResources =
        row.resource?.reduce(
          (sum, resourceEntry) => sum + (resourceEntry.num_of_resources || 0),
          0
        ) ?? 0;

      return `${totalResources} ${translate("RESOURCES")}`;
    },
  },

  {
    id: "TOTAL_GM_COMPANY",
    label: translate("PriceEstimation.TOTAL_PRICE_COMPANY"),
    align: "center",
    format: (row) => {
      return row?.company_avg_price !== undefined && row?.company_avg_price !== null
        ? fCurrency(row?.company_avg_price) 
        : "--";
    },
  },
  
  {
    id: "total_gm_market",
    label: translate("Estimations.GROSS_MARGIN"),
    align: "center",
    format: (row) => {
      return row?.company_avg_gm !== undefined && row?.company_avg_gm !== null
        ? fPercent(row?.company_avg_gm)
        : "--";
    },
  },

  {
    id: "date",
    label: translate("PriceEstimation.ESTIMATION_DATE"),
    align: "center",
    format: (row) => {
      return row?.date_created ? fDateMDY(row.date_created) : "--";
    },
  },
];
