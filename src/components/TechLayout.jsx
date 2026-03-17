import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, PenTool } from 'lucide-react';

const TechLayout = () => {
  const navigate = useNavigate();
  const authRecord = localStorage.getItem('raasi_auth');
  let isAuthorized = false;
  let userName = 'Technician';

  if (authRecord) {
    try {
      const parsed = JSON.parse(authRecord);
      if ((parsed.role === 'Technician' || parsed.role === 'Admin') && parsed.token) {
        isAuthorized = true;
        userName = parsed.name || 'Technician';
      }
    } catch {
      isAuthorized = false;
    }
  }

  if (!isAuthorized) {
    return <Navigate to="/tech-login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('raasi_auth');
    navigate('/tech-login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <nav className="bg-secondary text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PenTool className="text-primary" />
          <span className="font-bold text-xl">Raasi Tech Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-300">Welcome, {userName}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default TechLayout;
