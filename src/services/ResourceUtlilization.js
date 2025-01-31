const RESOURCE = {
  UTLIZATION_REPORT: (axiosPrivate, start_date, end_date) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/employees/utilization-by-range?start_date=${start_date}&end_date=${end_date}&response_type=json`,
      config
    );
  },
};
export default RESOURCE;
