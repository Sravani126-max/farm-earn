import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Sprout, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const { loginWithGoogle, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role?.toLowerCase() || 'farmer'}`);
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleSubmitting(true);
            const res = await loginWithGoogle();
            
            if (res.isNewUser) {
                // The user needs to complete their profile (add role, phone, aadhar, location)
                toast.info("Please complete your profile to finish registration.");
                // We pass the google user details to the register page via state
                navigate('/register', { state: { googleUser: res.user } });
            } else {
                toast.success('Logged in successfully!');
                // navigation handled by useEffect
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            // toast might be handled in api interceptor, but we log it here just in case
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-primary-600">
                    <Sprout className="h-12 w-12" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10 text-center">
                    <p className="text-gray-600 mb-6">Log in to your account using Google.</p>
                    
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleSubmitting}
                        className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGoogleSubmitting ? (
                            <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fillRule="evenodd"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fillRule="evenodd"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fillRule="evenodd"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fillRule="evenodd"
                                    />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
