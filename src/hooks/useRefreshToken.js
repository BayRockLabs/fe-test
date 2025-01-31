import axios from "../services/axios";

const useRefreshToken = () => {
  const refresh = async () => {
    const response = await axios.post("/token/refresh/", {
      refresh: localStorage.getItem('refresh') || '',
    });
    localStorage.setItem('refresh', response.data.refresh)
    localStorage.setItem('access', response.data.access)
    return response.data.access;
  };

  return refresh
};

export default useRefreshToken;
