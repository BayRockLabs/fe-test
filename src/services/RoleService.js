const RoleAPI = {
  RoleList: (axiosPrivate) => {
    return axiosPrivate.get("/roles");
  },
  GetRole: (axiosPrivate, id = "") => {
    return axiosPrivate.get(`/roles/${id}`);
  },
  CreateRole: (axiosPrivate, data) => {
    return axiosPrivate.post("/roles", data);
  },
  UpdateRole: (axiosPrivate, id, data) => {
    return axiosPrivate.put(`/roles/${id}`, data);
  },
  DeleteRole: (axiosPrivate, id) => {
    return axiosPrivate.delete(`/roles/${id}`);
  },
  GetPermissions: (axiosPrivate) => {
    return axiosPrivate.get("/permissions");
  },
};

export default RoleAPI;
