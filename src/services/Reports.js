const ReportsAPI = {
  RESOURCE_COUNTS: (
    axiosPrivate,
    clientId,
    contractSowId,
    startDate,
    endDate
  ) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("microsoft_code")}`,
      },
    };

    return axiosPrivate.get(
      `/projects/resource-counts/?client_id=${clientId}&contract_sow_id=${contractSowId}&start_date=${startDate}&end_date=${endDate}`,
      config
    );
  },

  BURNDOWN: (axiosPrivate, contractId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("microsoft_code")}`,
      },
    };

    return axiosPrivate.get(`/contracts/${contractId}/burndown`, config);
  },

  FINANCIAL_DATA: (
    axiosPrivate,
    clientId,
    contractSowId,
    startDate,
    endDate,
    responseType = "Json"
  ) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("microsoft_code")}`,
      },
    };

    return axiosPrivate.get(
      `/finance/financial-data/?client_id=${clientId}&contract_sow_id=${contractSowId}&start_date=${startDate}&end_date=${endDate}&response_type=${responseType}`,
      config
    );
  },
};

export default ReportsAPI;
