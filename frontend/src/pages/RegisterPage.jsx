import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Phone, CreditCard, Lock, MapPin, Briefcase, Sprout, Loader2 } from 'lucide-react';

const RegisterPage = () => {
    const location = useLocation();
    const googleUser = location.state?.googleUser;

    const [formData, setFormData] = useState({
        name: googleUser?.name || '',
        email: googleUser?.email || '',
        phone: '',
        aadhar: '',
        password: '',
        confirmPassword: '',
        location: '',
        role: 'Farmer',
        firebaseUid: googleUser?.firebaseUid || null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    
    // If we have a googleUser from navigation state, it means they already 
    // signed in via Google, but lack a MongoDB profile.
    const isProfileCompletion = !!googleUser;

    const { register, loginWithGoogle, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role?.toLowerCase() || 'farmer'}`);
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!isProfileCompletion && formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits');
            return false;
        }
        if (!/^\d{12}$/.test(formData.aadhar)) {
            toast.error('Aadhar number must be exactly 12 digits');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const res = await register(formData);
            toast.success('Registration successful!');
            navigate(`/dashboard/${res.user?.role?.toLowerCase() || formData.role.toLowerCase()}`);
        } catch (error) {
            // Error handled in axios interceptor / auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleSubmitting(true);
            const res = await loginWithGoogle();
            
            if (res.isNewUser) {
                // Populate the form with Google data to complete registration
                setFormData(prev => ({
                    ...prev,
                    name: res.user.name,
                    email: res.user.email,
                    firebaseUid: res.user.firebaseUid
                }));
                // Remove password requirement from UI
                // We don't force a full reload, just update the state
            } else {
                toast.success('Logged in successfully!');
                // navigate handled by useEffect
            }
        } catch (error) {
            console.error("Google Login Error:", error);
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    // Recalculate if it's profile completion based on current state too
    const showPasswordFields = !isProfileCompletion && !formData.firebaseUid;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="flex justify-center text-primary-600">
                    <Sprout className="h-12 w-12" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    {showPasswordFields ? 'Create your account' : 'Complete your profile'}
                </h2>
                {showPasswordFields && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Log in here
                        </Link>
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
                        
                        <form className="space-y-6" onSubmit={handleRegister}>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="John Doe"
                                            disabled={!showPasswordFields}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="john@example.com"
                                            disabled={!showPasswordFields}
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Aadhar Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="aadhar"
                                            value={formData.aadhar}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="123456789012"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="input-field pl-10"
                                            placeholder="City, State"
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Type</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="input-field pl-10 appearance-none bg-white"
                                        >
                                            <option value="Farmer">Farmer</option>
                                            <option value="Buyer">Buyer</option>
                                            <option value="Agent">Agent</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Password fields only show if not using Google */}
                                {showPasswordFields && (
                                    <>
                                        {/* Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Password</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    required
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    required
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="••••••••"
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isGoogleSubmitting}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (showPasswordFields ? 'Create Account' : 'Complete Profile')}
                                </button>
                            </div>
                        </form>

                        {showPasswordFields && (
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="mt-6 gap-3">
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={isSubmitting || isGoogleSubmitting}
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
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
                        )}

                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
