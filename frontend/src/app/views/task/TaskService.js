import axios from "axios";

export const getAllTasks = (params) => {
  return axios.get(`/v1/tasks/${params === undefined ? "" : params}`);
};

export const getTaskLog = (params) => {
  return axios.get(`/v1/task/log/${params._id}/${params.typeLog}`);
};
