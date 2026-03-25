import { MapPin, Calendar, Tag, CheckCircle2, XCircle, Clock } from 'lucide-react';

const CropCard = ({ crop, role }) => {
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
                    src={crop.cropImage}
                    alt={crop.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border flex items-center shadow-sm ${getStatusColor(crop.status)}`}>
                    {getStatusIcon(crop.status)}
                    {crop.status}
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{crop.cropName}</h3>
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">₹{crop.price}/quintal</span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span>{crop.category}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span>Quantity: {crop.quantity} quintals</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span>Harvest: {new Date(crop.harvestDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="line-clamp-1">{crop.location?.address || 'No location'}</span>
                    </div>
                </div>

                {role === 'Agent' && crop.status === 'Pending verification' && (
                    <button className="btn-primary w-full mt-2">Verify Crop</button>
                )}

                {role === 'Buyer' && crop.status === 'Verified' && (
                    <button className="btn-primary w-full mt-2">Request Purchase</button>
                )}
            </div>
        </div>
    );
};

export default CropCard;
