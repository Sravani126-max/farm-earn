import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import api from '../utils/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get token for backend API authentication
                    const token = await firebaseUser.getIdToken();
                    localStorage.setItem('token', token);
                    
                    // Fetch full user profile from backend (Role, Aadhar, etc)
                    const res = await api.post('/auth/login', { firebaseUid: firebaseUser.uid });
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // It's possible the user logged in with Google but hasn't registered their extra details yet.
                    // We handle that in the components if user is null but auth is signed in.
                    setUser(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('token', token);
        
        const res = await api.post('/auth/login', { firebaseUid: userCredential.user.uid });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    };

    const loginWithGoogle = async () => {
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('token', token);
            
            try {
                // Attempt to login. If they don't exist in MongoDB, this will throw an error (404)
                const res = await api.post('/auth/login', { firebaseUid: userCredential.user.uid });
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
                return { user: res.data, isNewUser: false };
            } catch (error) {
                // If the user doesn't exist in MongoDB, we return what we know from Google
                // so the frontend can redirect them to a "complete profile" step
                if (error.response?.status === 404) {
                    return {
                        user: {
                            name: userCredential.user.displayName,
                            email: userCredential.user.email,
                            firebaseUid: userCredential.user.uid,
                            profileImage: userCredential.user.photoURL
                        },
                        isNewUser: true
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to sign in with Google");
            throw error;
        }
    };

    const register = async (userData) => {
        // If they already signed in with Google, we don't need to create a Firebase account again
        // However, this standard register creates a new Firebase email/pass account
        let firebaseUid = userData.firebaseUid;

        if (!firebaseUid) {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            firebaseUid = userCredential.user.uid;
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('token', token);
        }
        
        // Pass extra details to MongoDB backend
        const registerData = {
            ...userData,
            firebaseUid
        };
        
        const res = await api.post('/auth/register', registerData);
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return res.data;
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
