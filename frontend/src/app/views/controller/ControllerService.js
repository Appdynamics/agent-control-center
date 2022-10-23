import axios from "axios";

export const getControllerByURL = (url) => {
  return axios.post(`/v1/controller/get`, url);
};

export const addNewController = (Controller) => {
  return axios.post("/v1/controller", Controller);
};

export const updateController = (Controller) => {
  return axios.put(`/v1/controller/${Controller._id}`, Controller);
};
