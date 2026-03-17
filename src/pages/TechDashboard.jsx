import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Clock, CheckCircle, AlertCircle,
  User, Box, Send, Bell
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const TechDashboard = () => {
  const [services, setServices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [spareRequest, setSpareRequest] = useState({ part: '', quantity: 1, reason: '' });
  const [filter, setFilter] = useState('Recently Assigned');
  const [showHistory, setShowHistory] = useState(false);

  const submitSpareRequest = async (e) => {
    e.preventDefault();
    if (!spareRequest.part || !selectedService) return;
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      await axios.post(`${API_URL}/spare-requests`, {
        service: selectedService._id,
        part: spareRequest.part,
        quantity: Number(spareRequest.quantity),
        reason: spareRequest.reason
      }, config);
      alert('Spare part requested successfully!');
      setSelectedService(null);
      setSpareRequest({ part: '', quantity: 1, reason: '' });
      fetchTechData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting spare part');
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchTechData = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      
      const [servRes, invRes, notifRes] = await Promise.all([
        axios.get(`${API_URL}/services`, config),
        axios.get(`${API_URL}/inventory`, config),
        axios.get(`${API_URL}/notifications`, config)
      ]);

      // Filter only assigned services
      setServices(servRes.data);
      setInventory(invRes.data);
      setNotifications(notifRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, config);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  useEffect(() => {
    // Initial fetch and lightweight polling so newly assigned services
    // appear automatically on the technician dashboard.
    fetchTechData();
    const intervalId = setInterval(fetchTechData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` } };
      await axios.put(`${API_URL}/services/${id}`, { status: newStatus }, config);
      fetchTechData();
    } catch {
      alert('Error updating status');
    }
  };

  const authData = JSON.parse(localStorage.getItem('raasi_auth') || '{}');
  const myServices = services.filter(s => {
    const techId = s.technicianAssigned?._id || s.technicianAssigned;
    return techId && techId.toString() === authData._id;
  });

  const activeServices = myServices.filter(s => s.status !== 'Completed' && s.status !== 'Delivered');
  const historyServices = myServices.filter(s => s.status === 'Completed' || s.status === 'Delivered');

  const getFilteredServices = (list) => {
    let sorted = [...list];
    if (filter === 'Recently Assigned') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filter === 'Due Date') {
      sorted.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
    } else if (filter === 'Waiting for Spare') {
      return sorted.filter(s => s.status === 'Waiting for Spare');
    }
    return sorted;
  };

  const displayServices = showHistory ? historyServices : getFilteredServices(activeServices);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isNearDue = (dueDate) => {
    if (!dueDate) return false;
    const diff = new Date(dueDate) - new Date();
    return diff > 0 && diff < 86400000 * 2; // Within 2 days
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading assigned tasks...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black text-secondary uppercase tracking-tighter">Technician Dashboard</h1>
          <p className="text-gray-500 font-medium">Manage your {showHistory ? 'service history' : 'active service tickets'}</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-white border-2 border-gray-100 rounded-2xl text-secondary hover:border-primary transition relative group"
          >
            <Bell size={24} className={unreadCount > 0 ? 'animate-bounce text-primary' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-black text-xs uppercase tracking-widest text-secondary">Notifications</h3>
                <span className="text-[10px] font-bold text-primary">{unreadCount} New</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">No notifications yet</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      onClick={() => markNotificationRead(notif._id)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!notif.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-black ${!notif.isRead ? 'text-secondary' : 'text-gray-500'}`}>{notif.title}</h4>
                        {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center mb-6">
          <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${showHistory ? 'bg-secondary text-white' : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-primary'}`}
          >
              {showHistory ? 'Show Active Tasks' : 'Show Service History'}
          </button>

          {!showHistory && (
            <select 
              className="p-2 border-2 border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>Recently Assigned</option>
              <option>Due Date</option>
              <option>Waiting for Spare</option>
              <option>In Progress</option>
            </select>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Clock className="text-primary" /> {showHistory ? 'Service History' : 'Active Tasks'} ({displayServices.length})
          </h2>
          
          {displayServices.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border-2 border-dashed border-gray-100">
               <CheckCircle className="mx-auto text-gray-200 mb-4" size={48} />
               <p className="text-gray-400 font-bold">{showHistory ? 'No history yet.' : 'All tasks completed! Great job.'}</p>
            </div>
          ) : (
            displayServices.map(service => (
              <div key={service._id} className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition group ${
                isOverdue(service.dueDate) ? 'border-red-500 bg-red-50/10' : 
                isNearDue(service.dueDate) ? 'border-amber-400 bg-amber-50/10' : 'border-gray-50'
              }`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                        isOverdue(service.dueDate) ? 'bg-red-500 text-white' : 
                        isNearDue(service.dueDate) ? 'bg-amber-500 text-white' : 'bg-secondary text-white'
                      }`}>
                        {service.serviceId} {isOverdue(service.dueDate) ? '- OVERDUE' : isNearDue(service.dueDate) ? '- DUE SOON' : ''}
                      </span>
                      <h3 className="text-xl font-black text-secondary mt-2">{service.brand} {service.deviceType}</h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tight ${
                      service.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <User size={16} className="text-primary" />
                            <span className="font-bold">{service.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={16} className="text-primary" />
                            <span>Assigned: {new Date(service.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <AlertCircle size={16} className={isOverdue(service.dueDate) ? 'text-red-500' : 'text-primary'} />
                            <span className={isOverdue(service.dueDate) ? 'font-black text-red-600' : ''}>Due Date: {service.dueDate ? new Date(service.dueDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl italic text-gray-500">
                      "{service.problemDescription}"
                    </div>
                  </div>

                  {!showHistory && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                        {['In Progress', 'Waiting for Spare', 'Completed'].map(status => (
                        <button 
                            key={status}
                            onClick={() => updateStatus(service._id, status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            service.status === status 
                            ? 'bg-secondary text-white shadow-inner' 
                            : 'bg-gray-100 text-gray-500 hover:bg-primary hover:text-white'
                            }`}
                        >
                            {status}
                        </button>
                        ))}
                        <button 
                        onClick={() => setSelectedService(service)}
                        className="ml-auto bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition flex items-center gap-2"
                        >
                        <Box size={14} /> Request Spares
                        </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Spare Request Panel */}
        <div className="lg:col-span-1">
          {selectedService ? (
            <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-primary sticky top-6 animate-in slide-in-from-right-10 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-secondary uppercase">Request Spare Part</h3>
                <button onClick={() => setSelectedService(null)} className="text-gray-400 hover:text-red-500"><AlertCircle /></button>
              </div>
              <p className="text-xs font-bold text-gray-400 mb-6">Service: {selectedService.serviceId}</p>

              <form onSubmit={submitSpareRequest} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Select Part</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none"
                    value={spareRequest.part}
                    onChange={(e) => setSpareRequest({...spareRequest, part: e.target.value})}
                    required
                  >
                    <option value="">Choose part...</option>
                    {inventory.filter(p => p.itemType === 'Spare Part').map(p => (
                      <option key={p._id} value={p._id}>{p.productName} ({p.quantity} available)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Quantity</label>
                    <input 
                      type="number" min="1"
                      className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none text-center font-bold"
                      value={spareRequest.quantity}
                      onChange={(e) => setSpareRequest({...spareRequest, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Send</label>
                    <button type="submit" className="w-full h-[48px] bg-secondary text-white rounded-2xl flex items-center justify-center hover:bg-primary transition shadow-lg">
                      <Send size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Reason</label>
                  <textarea 
                    className="w-full p-3 bg-gray-50 border-none rounded-2xl outline-none h-24 resize-none"
                    placeholder="e.g. Current screen is cracked..."
                    value={spareRequest.reason}
                    onChange={(e) => setSpareRequest({...spareRequest, reason: e.target.value})}
                    required
                  />
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-secondary p-8 rounded-3xl text-white text-center shadow-lg h-fit">
               <Package className="mx-auto mb-4 opacity-50" size={40} />
               <h3 className="font-black uppercase tracking-tight mb-2">Inventory Access</h3>
               <p className="text-sm opacity-60">Select a task on the left to request spare parts from the store inventory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechDashboard;
