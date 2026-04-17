import { MapPin, Calendar, Tag, CheckCircle2, XCircle, Clock, Trash2, ShoppingCart, Loader2, User, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CropCard = ({ crop, role, onDelete, onClaim }) => {
    const navigate = useNavigate();
    const [requesting, setRequesting] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Verified': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Sold': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Purchasal in progress': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified': return <CheckCircle2 className="h-4 w-4 mr-1" />;
            case 'Rejected': return <XCircle className="h-4 w-4 mr-1" />;
            case 'Sold': return <CheckCircle2 className="h-4 w-4 mr-1" />;
            case 'Purchasal in progress': return <Clock className="h-4 w-4 mr-1" />;
            default: return <Clock className="h-4 w-4 mr-1" />;
        }
    };

    const handleRequestPurchase = async () => {
        const quantity = prompt(`Enter quantity to purchase (Max: ${crop.quantity} quintals):`, crop.quantity);
        
        if (quantity === null) return;
        
        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0 || qtyNum > crop.quantity) {
            toast.error('Invalid quantity entered.');
            return;
        }

        try {
            setRequesting(true);
            await api.post('/transactions/request', {
                cropId: crop._id,
                quantity: qtyNum
            });
            toast.success('Purchase request sent to the farmer!');
            navigate('/dashboard/buyer');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to send purchase request.');
        } finally {
            setRequesting(false);
        }
    };

    const farmer = crop.farmerId;

    return (
        <div className="card group hover:shadow-md transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={crop.cropImage || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1470&auto=format&fit=crop'}
                    alt={crop.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1470&auto=format&fit=crop';
                    }}
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border flex items-center shadow-sm ${getStatusColor(crop.status)}`}>
                    {getStatusIcon(crop.status)}
                    {crop.status}
                </div>
                {role === 'Farmer' && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this crop listing?')) {
                                onDelete(crop._id);
                            }
                        }}
                        className="absolute top-4 left-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-colors"
                        title="Delete Crop"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{crop.cropName}</h3>
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">₹{crop.price}/quintal</span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span>{crop?.category || 'General'}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span>Quantity: {crop?.quantity || 0} quintals</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span>Harvest: {crop?.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="line-clamp-1">{crop?.location?.address || (crop?.location?.coordinates?.[0] ? 'Location Captured' : 'No location')}</span>
                    </div>
                </div>

                {/* Farmer Details Toggle - visible for Buyer, Agent, Admin roles */}
                {farmer && typeof farmer === 'object' && (role === 'Buyer' || role === 'Agent' || role === 'Admin') && (
                    <div className="mb-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 transition-colors"
                        >
                            <User className="h-3.5 w-3.5" />
                            {showDetails ? 'Hide Farmer Details' : 'View Farmer Details'}
                        </button>
                        {showDetails && (
                            <div className="mt-2 p-3 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 rounded-xl border border-primary-100 dark:border-gray-600 space-y-1.5 text-xs animate-fadeIn">
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <User className="h-3.5 w-3.5 text-primary-500" />
                                    <span className="font-bold">{farmer.name}</span>
                                </div>
                                {farmer.phone && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Phone className="h-3.5 w-3.5 text-primary-500" />
                                        <span>{farmer.phone}</span>
                                    </div>
                                )}
                                {farmer.email && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Mail className="h-3.5 w-3.5 text-primary-500" />
                                        <span>{farmer.email}</span>
                                    </div>
                                )}
                                {farmer.location && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                                        <span>{farmer.location}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Fix Me button for Agent on pending crops */}
                {role === 'Agent' && crop.status === 'Pending verification' && !crop.claimedByAgent && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClaim && onClaim(crop._id); }}
                        className="w-full mt-2 mb-2 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        🔧 Fix Me — I'll Verify This
                    </button>
                )}

                {/* Show "Claimed by you" badge if agent already claimed it */}
                {role === 'Agent' && crop.claimedByAgent && (
                    <div className="w-full mt-2 mb-2 py-2 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center text-xs font-bold rounded-xl border border-green-200 dark:border-green-800">
                        ✅ Claimed by you — Ready for verification
                    </div>
                )}

                {role === 'Agent' && crop.status === 'Pending verification' && (
                    <button 
                        onClick={() => navigate('/dashboard/agent', { state: { verifyCropId: crop._id } })}
                        className="btn-primary w-full mt-2"
                    >
                        Verify Crop Now
                    </button>
                )}

                {role === 'Buyer' && crop.status === 'Verified' && (
                    <button 
                        onClick={handleRequestPurchase}
                        disabled={requesting}
                        className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                    >
                        {requesting ? <Loader2 className="animate-spin h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                        {requesting ? 'Processing...' : 'Request Purchase'}
                    </button>
                )}

                {role === 'Buyer' && crop.status === 'Purchasal in progress' && (
                    <div className="w-full mt-2 p-2 bg-purple-50 text-purple-700 text-center text-sm font-bold rounded-lg border border-purple-100">
                        Purchasal in progress
                    </div>
                )}
                
                {(role === 'Guest' || !role) && crop.status === 'Verified' && (
                    <button 
                        onClick={() => navigate('/login')}
                        className="btn-primary w-full mt-2"
                    >
                        Login to Purchase
                    </button>
                )}
            </div>
        </div>
    );
};

export default CropCard;
