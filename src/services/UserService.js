import axios from "./axios";

const UserAPI = {
  Register: (data) => {
    return axios.post("/user/register", data);
  },
  Login: (data) => {
    let endPoint = "";
    return axios.post(endPoint, data).then((response) => {
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("access", response.data.access);
      return response;
    });
  },
  ForgotPassword: (data) => {
    return axios.post("/user/request-password-reset", data);
  },
  PasswordReset: (data) => {
    return axios.post("/user/password-reset", data);
  },
  Logout: async (apiCall) => {
    const clearTokens = () => {
      localStorage.removeItem("refresh");
      localStorage.removeItem("access");
    };
    if (!apiCall) {
      clearTokens();
      return Promise.resolve();
    }

    const data = { refresh_token: localStorage.getItem("refresh") };
    return axios.post("/user/logout", data).then((response) => {
      clearTokens();
      return response;
    });
  },
  GetUserDetails: (axiosPrivate) => {
    return axiosPrivate.get("/me");
  },
  UpdateUserDetails: (axiosPrivate, data) => {
    return axiosPrivate.patch("/me", data);
  },
  ChangePassword: (axiosPrivate, data) => {
    return axiosPrivate.post("/user/change-password", data);
  },
  Settings: (axiosPrivate, data) => {
    return axiosPrivate.patch(`/user/preferences`, data);
  },
};

export default UserAPI;
