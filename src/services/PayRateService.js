const PayRateAPI = {
  PayRateList: (axiosPrivate) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get("/skillpayrate", config);
  },
  GetPayRate: (axiosPrivate, id) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${localStorage.microsoft_code}`
      }
    };
    return axiosPrivate.get(`/payrate/${id}`, config);
  },
};

export default PayRateAPI;
