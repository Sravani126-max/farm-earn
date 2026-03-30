import { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Users, Sprout, TrendingUp, BarChart3, ShieldAlert, CheckCircle,
    Trash2, UserX, UserCheck, Loader2, Search, UserPlus, Phone, Mail, User, MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [crops, setCrops] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Add Agent form state
    const [agentForm, setAgentForm] = useState({ name: '', email: '', phone: '', location: '' });
    const [addingAgent, setAddingAgent] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'analytics') {
                const res = await api.get('/users/analytics');
                setStats(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/users');
                setUsers(res.data);
            } else if (activeTab === 'crops') {
                const res = await api.get('/crops/all-crops');
                setCrops(res.data);
            } else if (activeTab === 'agents') {
                const res = await api.get('/users/agents');
                setAgents(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (id, currentBlockedStatus) => {
        try {
            await api.put(`/users/${id}/block`);
            toast.success(`User ${!currentBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
            fetchData();
        } catch (error) {
            // handled
        }
    };

    const handleDeleteCrop = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await api.delete(`/crops/${id}`);
            toast.success('Crop listing removed');
            fetchData();
        } catch (error) {
            // handled
        }
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        if (!agentForm.name || !agentForm.email || !agentForm.phone) {
            toast.error('Please fill in all fields');
            return;
        }
        if (!/^\d{10}$/.test(agentForm.phone)) {
            toast.error('Phone number must be exactly 10 digits');
            return;
        }
        try {
            setAddingAgent(true);
            await api.post('/users/add-agent', agentForm);
            toast.success('Agent added successfully!');
            setAgentForm({ name: '', email: '', phone: '', location: '' });
            fetchData(); // Refresh agents list
        } catch (error) {
            // handled by interceptor
        } finally {
            setAddingAgent(false);
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCrops = crops.filter(c => c.cropName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
                <p className="text-gray-600 mt-1">Global management of users, listings, and system health.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl mb-8 max-w-lg">
                {['analytics', 'users', 'crops', 'agents'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                </div>
            ) : activeTab === 'analytics' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers}</p>
                    </div>
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sprout className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Farmers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.farmers}</p>
                    </div>
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Buyers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.buyers}</p>
                    </div>
                    <div className="card p-8 text-center">
                        <div className="h-14 w-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 font-medium">Agents</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.agents}</p>
                    </div>
                </div>
            ) : activeTab === 'agents' ? (
                <div className="space-y-8">
                    {/* Add Agent Form */}
                    <div className="card p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Add New Agent</h2>
                                <p className="text-sm text-gray-500">Create a new agent account to verify crop listings</p>
                            </div>
                        </div>
                        <form onSubmit={handleAddAgent} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Agent Name"
                                    value={agentForm.name}
                                    onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Agent Email"
                                    value={agentForm.email}
                                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Phone (10 digits)"
                                    value={agentForm.phone}
                                    onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                    required
                                />
                            </div>
                            <div className="relative sm:col-span-3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Agent Office Location (e.g. Village, District)"
                                    value={agentForm.location}
                                    onChange={(e) => setAgentForm({ ...agentForm, location: e.target.value })}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10 p-3"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <button
                                    type="submit"
                                    disabled={addingAgent}
                                    className="w-full sm:w-auto flex justify-center items-center gap-2 py-3 px-8 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {addingAgent ? <Loader2 className="animate-spin h-5 w-5" /> : <><UserPlus className="h-4 w-4" /> Add Agent</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Agents List */}
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search agents..."
                                    className="input-field pl-10 py-1.5 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                                        <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{agent.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{agent.phone}</td>
                                             <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${!agent.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {!agent.isBlocked ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleBlockUser(agent._id, agent.isBlocked)}
                                                    className={`p-2 rounded-lg transition-colors ${!agent.isBlocked ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={!agent.isBlocked ? 'Block Agent' : 'Unblock Agent'}
                                                >
                                                    {!agent.isBlocked ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                No agents found. Add one above to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="input-field pl-10 py-1.5 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                <tr>
                                    {activeTab === 'users' ? (
                                        <>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4">Crop Name</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'users' ? filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                                         <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${!user.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {!user.isBlocked ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                                className={`p-2 rounded-lg transition-colors ${!user.isBlocked ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={!user.isBlocked ? 'Block User' : 'Unblock User'}
                                            >
                                                {!user.isBlocked ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                )) : filteredCrops.map(crop => (
                                    <tr key={crop._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={crop.cropImage} className="h-10 w-10 rounded-lg object-cover" alt="" />
                                                <span className="font-medium text-gray-900">{crop.cropName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">₹{crop.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${crop.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {crop.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCrop(crop._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Listing"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
