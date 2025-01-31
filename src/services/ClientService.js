const ClientAPI = {
  LIST: (axiosPrivate, pageNumber, pageSize) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/client?page=${pageNumber}&page_size=${pageSize}`,
      config
    );
  },

  ADD: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/client", payload, config);
  },

  UPDATE: (axiosPrivate, clientId, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.patch("/client/" + clientId, payload, config);
  },

  ADD_NDA_CONTRACT: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/contract", payload, config);
  },

  UPDATE_NDA_CONTRACT: (axiosPrivate, contractId, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.patch(
      `/contract/details/${contractId}/`,
      payload,
      config
    );
  },

  DETAIL: (axiosPrivate, clientId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get("/client/" + clientId, config);
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.delete(`/client/${id}`, config);
  },
  CHECK_CLIENT_CONTRACT_NAME: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/auto-name-search/`, payload, config);
  },
};

export default ClientAPI;
