import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sprout, LogOut, User, LayoutDashboard, Menu, X, Settings, Moon, Sun, Bell, ShieldCheck } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../utils/api';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        setShowDropdown(false);
        navigate('/login');
    };

    const dashboardLink = user ? `/dashboard/${user.role.toLowerCase()}` : '/login';

    return (
        <nav className="fixed w-full top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-500">
                    <Sprout className="h-8 w-8" />
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Farm<span className="text-primary-600 dark:text-primary-500">Earn</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
                    <Link to="/marketplace" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Marketplace</Link>
                    <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About Us</Link>
                </div>

                {/* Auth / Profile Area */}
                <div className="hidden md:flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {user ? (
                        <div className="flex items-center space-x-4">
                            {/* Admin Controls Button - Only for Admin users */}
                            {user.role === 'Admin' && (
                                <Link
                                    to="/dashboard/admin"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Admin Controls
                                </Link>
                            )}

                            {/* Notifications Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors relative"
                                    aria-label="Notifications"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden z-50">
                                        <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
                                            Notifications
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(notification => (
                                                    <div key={notification._id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                                        <p className={`text-sm ${!notification.isRead ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleDateString()}</span>
                                                            {!notification.isRead && (
                                                                <button onClick={() => markAsRead(notification._id)} className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
                                                                    Mark as read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                    No notifications yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
                                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-700"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.name.split(' ')[0]}</span>
                                </button>

                                {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden">
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 mb-1">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{user.role}</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link
                                        to={dashboardLink}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/profile?tab=settings"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Log in</Link>
                            <Link to="/login" className="btn-primary flex items-center gap-2 text-sm px-6">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center space-x-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white p-2">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pt-2 pb-6 space-y-2 shadow-lg">
                    {user?.role === 'Admin' && (
                        <Link 
                            to="/dashboard/admin" 
                            onClick={() => setIsOpen(false)} 
                            className="block px-3 py-3 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-md"
                        >
                            <ShieldCheck className="h-5 w-5" />
                            Admin Control Panel
                        </Link>
                    )}
                    <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Home</Link>
                    <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Marketplace</Link>
                    {user ? (
                        <>
                            <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">My Profile</Link>
                            <Link to="/profile?tab=settings" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Settings</Link>
                            <Link to={dashboardLink} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg">Dashboard</Link>
                            <button onClick={handleLogout} className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Logout</button>
                        </>
                    ) : (
                        <div className="pt-4 flex flex-col gap-2">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl">Log in</Link>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center px-3 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl">Get Started</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
