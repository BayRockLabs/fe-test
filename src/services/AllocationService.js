const AllocationAPI = {
  LIST: (axiosPrivate, clientUuid, pageNumber, pageSize) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/allocation/${clientUuid}/?page=${pageNumber}&page_size=${pageSize}`,
      config
    );
  },
  DETAIL: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(`/allocation/details/${id}/`, config);
  },
  UPDATE: (axiosPrivate,id,payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.put(`/allocation/details/${id}/`,payload,config);
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.delete(`/allocation/details/${id}/`, config);
  },

  GET_EST_CON: (axiosPrivate, clientUuid) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/allocation/contractsow/client/${clientUuid}/`,
      config
    );
  },

  GET_RES: (axiosPrivate, ConId, EstId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/allocation/contractsow/${ConId}/estimation/${EstId}/`,
      config
    );
  },

  ADD: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/allocation", payload, config);
  },
  ALLOCOATION_CHECK: (axiosPrivate, contract_sow_id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/check-allocation/${contract_sow_id}/`, config);
  },
  RESOURCE_SEARCH:(axiosPrivate,payload)=>{
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post("/resource/search/", payload,config);
  }
};
export default AllocationAPI;
