const TimeSheetAPI = {
  LIST: (axiosPrivate, pageNumber, pageSize) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(
      `/resource/timesheet/?page=${pageNumber}&page_size=${pageSize}`,
      config
    );
  },
  MANAGER_TIMESHEET: (axiosPrivate) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get("/timesheet-manager-notification-count/", config);
  },
  OVERVIEW: (axiosPrivate, id) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.get(`/resource/timesheets/${id}/`, config);
  },
  TIMESHEETMAINPAGE: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/employee-timesheets/`, payload, config);
  },
  TIMESHEET_APPROVALS: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/timesheet-approval-pending/`, payload, config);
  },

  TIMESHEET_APPROVALS_HR_MANAGER: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `/timesheet-approval-pending-hr-manager/`,
      payload,
      config
    );
  },

  MANAGER_NOTIFICATION_COUNT: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `/ts-manager-notification-count/`,
      payload,
      config
    );
  },

  TIMESHEET_ONGOING_ALLOCATEDHRS: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/employee-weekly-status/`, payload, config);
  },
  ADD_TIMESHEET: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/add-employee-timesheet/`, payload, config);
  },
  EMP_TIMESHEET_WEEKWISE_STATUSLIST: (
    axiosPrivate,
    payload,
    pageNumber,
    pageSize
  ) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `employee-timesheet-status/?page=${pageNumber}&page_size=${pageSize}`,
      payload,
      config
    );
  },
  EMP_TIMESHEET_TOTALUNPLANNED_HRS_LIST: (
    axiosPrivate,
    payload,
    pageNumber,
    pageSize
  ) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `employee-unplanned-hours/?page=${pageNumber}&page_size=${pageSize}`,
      payload,
      config
    );
  },
  EMP_TIMESHEET_TOTALTIMEOFF_HRS_LIST: (
    axiosPrivate,
    payload,
    pageNumber,
    pageSize
  ) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `employee-timeoff-hours/?page=${pageNumber}&page_size=${pageSize}`,
      payload,
      config
    );
  },
  TIMESHEET_APPROVER_SEARCH: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/timesheet-approver-search/`, payload, config);
  },
  RECALL_TIMESHEET: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/recall-employee-timesheets/`, payload, config);
  },
  EXPORT_TIMESHEET: (axiosBlobPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosBlobPrivate.post(
      "export-employee-timesheets/",
      payload,
      config
    );
  },
  UPDATE_TIMESHEET_BY_MANAGER: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/update-timesheets-by-manager/`, payload, config);
  },
  UPDATE_TIMESHEET_BY_HR_MANAGER: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(
      `/update-timesheets-by-hr-manager/`,
      payload,
      config
    );
  },
  MISSING_TIMESHEETS: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/employee-missing-timesheets/`, payload, config);
  },

  TIMESHEET_APPROVALS_ADMIN: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/timesheet-admin-list-view/`, payload, config);
  },
  UPDATE_TIMESHEET_BY_ADMIN: (axiosPrivate, payload) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.microsoft_code}`,
      },
    };
    return axiosPrivate.post(`/timesheet-admin-bulk-approval/`, payload, config);
  },
};

export default TimeSheetAPI;
