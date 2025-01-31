const CustomerAPI = {
  LIST: (axiosPrivate, pageNumber, pageSize) => {
    return Promise.resolve({
      status: 200,
      data: {
        count: 10,
        next: null,
        previous: null,
        results: [
          {
            customer_name: "John Doe Corporation",
            customer_email: "johndoe@example.com",
            associated_clients: [
              { client_id: 101, client_name: "Acme Inc." },
              { client_id: 102, client_name: "Global Tech Solutions" },
              { client_id: 103, client_name: "NextGen Innovations" },
            ],
          },
        ],
      },
    });
  },

  ADD: (axiosPrivate, payload) => {
    return Promise.resolve({
      success: true,
      message: "customer added successfully",
      new_client: payload,
    });
  },

  UPDATE: (axiosPrivate, clientId, payload) => {
    return Promise.resolve({
      success: true,
      message: `customer ${clientId} updated successfully`,
      updated_data: payload,
    });
  },

  DETAIL: (axiosPrivate, id) => {
    return Promise.resolve({
      data: {
        client_id: id,
        customer_name: "John Doe Corporation",
        customer_email: "johndoe@example.com",
        associated_clients: [
          { client_id: 101, client_name: "Acme Inc." },
          { client_id: 102, client_name: "Global Tech Solutions" },
          { client_id: 103, client_name: "NextGen Innovations" },
        ],
      },
    });
  },

  DELETE: (axiosPrivate, id) => {
    return Promise.resolve({
      success: true,
      message: `customer ${id} deleted successfully`,
      status: 200,
    });
  },
};
export default CustomerAPI;
