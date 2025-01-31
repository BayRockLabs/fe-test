const PurchaseOrderAPI = {
  LIST: (axiosPrivate, clientUuid, pageNumber, pageSize) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/purchase_orders_client_all/${clientUuid}/?page=${pageNumber}&page_size=${pageSize}`,
      config
    );
  },

  GetPurchaseOrderDetail: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/purchase_orders_by_id/?purchase_order=${id}`,
      config
    );
  },
  ADD: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/purchase-orders/", payload, config);
  },

  UPDATE_PURCHASE: (axiosPrivate, id, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };

    return axiosPrivate.patch(
      `purchase-orders/details/${id}/`,
      payload,
      config
    );
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.delete(`/purchase-orders/details/${id}`, config);
  },

  DELETE_FILE: (axiosPrivate, id, fileName) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.delete(`/purchase-orders/${id}/${fileName}`, config);
  },

  UPLOAD_FILE: "/purchase-orders/file-upload/",

  GET_AVAILABLE_PO: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/purchase_orders_client_unassigned/${id}/`,
      config
    );
  },

  GET_AVAILABLE_CONTRACT: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(`/unassigned-sow-contracts/${id}/`, config);
  },
  ADD_ASSIGN_PO: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/purchase_orders_assign/", payload, config);
  },
  CHECK_PO_NUMBER_EXISTS: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/purchase-order-check/", payload, config);
  },
  DELETE_UTILIZED_AMOUNT: (axiosPrivate, purchaseOrderId, contractsowIds) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `/delete-utilized-amounts/${purchaseOrderId}/`,
      { contractsow_ids: contractsowIds },
      config
    );
  },
};

export default PurchaseOrderAPI;
