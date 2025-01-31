const PricingAPI = {
  ADD: (axiosPrivate, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post("/pricing", payload, config);
  },

  UPDATE: (axiosPrivate,id, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.patch(`/pricing/details/${id}/`, payload, config);
  },

  LIST: (axiosPrivate, clientID, pageNumber, pageSize) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(
      `/pricing/${clientID}/?page=${pageNumber}&page_size=${pageSize}`, config
    );
  },

  DETAIL: (axiosPrivate, uuid) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(`/pricing/details/${uuid}/`, config);
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.delete(`/pricing/details/${id}/`, config);
  },
};

export default PricingAPI;
