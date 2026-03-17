import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Wrench, FileText, CreditCard, LogOut, Bell, Settings, ClipboardList } from 'lucide-react';

const AdminSidebar = ({ isMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('raasi_auth');
    navigate('/admin-login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Wrench size={20} /> },
    { name: 'Technicians', path: '/admin/technicians', icon: <Users size={20} /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <Package size={20} /> },
    { name: 'Spare Parts', path: '/admin/spare-requests', icon: <Package size={20} /> },
    { name: 'Billing', path: '/admin/billing', icon: <CreditCard size={20} /> },
    { name: 'Invoices', path: '/admin/invoices', icon: <FileText size={20} /> },
    { name: 'History Reports', path: '/admin/history-reports', icon: <ClipboardList size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div className={`${isMobile ? 'flex w-full' : 'hidden lg:flex w-64'} bg-secondary text-white min-h-screen flex-col shadow-lg shrink-0`}>
      <div className="p-6 border-b border-secondary-light">
        <h2 className="text-xl font-bold text-primary">Raasi Admin</h2>
      </div>
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                isActive ? 'bg-primary text-white font-bold' : 'text-gray-300 hover:bg-secondary-light hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
      <div className="p-4 border-t border-secondary-light">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
