import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    // Fetch latest profile to ensure they aren't blocked
                    const res = await api.get('/users/profile');
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (error) {
                    console.error("Auth check failed:", error);
                    logout(); // handles 401/403 via interceptor too, but good to be explicit
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const loginWithGoogle = async () => {
        try {
            toast.info('Opening Google popup...', { toastId: 'googlePopup', autoClose: 4000 });
            const result = await signInWithPopup(auth, googleProvider);
            toast.dismiss('googlePopup');
            const firebaseUser = result.user;
            
            try {
                // Check if user exists in backend
                toast.info('Authenticating with backend... (This may take up to 50s if the server is asleep)', { toastId: 'backendAuth', autoClose: 5000 });
                const res = await api.post('/auth/login', { 
                    firebaseUid: firebaseUser.uid,
                    email: firebaseUser.email 
                });
                toast.dismiss('backendAuth');
                // If successful (user exists), log them in
                if (res.data.token) localStorage.setItem('token', res.data.token);
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
                return { isNewUser: false, data: res.data };
            } catch (backendError) {
                toast.dismiss('backendAuth');
                // If backend returns 404, the user needs to complete their profile
                if (backendError.response && backendError.response.status === 404) {
                    return {
                        isNewUser: true,
                        firebaseUserData: {
                            name: firebaseUser.displayName,
                            email: firebaseUser.email,
                            firebaseUid: firebaseUser.uid,
                            profileImage: firebaseUser.photoURL || 'no-photo.jpg'
                        }
                    };
                }
                throw backendError;
            }
        } catch (error) {
            console.error("Firebase Login Error:", error);
            throw error;
        }
    };

    const registerProfile = async (userData) => {
        const res = await api.post('/auth/register', userData);
        
        const token = res.data.token || res.data.user?.token;
        const userDataFromBackend = res.data.user || res.data;
        
        if (token) localStorage.setItem('token', token);
        setUser(userDataFromBackend);
        localStorage.setItem('user', JSON.stringify(userDataFromBackend));
        return res.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Also sign out from firebase
        auth.signOut().catch(console.error);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, registerProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
