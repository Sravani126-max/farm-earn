import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
        ? 'https://farm-earn.onrender.com/api' 
        : 'http://localhost:5000/api');

// Check if axios is defined (defensive for some build environments)
if (typeof axios === 'undefined') {
    console.error('Axios is undefined in api.js. Check your installation and imports.');
}

const apiInstance = (axios.default || axios);

const api = apiInstance.create({
    baseURL,
    timeout: 60000, // 60 seconds timeout specifically to allow free Render limits, but preventing infinite hangs
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
        const isAuthCheck = error.config?.url?.includes('/auth/login') && error.response?.status === 404;
        
        // Skip toast for missing notifications endpoint
        const isNotificationCheck = error.config?.url?.includes('/notifications') && error.response?.status === 404;
        
        if (!isAuthCheck && !isNotificationCheck) {
            toast.error(message);
        }

        // Logout if token is expired (401) or account is explicitly blocked (403 with specific message)
        const isAuthError = error.response?.status === 401;
        const isBlockedError = error.response?.status === 403 && message.toLowerCase().includes('blocked');
        
        if (isAuthError || isBlockedError) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Note: We don't use window.location.href here as it causes hard reloads 
            // and wipes AuthContext state. ProtectedRoute handles the redirect.
        }

        return Promise.reject(error);
    }
);

export default api;
