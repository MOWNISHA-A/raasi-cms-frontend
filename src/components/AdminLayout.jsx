import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const authRecord = localStorage.getItem('raasi_auth');
  let isAuthorized = false;

  if (authRecord) {
    try {
      const parsed = JSON.parse(authRecord);
      if (parsed.role === 'Admin' && parsed.token) {
        isAuthorized = true;
      }
    } catch {
      isAuthorized = false;
    }
  }

  if (!isAuthorized) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background font-sans">
      {/* Mobile Admin Header */}
      <div className="lg:hidden bg-secondary text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="font-black text-primary uppercase">Raasi Admin</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/10 rounded-lg">
          {isMobileMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-secondary/95 backdrop-blur-sm fixed inset-0 z-50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-primary uppercase">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white text-2xl">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
            <AdminSidebar isMobile />
          </div>
        </div>
      )}

      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
