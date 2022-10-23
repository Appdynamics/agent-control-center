import axios from "axios";

export const getAllKeys = () => {
  return axios.get("/v1/keys");
};

export const getKeyById = (id) => {
  return axios.get(`/v1/key/${id}`);
};

export const deleteKey = (Key) => {
  return axios.delete(`/v1/key/${Key._id}`, Key);
};

export const addNewKey = (Key) => {
  return axios.post("/v1/key", Key);
};

export const updateKey = (Key) => {
  return axios.put(`/v1/key/${Key._id}`, Key);
};
