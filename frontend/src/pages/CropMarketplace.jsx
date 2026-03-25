import { useState, useEffect } from 'react';
import api from '../utils/api';
import CropCard from '../components/crops/CropCard';
import { Search, Filter, Loader2, Leaf } from 'lucide-react';

const CropMarketplace = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const res = await api.get('/crops/all-crops');
            setCrops(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCrops = crops.filter(crop => {
        const locationStr = crop.location?.address || '';
        const matchesSearch = crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            locationStr.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || crop.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Verified Marketplace</h1>
                    <p className="text-gray-600 mt-2 text-lg">Browse and purchase high-quality crops directly from verified farmers.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-grow min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search crops or locations..."
                            className="input-field pl-10 h-12"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                            className="input-field pl-10 h-12 appearance-none bg-white pr-10"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Available Crops">Available Crops</option>
                            <option value="Useful Crops">Useful Crops</option>
                            <option value="Crops Going To Sell">Crops Going To Sell</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
                    <p className="text-gray-600 font-medium">Loading fresh crops...</p>
                </div>
            ) : filteredCrops.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCrops.map((crop) => (
                        <CropCard key={crop._id} crop={crop} role="Buyer" />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed">
                    <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">No crops found</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">We couldn't find any verified crops matching your criteria. Please try a different search or check back later.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}
                        className="mt-6 text-primary-600 font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default CropMarketplace;
