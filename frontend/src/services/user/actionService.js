import API from '../../api';

export const startAdClick = (adId) => API.post(`/user/click/start/${adId}`);
export const completeAdClick = (adId) => API.post(`/user/click/complete/${adId}`);
export const submitWithdraw = (data) => API.post('/user/withdraw', data);
export const submitDepositRequest = (formData) => API.post('/deposit/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const submitTransfer = (data) => API.post('/user/transfer', data);
export const submitTicket = (data) => API.post('/user/tickets', data);
export const readAllNotifications = () => API.post('/user/notifications/read-all');
export const readNotification = (id) => API.post(`/user/notifications/${id}/read`);
export const readTicket = (id) => API.post(`/user/tickets/${id}/read`);
