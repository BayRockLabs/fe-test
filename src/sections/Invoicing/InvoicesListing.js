import React from "react";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import ListingPage from "../../components/ListingPage";
import { Invoice_List_Table_Header } from "./InvoiceTable";
import InvoiceAPI from "../../services/InvoiceService";
import useClient from "../../hooks/useClient";

export default function InvoicesListScreen() {
    const { translate } = useLocales();
    const columns = Invoice_List_Table_Header
    const { selectedClient } = useClient();
    const invoicePage=true;
    function fetchDataListAPI(axiosPrivate, pageNumber, pageSize) {
        if (selectedClient.uuid) {
          return InvoiceAPI.LIST(
            axiosPrivate,
            selectedClient.uuid,
            pageNumber,
            pageSize
          );
        } else {
          return [];
        }
    }

    return (
        <>
            <PageHeader
                primaryTitle={translate("Invoices")}
            />
            <ListingPage
                column={columns}
                noDataMsgId="Invoice.NOINVOICEFOUND"
                fetchListAPI={fetchDataListAPI}
                handleRowClick={()=>{}}
                invoicePage={invoicePage}
                regenerateInvoiceAPI={InvoiceAPI.REGENERATE}
                markAsPaidAPI={InvoiceAPI.PAID}
                sendEmailAPI={InvoiceAPI.SENDMAIL}
                searchType={"invoices"}
                clientId={selectedClient.uuid}
            />

        </>

    );
}
