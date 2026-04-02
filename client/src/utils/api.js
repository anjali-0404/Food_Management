import axios from 'axios';

const resolveApiBaseUrl = () => {
  const configured = process.env.REACT_APP_API_URL;

  // Default to relative /api if no URL is provided
  if (!configured || configured.trim() === '') return '/api';

  const trimmed = configured.replace(/\/$/, '');
  
  // If it's an absolute URL and doesn't end with /api, append it.
  if (/^https?:\/\//i.test(trimmed) && !trimmed.toLowerCase().endsWith('/api')) {
    return `${trimmed}/api`;
  }

  return trimmed;
};

const API = axios.create({
  baseURL: resolveApiBaseUrl()
});

// Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('foodbridge_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const register = (data)         => API.post('/auth/register', data);
export const login    = (data)         => API.post('/auth/login', data);
export const getMe    = ()             => API.get('/auth/me');
export const updateLocation = (data)   => API.put('/auth/update-location', data);

// Donations
export const getDonations       = (params) => API.get('/donations', { params });
export const getNearbyDonations = (params) => API.get('/donations/nearby', { params });
export const getDonation        = (id)     => API.get(`/donations/${id}`);
export const createDonation     = (data)   => API.post('/donations', data);
export const acceptDonation     = (id)     => API.put(`/donations/${id}/accept`);
export const updateStatus       = (id, d)  => API.put(`/donations/${id}/status`, d);
export const getMyDonations     = ()       => API.get('/donations/my/donations');

// Stats
export const getStats = () => API.get('/stats');

// NGOs
export const getNGOs        = ()       => API.get('/ngos');
export const getNearbyNGOs  = (params) => API.get('/ngos/nearby', { params });

// Users
export const getLeaderboard = () => API.get('/users/leaderboard');
export const updateProfile  = (d) => API.put('/users/profile', d);

export default API;
