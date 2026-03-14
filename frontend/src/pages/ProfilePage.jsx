import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Phone, CreditCard, MapPin, Briefcase, Package, ShoppingBag, TrendingUp, Loader2, ArrowRight, AlertCircle, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        listed: 0,
        sold: 0,
        bought: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);
                // 1. Fetch full user profile details
                const profileRes = await api.get('/users/profile');
                setProfile(profileRes.data);

                // 2. Fetch stats based on roles
                if (profileRes.data.role === 'Farmer') {
                    const cropsRes = await api.get('/crops/farmer-crops');
                    const transRes = await api.get('/transactions/farmer');
                    setStats({
                        listed: cropsRes.data?.length || 0,
                        sold: transRes.data?.filter(t => t.status === 'Completed').length || 0,
                        bought: 0
                    });
                } else if (profileRes.data.role === 'Buyer') {
                    const transRes = await api.get('/transactions/buyer');
                    setStats({
                        listed: 0,
                        sold: 0,
                        bought: transRes.data?.filter(t => t.status === 'Completed').length || 0
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.response?.data?.message || err.message || "Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        if (authUser) {
            fetchProfileData();
        } else {
            setLoading(false);
        }
    }, [authUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-md w-full p-8 text-center">
                    <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full">Try Again</button>
                    <Link to="/" className="block mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">Back to Home</Link>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-md w-full p-8 text-center">
                    <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find your profile details. Please make sure you are logged in correctly.</p>
                    <Link to="/login" className="btn-primary inline-block w-full">Go to Login</Link>
                </div>
            </div>
        );
    }

    const infoItems = [
        { label: 'Full Name', value: profile.name, icon: <User className="h-5 w-5" /> },
        { label: 'Email Address', value: profile.email, icon: <Mail className="h-5 w-5" /> },
        { label: 'Phone Number', value: profile.phone, icon: <Phone className="h-5 w-5" /> },
        { label: 'Aadhar Number', value: profile.aadhar, icon: <CreditCard className="h-5 w-5" /> },
        { label: 'Location', value: profile.location, icon: <MapPin className="h-5 w-5" /> },
        { label: 'Account Role', value: profile.role, icon: <Briefcase className="h-5 w-5" /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
                <p className="mt-2 text-lg text-gray-600">View and manage your account details and marketplace activity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
                        <div className="px-8 pb-10">
                            <div className="relative -mt-16 mb-8">
                                <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-lg border border-gray-50">
                                    <div className="h-full w-full rounded-[1.25rem] bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold">
                                        {profile.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-24 bg-green-500 border-4 border-white h-6 w-6 rounded-full shadow-sm" title="Verified Account"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                {infoItems.map((item, idx) => (
                                    <div key={idx} className="flex items-start space-x-4">
                                        <div className="mt-0.5 p-2.5 rounded-2xl bg-gray-50 text-gray-400 group-hover:text-primary-600 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                            <p className="text-lg font-bold text-gray-900">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <TrendingUp className="h-6 w-6 text-primary-600 mr-2" />
                            Activity Review
                        </h3>
                        
                        <div className="space-y-4">
                            {profile.role === 'Farmer' && (
                                <>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                        <div className="flex items-center">
                                            <Package className="h-5 w-5 text-blue-600 mr-3" />
                                            <span className="font-bold text-gray-700">Crops Listed</span>
                                        </div>
                                        <span className="text-2xl font-black text-blue-700">{stats.listed}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-100">
                                        <div className="flex items-center">
                                            <ShoppingBag className="h-5 w-5 text-green-600 mr-3" />
                                            <span className="font-bold text-gray-700">Crops Sold</span>
                                        </div>
                                        <span className="text-2xl font-black text-green-700">{stats.sold}</span>
                                    </div>
                                </>
                            )}
                            
                            {profile.role === 'Buyer' && (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 border border-purple-100">
                                    <div className="flex items-center">
                                        <ShoppingBag className="h-5 w-5 text-purple-600 mr-3" />
                                        <span className="font-bold text-gray-700">Crops Bought</span>
                                    </div>
                                    <span className="text-2xl font-black text-purple-700">{stats.bought}</span>
                                </div>
                            )}

                            <Link 
                                to={`/dashboard/${profile.role.toLowerCase()}`}
                                className="mt-4 w-full flex items-center justify-center p-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold text-amber-900 mb-2 font-display">Need Help?</h4>
                            <p className="text-amber-700 text-sm leading-relaxed mb-4">
                                If you need to update your identity details like Aadhar or Phone number, please contact support for verification.
                            </p>
                            <button className="text-sm font-black text-amber-900 uppercase tracking-tighter flex items-center">
                                Contact Support
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Sprout className="h-32 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
