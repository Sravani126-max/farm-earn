import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Phone, CreditCard, MapPin, Briefcase, User, Mail, Sprout, Loader2 } from 'lucide-react';

const ProfileCreationPage = () => {
    const locationHook = useLocation();
    const navigate = useNavigate();
    const { registerProfile, user } = useContext(AuthContext);
    
    // The data passed from the Google Login step
    const firebaseUserData = locationHook.state?.firebaseUserData || {};
    
    const [formData, setFormData] = useState({
        name: firebaseUserData.name || '',
        email: firebaseUserData.email || '',
        phone: '',
        aadhar: '',
        location: '',
        role: 'Farmer',
        firebaseUid: firebaseUserData.firebaseUid || '',
        profileImage: firebaseUserData.profileImage || 'no-photo.jpg'
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user && user.role && !user.isBlocked) {
            navigate(`/dashboard/${user.role.toLowerCase()}`);
        }
        
        // If they navigated here directly without Google Auth data, redirect to login
        if (!firebaseUserData.firebaseUid && !user) {
            toast.error('Please log in with Google first.');
            navigate('/login');
        }
    }, [user, navigate, firebaseUserData.firebaseUid]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits');
            return false;
        }
        if (!/^\d{12}$/.test(formData.aadhar)) {
            toast.error('Aadhar number must be exactly 12 digits');
            return false;
        }
        if (!formData.location.trim()) {
            toast.error('Location is required');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const res = await registerProfile(formData);
            toast.success('Profile created successfully!');
            // Navigation is handled by the useEffect hook once the AuthContext updates
        } catch (error) {
            // Error typically handled by api interceptor
            toast.error(error?.response?.data?.message || 'Failed to create profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="flex justify-center text-primary-600">
                    <Sprout className="h-12 w-12" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Complete your profile
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Just a few more details to set up your account
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
                        <form className="space-y-6" onSubmit={handleRegister}>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                {/* Full Name (Readonly from Google) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            readOnly
                                            type="text"
                                            value={formData.name}
                                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm pl-10 p-3 text-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Email (Readonly from Google) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            readOnly
                                            type="email"
                                            value={formData.email}
                                            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm pl-10 p-3 text-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
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
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                {/* Aadhar Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Aadhar Number *</label>
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
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                            placeholder="123456789012"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location *</label>
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
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                            placeholder="City, State"
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Type *</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3 bg-white"
                                        >
                                            <option value="Farmer">Farmer</option>
                                            <option value="Buyer">Buyer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Profile'}
                                </button>
                            </div>
                        </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileCreationPage;
