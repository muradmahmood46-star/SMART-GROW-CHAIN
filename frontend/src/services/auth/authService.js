import API from '../../api';

export const login = (form) => API.post('/auth/login', form);
export const verify2FA = (tempToken, code) => API.post('/auth/verify-2fa', { temp_token: tempToken, code });
export const register = (form) => API.post('/auth/register', form);
export const verifyOTP = (regToken, otp) => API.post('/auth/register/verify-otp', { reg_token: regToken, otp });