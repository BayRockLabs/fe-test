const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.microsoft_code}`,
  },
});

const ResourceMatricsAPI = {
  EmployeeRoleList: (axiosPrivate) => axiosPrivate.post(`/resource-role-counts/`, getAuthConfig()),
  EmployeeSkillList: (axiosPrivate) => axiosPrivate.post(`/resource-skill-counts/`, getAuthConfig()),
  EmployeeCountryTypeList: (axiosPrivate) => axiosPrivate.post(`/resource-emptype-country-counts/`, getAuthConfig()),
};

export default ResourceMatricsAPI;
