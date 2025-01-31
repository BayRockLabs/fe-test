const UsersAPI = {
  UsersList: (axiosPrivate) => {
    return axiosPrivate.get("/user");
  },
  GetUser: (axiosPrivate, id = "") => {
    return axiosPrivate.get(`/user/${id}`);
  },
  CreateUser: (axiosPrivate, data) => {
    return axiosPrivate.post("/user", data);
  },
  UpdateUser: (axiosPrivate, id, data) => {
    return axiosPrivate.patch(`/user/${id}`, data);
  },
  DeleteUser: (axiosPrivate, id) => {
    return axiosPrivate.delete(`/user/${id}`);
  },
};

export default UsersAPI;
