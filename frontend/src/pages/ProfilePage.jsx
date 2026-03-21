import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Phone, CreditCard, MapPin, Briefcase, Package, ShoppingBag, TrendingUp, Loader2, ArrowRight, AlertCircle, Sprout, Settings as SettingsIcon, Camera, Save } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const { user: authUser } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'settings' ? 'settings' : 'profile';
    const [activeTab, setActiveTab] = useState(initialTab);

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        listed: 0,
        sold: 0,
        bought: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form state for settings
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        profileImage: ''
    });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'settings' || tab === 'profile') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);
                // 1. Fetch full user profile details
                const profileRes = await api.get('/users/profile');
                setProfile(profileRes.data);
                setFormData({
                    name: profileRes.data.name || '',
                    phone: profileRes.data.phone || '',
                    location: profileRes.data.location || '',
                    profileImage: profileRes.data.profileImage || ''
                });

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
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <div className="card max-w-md w-full p-8 text-center dark:bg-gray-800 dark:border-gray-700">
                    <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full shadow-sm">Try Again</button>
                    <Link to="/" className="block mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700">Back to Home</Link>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <div className="card max-w-md w-full p-8 text-center dark:bg-gray-800 dark:border-gray-700">
                    <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">We couldn't find your profile details. Please make sure you are logged in correctly.</p>
                    <Link to="/login" className="btn-primary inline-block w-full shadow-sm">Go to Login</Link>
                </div>
            </div>
        );
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imgData = new FormData();
        imgData.append('image', file);

        try {
            setUploadingImage(true);
            const res = await api.post('/upload', imgData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profileImage: res.data.imageUrl }));
            
            // Auto-save the profile image to the user record
            await api.put('/users/profile', { profileImage: res.data.imageUrl });
            setProfile(prev => ({ ...prev, profileImage: res.data.imageUrl }));
            
            toast.success('Profile picture updated successfully!');
        } catch (error) {
            toast.error('Image upload failed. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await api.put('/users/profile', formData);
            setProfile(res.data);
            toast.success('Profile updated successfully!');
            handleTabChange('profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const infoItems = [
        { label: 'Full Name', value: profile.name, icon: <User className="h-5 w-5" /> },
        { label: 'Email Address', value: profile.email, icon: <Mail className="h-5 w-5" /> },
        { label: 'Phone Number', value: profile.phone, icon: <Phone className="h-5 w-5" /> },
        { label: 'Aadhar Number', value: profile.aadhar, icon: <CreditCard className="h-5 w-5" /> },
        { label: 'Location', value: profile.location, icon: <MapPin className="h-5 w-5" /> },
        { label: 'Account Role', value: profile.role, icon: <Briefcase className="h-5 w-5" /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">View and manage your account details and marketplace activity.</p>
                </div>
                
                {/* Tabs Navigation */}
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm self-start">
                    <button
                        onClick={() => handleTabChange('profile')}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'profile'
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <User className="h-4 w-4" />
                        <span>Overview</span>
                    </button>
                    <button
                        onClick={() => handleTabChange('settings')}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'settings'
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <SettingsIcon className="h-4 w-4" />
                        <span>Settings</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {activeTab === 'profile' ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                            <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
                            <div className="px-8 pb-10">
                                <div className="relative -mt-16 mb-8 flex justify-between items-end">
                                    <div className="relative">
                                        <div className="h-32 w-32 rounded-3xl bg-white dark:bg-gray-800 p-1.5 shadow-lg border border-gray-50 dark:border-gray-700">
                                            {profile.profileImage ? (
                                                <img src={profile.profileImage} alt={profile.name} className="h-full w-full rounded-[1.25rem] object-cover" />
                                            ) : (
                                                <div className="h-full w-full rounded-[1.25rem] bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 text-4xl font-bold">
                                                    {profile.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {profile.isVerified && (
                                            <div className="absolute bottom-2 left-24 bg-green-500 border-4 border-white dark:border-gray-800 h-6 w-6 rounded-full shadow-sm" title="Verified Account"></div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleTabChange('settings')}
                                        className="btn-outline flex items-center text-sm mb-2 shadow-sm"
                                    >
                                        <SettingsIcon className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    {infoItems.map((item, idx) => (
                                        <div key={idx} className="flex items-start space-x-4 group">
                                            <div className="mt-0.5 p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value || <span className="text-gray-300 dark:text-gray-600 italic">Not provided</span>}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your personal information and profile picture.</p>
                            </div>
                            
                            <form onSubmit={handleSaveSettings} className="p-8 space-y-8">
                                {/* Avatar Upload Section */}
                                <div className="flex items-center space-x-6">
                                    <div className="relative h-24 w-24 rounded-2xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                                        {formData.profileImage ? (
                                            <img src={formData.profileImage} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                <User className="h-8 w-8" />
                                            </div>
                                        )}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="btn-outline cursor-pointer inline-flex items-center shadow-sm text-sm">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Change Picture
                                            <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or WEBP. Max size 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleInputChange} 
                                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleInputChange} 
                                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / Address</label>
                                        <input 
                                            type="text" 
                                            name="location" 
                                            value={formData.location} 
                                            onChange={handleInputChange} 
                                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 mt-4">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center mb-2">
                                            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                                            Uneditable Information
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400">Email</span>
                                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{profile.email}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400">Aadhar Number</span>
                                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{profile.aadhar}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400">Role</span>
                                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{profile.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="btn-primary flex items-center"
                                    >
                                        {saving ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Real-time Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-200">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <TrendingUp className="h-6 w-6 text-primary-600 mr-2" />
                            Activity Review
                        </h3>
                        
                        <div className="space-y-4">
                            {profile.role === 'Farmer' && (
                                <>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-center">
                                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                                            <span className="font-bold text-gray-700 dark:text-gray-300">Crops Listed</span>
                                        </div>
                                        <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{stats.listed}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                                        <div className="flex items-center">
                                            <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                                            <span className="font-bold text-gray-700 dark:text-gray-300">Crops Sold</span>
                                        </div>
                                        <span className="text-2xl font-black text-green-700 dark:text-green-400">{stats.sold}</span>
                                    </div>
                                </>
                            )}
                            
                            {profile.role === 'Buyer' && (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                                    <div className="flex items-center">
                                        <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Crops Bought</span>
                                    </div>
                                    <span className="text-2xl font-black text-purple-700 dark:text-purple-400">{stats.bought}</span>
                                </div>
                            )}

                            <Link 
                                to={`/dashboard/${profile.role.toLowerCase()}`}
                                className="mt-4 w-full flex items-center justify-center p-4 rounded-2xl bg-gray-900 dark:bg-primary-600 text-white font-bold hover:bg-gray-800 dark:hover:bg-primary-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-8 border border-amber-100 dark:border-amber-900/30 relative overflow-hidden group transition-colors duration-200">
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-2 font-display">Need Help?</h4>
                            <p className="text-amber-700 dark:text-amber-500/80 text-sm leading-relaxed mb-4">
                                If you need to update your identity details like Aadhar or Role, please contact support for verification.
                            </p>
                            <button className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-tighter flex items-center group-hover:underline">
                                Contact Support
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 dark:opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Sprout className="h-32 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
