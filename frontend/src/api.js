import axios from 'axios';

const API = axios.create({
  baseURL: 'https://muradmahmood-smart-grow-chain.hf.space'

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

export default API;
