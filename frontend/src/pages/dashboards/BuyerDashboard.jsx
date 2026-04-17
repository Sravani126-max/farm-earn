import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShoppingBag, Clock, CheckCircle, XCircle, Search, Package, Phone, ShoppingCart, Mail, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/transactions/buyer');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Requested': return 'bg-yellow-100 text-yellow-700';
            case 'Accepted': return 'bg-purple-100 text-purple-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Buyer Dashboard</h1>
                    <p className="text-gray-600 mt-2">Track your purchase requests and manage your agricultural orders.</p>
                </div>
                <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Browse Marketplace
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="card p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Requests</p>
                        <p className="text-2xl font-bold">{transactions.length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pending</p>
                        <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'Requested').length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Completed</p>
                        <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'Completed').length}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                </div>
            ) : transactions.length > 0 ? (
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div key={transaction._id} className="card p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <img src={transaction.cropId?.cropImage} className="h-20 w-20 object-cover rounded-xl border" alt="" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{transaction.cropId?.cropName}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Farmer: {transaction.farmerId?.name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                                    <div>
                                        <p className="text-gray-400 mb-1">Quantity</p>
                                        <p className="font-bold">{transaction.quantity} qtl</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">Total Price</p>
                                        <p className="font-bold text-primary-600">₹{transaction.totalPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">Date</p>
                                        <p className="font-bold">{new Date(transaction.date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(transaction.status)}`}>
                                        {transaction.status}
                                    </div>
                                    {transaction.status === 'Requested' && (
                                        <p className="text-[10px] text-yellow-600 font-bold animate-pulse text-right">Waiting for response...</p>
                                    )}
                                    {transaction.status === 'Accepted' && (
                                        <p className="text-[10px] text-purple-600 font-bold text-right">Farmer accepted. Ready!</p>
                                    )}
                                </div>
                            </div>

                            {/* Farmer Details Section */}
                            {transaction.farmerId && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Farmer Contact Details</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                            <span className="font-medium">{transaction.farmerId.name}</span>
                                        </div>
                                        {transaction.farmerId.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                                <span>{transaction.farmerId.phone}</span>
                                            </div>
                                        )}
                                        {transaction.farmerId.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                                <span>{transaction.farmerId.email}</span>
                                            </div>
                                        )}
                                        {transaction.farmerId.location && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                                <span>{transaction.farmerId.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card p-20 text-center border-dashed border-2">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-2">Visit the marketplace to start purchasing fresh crops.</p>
                    <Link to="/marketplace" className="btn-primary inline-block mt-6">Visit Marketplace</Link>
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
