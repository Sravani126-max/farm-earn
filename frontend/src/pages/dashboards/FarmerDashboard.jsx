import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import CropCard from '../../components/crops/CropCard';
import { Plus, X, Upload, Loader2, Package, CheckCircle, Clock, AlertCircle, ShoppingCart, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const FarmerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [crops, setCrops] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        cropName: '',
        quantity: '',
        price: '',
        harvestDate: '',
        cropImage: '',
        description: '',
        farmingMethod: 'Non-Organic',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        fetchMyCrops();
        fetchTransactions();
    }, []);

    const fetchMyCrops = async () => {
        try {
            setLoading(true);
            const res = await api.get('/crops/farmer-crops');
            setCrops(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/farmer');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTransactionStatus = async (id, status) => {
        try {
            setTxLoading(true);
            await api.put(`/transactions/${id}`, { status });
            toast.success(`Transaction ${status.toLowerCase()} successfully!`);
            fetchTransactions();
            fetchMyCrops();
        } catch (error) {
            toast.error('Failed to update transaction status.');
        } finally {
            setTxLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFile = async (lat = 0, lng = 0) => {
            const imgData = new FormData();
            imgData.append('image', file);
            try {
                setUploading(true);
                const res = await api.post('/upload', imgData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setFormData(prev => ({ ...prev, cropImage: res.data.imageUrl, latitude: lat, longitude: lng }));
                toast.success('Image uploaded successfully!' + (lat !== 0 ? ' Location captured.' : ''));
            } catch (error) {
                toast.error('Image upload failed. Please try again.');
            } finally {
                setUploading(false);
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await uploadFile(latitude, longitude);
                },
                async () => {
                    toast.info('Location access denied. Uploading image without GPS data.');
                    await uploadFile();
                },
                { timeout: 10000 }
            );
        } else {
            await uploadFile();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/crops/add-crop', formData);
            toast.success('Crop listed successfully!');
            setIsModalOpen(false);
            setFormData({
                cropName: '',
                quantity: '',
                price: '',
                harvestDate: '',
                cropImage: '',
                description: '',
                farmingMethod: 'Non-Organic',
                latitude: '',
                longitude: ''
            });
            fetchMyCrops();
        } catch (error) {
            // error handled by api interceptor
        }
    };

    const handleDeleteCrop = async (id) => {
        try {
            await api.delete(`/crops/${id}`);
            toast.success('Crop listing deleted.');
            fetchMyCrops();
        } catch (error) {
            // error handled by api interceptor
        }
    };

    const stats = [
        { label: 'Total Crops', value: crops.length, icon: <Package />, color: 'text-blue-600' },
        { label: 'Verified', value: crops.filter(c => c.status === 'Verified').length, icon: <CheckCircle />, color: 'text-green-600' },
        { label: 'Requests', value: transactions.filter(t => t.status === 'Requested').length, icon: <Clock />, color: 'text-purple-600' },
        { label: 'Sold', value: crops.filter(c => c.status === 'Sold').length, icon: <CheckCircle />, color: 'text-blue-600' }
    ];

    const pendingRequests = transactions.filter(t => t.status === 'Requested');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farmer Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your crop listings and track their verification status.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center space-x-2"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Crop</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 flex items-center space-x-4 dark:bg-gray-800 dark:border-gray-700">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Purchase Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <ShoppingCart className="h-6 w-6 text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Requests</h2>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">{pendingRequests.length} New</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingRequests.map((tx) => (
                            <div key={tx._id} className="card p-6 border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-900/10 transition-shadow hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-white dark:bg-gray-800 border p-1 shadow-sm overflow-hidden">
                                            <img src={tx.cropId?.cropImage} alt="" className="h-full w-full object-cover rounded-md" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{tx.cropId?.cropName}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">From: <span className="font-medium text-gray-900 dark:text-gray-200">{tx.buyerId?.name}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                                        <p className="font-bold text-primary-600">₹{tx.totalPrice}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-y dark:border-gray-700 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">Quantity</p>
                                        <p className="font-bold dark:text-white">{tx.quantity} qtl</p>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">Contact Buyer</p>
                                        <p className="font-bold dark:text-white flex items-center gap-1"><Phone className="h-3 w-3" /> {tx.buyerId?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        disabled={txLoading}
                                        onClick={() => handleTransactionStatus(tx._id, 'Accepted')}
                                        className="flex-1 btn-primary py-2 text-sm bg-purple-600 hover:bg-purple-700"
                                    >
                                        Accept Request
                                    </button>
                                    <button 
                                        disabled={txLoading}
                                        onClick={() => handleTransactionStatus(tx._id, 'Cancelled')}
                                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Crop Listings */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Listings</h2>
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
                </div>
            ) : crops.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {crops.map((crop) => (
                        <CropCard key={crop._id} crop={crop} role="Farmer" onDelete={handleDeleteCrop} />
                    ))}
                </div>
            ) : (
                <div className="card p-20 text-center bg-gray-50 dark:bg-gray-800/50 border-dashed border-2 dark:border-gray-700">
                    <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No crops listed yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Start by clicking the "Add New Crop" button above.</p>
                </div>
            )}

            {/* Add Crop Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-200">
                        <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 transition-colors duration-200">
                            <h2 className="text-xl font-bold dark:text-white">List a New Crop</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop Name</label>
                                    <input required name="cropName" value={formData.cropName} onChange={handleInputChange} className="input-field" placeholder="e.g. Basmati Rice" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farming Method</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, farmingMethod: 'Organic' })}
                                            className={`flex-1 py-2 rounded-lg font-medium border transition-colors ${formData.farmingMethod === 'Organic' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-white text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            Organic
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, farmingMethod: 'Non-Organic' })}
                                            className={`flex-1 py-2 rounded-lg font-medium border transition-colors ${formData.farmingMethod === 'Non-Organic' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-white text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            Non-Organic
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity (Quintals)</label>
                                    <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="input-field" placeholder="50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (per Quintal ₹)</label>
                                    <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="input-field" placeholder="2500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harvest Date</label>
                                    <input required type="date" name="harvestDate" value={formData.harvestDate} onChange={handleInputChange} className="input-field dark:[color-scheme:dark]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleInputChange} className="input-field h-24 resize-none" placeholder="Details about quality, variety, etc."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Crop Image & Location <span className="text-red-500">*</span></label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                                    {formData.cropImage ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                            <img src={formData.cropImage} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                Location Captured ✓
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, cropImage: '', latitude: '', longitude: '' })}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <div className="mx-auto h-16 w-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <label className="relative cursor-pointer rounded-md font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500">
                                                    <span>Click to upload crop image</span>
                                                    <input required type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">Choose from gallery or take a photo. Location will be automatically attached.</p>
                                        </div>
                                    )}
                                </div>
                                {uploading && <div className="mt-2 flex items-center text-sm text-primary-600 dark:text-primary-400"><Loader2 className="animate-spin h-4 w-4 mr-2" /> Uploading...</div>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full btn-primary py-3 text-lg"
                                >
                                    List Crop Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
