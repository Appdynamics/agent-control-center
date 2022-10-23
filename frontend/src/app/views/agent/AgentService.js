import axios from "axios";

export const getAllAgents = (params) => {
  return axios.get(`/v1/appd/agents${params === undefined ? "" : params}`);
};

export const getAgentById = (params) => {
  return axios.get(
    `/v1/appd/agent/${params.applicationId}/${params.applicationComponentNodeId}`
  );
};

export const getAgentVersions = (params) => {
  return axios.get(`/v1/appd/download/getAgentVersions/${params.latest}`);
};

export const createTask = (Task) => {
  return axios.post(`/v1/task/createTask`, Task);
};

export const getAgentHealth = (params) => {
  return axios.get(
    `/v1/appd/health/${params.applicationId}/${params.nodeId}/${params.interval}`
  );
};
