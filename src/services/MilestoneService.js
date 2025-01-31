const MilestoneAPI = {
  LIST: (axiosPrivate, clientID) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(`/milestones/${clientID}`, config);
  },

  DETAIL: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(`/milestones/details/${id}`, config);
  },

  ADD: (axiosPrivate, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post("/milestones/", payload, config);
  },

  UPDATE: (axiosPrivate, id, payload) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.patch(`/milestones/details/${id}`, payload, config);
  },

  DELETE: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.delete(`/milestones/details/${id}`, config);
  },
  CHECK:(axiosPrivate,id)=>{
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.post(`/milestone-check/${id}/`, config);
  }
};

export default MilestoneAPI;
