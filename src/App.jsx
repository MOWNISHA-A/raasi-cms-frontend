import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import TrackService from './pages/TrackService';
import Contact from './pages/Contact';
import PublicInventory from './pages/PublicInventory';
import TechDashboard from './pages/TechDashboard';

// Auth Pages
import AdminLogin from './pages/AdminLogin';
import TechLogin from './pages/TechLogin';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import CustomersPage from './pages/CustomersPage';
import InventoryPage from './pages/InventoryPage';
import ServicesPage from './pages/ServicesPage';
import InvoicePage from './pages/InvoicePage';
import TechniciansPage from './pages/TechniciansPage';
import SparePartRequests from './pages/SparePartRequests';
import BillingPage from './pages/BillingPage';
import HistoryReports from './pages/HistoryReports';
import NotificationsPage from './pages/NotificationsPage';
import AppLayout from './components/AppLayout';

// Tech Pages
import TechLayout from './components/TechLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes wrapped in AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="technicians" element={<TechniciansPage />} />
          <Route path="spare-requests" element={<SparePartRequests />} />
          <Route path="history-reports" element={<HistoryReports />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Technician Routes */}
        <Route path="/tech" element={<TechLayout />}>
          <Route path="dashboard" element={<TechDashboard />} />
        </Route>

        {/* Public/Standard Routes with Header/Footer */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="track" element={<TrackService />} />
          <Route path="contact" element={<Contact />} />
          <Route path="inventory" element={<PublicInventory />} />
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="tech-login" element={<TechLogin />} />
          <Route path="login" element={<AdminLogin />} /> {/* Fallback login */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
