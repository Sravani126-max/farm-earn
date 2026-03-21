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
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error("Error parsing user profile:", error);
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            
            try {
                // Check if user exists in backend
                const res = await api.post('/auth/login', { firebaseUid: firebaseUser.uid });
                // If successful (user exists), log them in
                if (res.data.token) localStorage.setItem('token', res.data.token);
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
                return { isNewUser: false, data: res.data };
            } catch (backendError) {
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
        if (res.data.token) localStorage.setItem('token', res.data.token);
        setUser(res.data.user || res.data); // Depending on your backend response format
        localStorage.setItem('user', JSON.stringify(res.data.user || res.data));
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
