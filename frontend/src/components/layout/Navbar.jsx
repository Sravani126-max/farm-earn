import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sprout, LogOut, User, LayoutDashboard, Menu, X, ShoppingCart } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        setShowDropdown(false);
        navigate('/login');
    };

    const dashboardLink = user ? `/dashboard/${user.role.toLowerCase()}` : '/login';

    return (
        <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 text-primary-600">
                    <Sprout className="h-8 w-8" />
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Farm<span className="text-primary-600">Earn</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
                    <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
                    <Link to="/marketplace" className="text-gray-600 hover:text-primary-600 transition-colors">Marketplace</Link>
                    <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">About Us</Link>
                </div>

                {/* Auth / Profile Area */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-gray-900">{user.name.split(' ')[0]}</span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user.role}</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link
                                        to={dashboardLink}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 font-medium"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-primary-600">Log in</Link>
                            <Link to="/register" className="btn-primary flex items-center gap-2 text-sm px-6">
                                Join Now
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-700 p-2">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-lg">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Home</Link>
                    <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Marketplace</Link>
                    {user ? (
                        <>
                            <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">My Profile</Link>
                            <Link to={dashboardLink} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-primary-600 bg-primary-50 rounded-lg">Dashboard</Link>
                            <button onClick={handleLogout} className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
                        </>
                    ) : (
                        <div className="pt-4 flex flex-col gap-2">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center px-3 py-3 text-base font-medium text-gray-700 bg-gray-50 rounded-xl">Log in</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center px-3 py-3 text-base font-medium text-white bg-primary-600 rounded-xl">Register</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
