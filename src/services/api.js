import axios from 'axios';

const DEFAULT_NODE = 'http://127.0.0.1:8080';

export const getHealth = async (nodeUrl = DEFAULT_NODE) => {
  const response = await axios.get(`${nodeUrl}/api/health`);
  return response.data;
};

export const getPeers = async (nodeUrl = DEFAULT_NODE) => {
  const response = await axios.get(`${nodeUrl}/api/peers`);
  return response.data;
};

export const getGraph = async (nodeUrl = DEFAULT_NODE) => {
  const response = await axios.get(`${nodeUrl}/api/graph`);
  return response.data;
};

export const uploadFile = async (nodeUrl = DEFAULT_NODE, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${nodeUrl}/api/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return response.data;
};

export const searchCID = async (nodeUrl = DEFAULT_NODE, cid) => {
  const response = await axios.get(`${nodeUrl}/api/search`, { params: { cid } });
  return response.data;
};

export const getDownloadUrl = (nodeUrl = DEFAULT_NODE, cid) => {
  return `${nodeUrl}/api/download?cid=${encodeURIComponent(cid)}`;
};

export const getCatalog = async (nodeUrl = DEFAULT_NODE) => {
  const response = await axios.get(`${nodeUrl}/api/catalog`);
  return response.data;
};
