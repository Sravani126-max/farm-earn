import { MapPin, Calendar, Tag, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CropCard = ({ crop, role, onDelete }) => {
    const navigate = useNavigate();
    const getStatusColor = (status) => {
        switch (status) {
            case 'Verified': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Sold': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified': return <CheckCircle2 className="h-4 w-4 mr-1" />;
            case 'Rejected': return <XCircle className="h-4 w-4 mr-1" />;
            case 'Sold': return <CheckCircle2 className="h-4 w-4 mr-1" />;
            default: return <Clock className="h-4 w-4 mr-1" />;
        }
    };

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
                        onClick={() => navigate('/dashboard/buyer')}
                        className="btn-primary w-full mt-2"
                    >
                        Request Purchase
                    </button>
                )}
                
                {!role && crop.status === 'Verified' && (
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
