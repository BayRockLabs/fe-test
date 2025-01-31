const EstimationAPI = {
  LIST: (axiosPrivate, clientID, pageNumber, pageSize) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(
      `/estimation/${clientID}/?page=${pageNumber}&page_size=${pageSize}`, config
    );
  },
  AddEstimation: (axiosPrivate, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post("/estimation", payload, config);
  },

  UpdateEstimation: (axiosPrivate, id, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.put(`/estimation/details/${id}`, payload, config);
  },

  GetDetail: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get("/estimation/details/" + id, config);
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.delete("/estimation/details/" + id, config);
  },
  GETESTPAYRATE:(axiosPrivate)=>{
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get("/ratecards/", config);
  }
};

export default EstimationAPI;
