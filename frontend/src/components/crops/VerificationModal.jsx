import { useState } from 'react';
import { X, CheckCircle, XCircle, Upload, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const VerificationModal = ({ crop, isOpen, onClose, onRefresh }) => {
    const [report, setReport] = useState('');
    const [status, setStatus] = useState('Verified');
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        try {
            setUploading(true);
            const uploadPromises = files.map(file => {
                const formData = new FormData();
                formData.append('image', file);
                return api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            });

            const results = await Promise.all(uploadPromises);
            const newUrls = results.map(res => res.data.imageUrl);
            setImages([...images, ...newUrls]);
            toast.success('Inspection images uploaded');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!report) {
            toast.error('Please add a verification report');
            return;
        }

        try {
            setSubmitting(true);
            await api.put(`/crops/${crop._id}/verify`, {
                status,
                report,
                inspectionImages: images
            });
            toast.success(`Crop ${status.toLowerCase()} successfully`);
            onRefresh();
            onClose();
        } catch (error) {
            // handled
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-200">
                <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crop Inspection</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verifying: {crop.cropName} by Farmer ID: {crop.farmerId?.name || crop.farmerId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setStatus('Verified')}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${status === 'Verified' ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-green-200 dark:hover:border-green-900'}`}
                        >
                            <CheckCircle className="h-6 w-6" />
                            <span className="font-bold">Accept & Verify</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('Rejected')}
                            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${status === 'Rejected' ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-200 dark:hover:border-red-900'}`}
                        >
                            <XCircle className="h-6 w-6" />
                            <span className="font-bold">Reject</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Verification Report</label>
                        <textarea
                            required
                            className="input-field h-32 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Detail your findings about the crop quality, moisture content, pests (if any), etc."
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Inspection Images (Optional)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {images.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-600">
                                    <img src={url} className="w-full h-full object-cover" alt="Inspection" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full shadow-md"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                                <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">Add Photo</span>
                                <input type="file" className="sr-only" multiple onChange={handleImageUpload} accept="image/*" />
                            </label>
                        </div>
                        {uploading && <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 flex items-center animate-pulse"><Loader2 className="h-3 w-3 animate-spin mr-1" /> Uploading...</p>}
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-xl flex gap-3 text-yellow-800 dark:text-yellow-500">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-xs">By submitting this report, you confirm that you have physically inspected or verified the digital assets provided by the farmer. This report will be visible to potential buyers.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${status === 'Verified' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'} shadow-lg`}
                    >
                        {submitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `Confirm ${status}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerificationModal;
