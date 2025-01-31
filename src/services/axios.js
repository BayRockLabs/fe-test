import axios from "axios";
 
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_ENDPOINT_AUTH_SERVICE =
  process.env?.REACT_APP_PROFILE == "prod"? process.env.REACT_APP_API_ENDPOINT : process.env.REACT_APP_API_ENDPOINT_AUTH_SERVICE;
  console.log("API_ENDPOINT_AUTH_SERVICE " + API_ENDPOINT_AUTH_SERVICE);
const API_ENDPOINT_EXTRACT_SERVICE =
  process.env.REACT_APP_API_ENDPOINT;
 
export default axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": localStorage.getItem("i18nextLng"),
  },
});
 
export const axiosAuthService = axios.create({
  baseURL: API_ENDPOINT_AUTH_SERVICE,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": localStorage.getItem("i18nextLng"),
  },
});
 
export const axiosPrivate = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": localStorage.getItem("i18nextLng"),
  },
});
 
export const axiosExtractService = axios.create({
  baseURL: API_ENDPOINT_EXTRACT_SERVICE,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": localStorage.getItem("i18nextLng"),
  },
});
 
export const axiosBlobPrivate = axios.create({ // Create a separate instance
  baseURL: API_ENDPOINT, // Use your API base URL
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": localStorage.getItem("i18nextLng"),
  },
  responseType: 'blob' // Crucial: set responseType to 'blob'
});

export const createEmp = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target),
    formDataObj = Object.fromEntries(formData.entries());
  console.log(formDataObj);
  const payload = {};
  // create
  console.log("API " + API_ENDPOINT);
  axios
    .post(`${API_ENDPOINT}create-emp/`, payload)
    .then(function (response) {
      alert(response.data + " sucessfully");
      console.log("valid " + response.data);
    })
    .catch(function (error) {
      console.log("err " + error);
    });
};