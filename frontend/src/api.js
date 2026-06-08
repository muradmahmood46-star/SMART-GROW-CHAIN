import axios from 'axios';

const API = axios.create({
  baseURL: 'https://barracuda-manor-splashing.ngrok-free.dev'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

export default API;
