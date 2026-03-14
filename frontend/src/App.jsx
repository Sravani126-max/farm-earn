import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & UI
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import CropMarketplace from './pages/CropMarketplace';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/marketplace" element={<CropMarketplace />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Dashboards (will be protected later) */}
            <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
            <Route path="/dashboard/agent" element={<AgentDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
