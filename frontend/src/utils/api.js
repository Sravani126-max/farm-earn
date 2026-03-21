import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
        ? 'https://farm-earn.onrender.com/api' 
        : 'http://localhost:5000/api');

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally 
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        
        // Skip toast for intentional 404s during Google sign-in checks
        const isAuthCheck = error.config?.url === '/auth/login' && error.response?.status === 404;
        
        if (!isAuthCheck) {
            toast.error(message);
        }

        // Optional: Logout if token is expired or unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; 
        }

        return Promise.reject(error);
    }
);

export default api;
