
const ContractAPI = {
  LIST: (axiosPrivate, id, pageNumber, pageSize) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(
      `/contractsow/${id}/?page=${pageNumber}&page_size=${pageSize}`, config
    );
  },

  ADD: (axiosPrivate, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post("/contractsow/", payload, config);
  },

  UPDATE: (axiosPrivate, id, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.patch(`/contractsow/details/${id}/`, payload, config);
  },

  DETAIL: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(`/contractsow/details/${id}/`, config);
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.delete(`/contractsow/details/${id}/`, config);
  },
  CHECK:(axiosPrivate,payload)=>{
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post(`/contractsow-check/`, payload, config);
  },
  MILESTONENAMECHECK:(axiosPrivate,payload)=>{
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post(`milestone-name-check/`, payload, config);

  }
};

export default ContractAPI;
