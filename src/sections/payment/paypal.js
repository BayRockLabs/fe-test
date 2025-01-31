import { Alert, AlertTitle } from "@mui/material";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import useLocales from "../../hooks/useLocales";

function Paypal() {
  const { translate } = useLocales();
  const [paymentMsg, setPaymentMsg] = useState({
    type: "",
    title: "",
    message: "",
  });

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: "1.99",
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((orderData) => {
      const transaction = orderData.purchase_units[0].payments.captures[0];
      setPaymentMsg({
        type: "success",
        title: translate('paymentMessage.success'),
        message: `${translate('status')} : ${transaction.status}\n${translate('transactionid')} : ${transaction.id}`,
      });
    });
  };

  const onError = (err) => {
    setPaymentMsg({
      type: "error",
      message: translate('paymentMessage.error'),
    });
    console.log("Error", err);
  };

  const onCancel = (data) => {
    console.log("Cancel", data);
    setPaymentMsg({
      type: "warning",
      message: translate('paymentMessage.cancel'),
    });
  };

  return (
    <PayPalScriptProvider
      options={{ "client-id": process.env.REACT_APP_PAYPAL_ID }}
    >
      {paymentMsg && paymentMsg.type && (
        <Alert sx={{ mb: 3 }} severity={paymentMsg.type}>
          {paymentMsg.title && <AlertTitle>{paymentMsg.title}</AlertTitle>}
          {paymentMsg.message}
        </Alert>
      )}
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />
    </PayPalScriptProvider>
  );
}

export default Paypal;
