import axios from 'axios';

const API = axios.create({
  baseURL: 'https://muradmahmood-smart-grow-chain.hf.space'
}); // <--- Yahan par ye closing bracket aur parenthesis lagana zaroori tha

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // config.headers['ngrok-skip-browser-warning'] = 'true'; // ngrok not used
  return config;
});

export default API;