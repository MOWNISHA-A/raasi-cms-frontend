import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, CheckCircle, Clock, Loader2, Edit, Trash2, X } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState([]);

  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [submitNotice, setSubmitNotice] = useState(null);
  const [currentService, setCurrentService] = useState({
    customerName: '', phoneNumber: '', customerEmail: '', deviceType: '', brand: '',
    problemDescription: '', estimatedCost: 0, status: 'Assigned', notes: '',
    technicianAssigned: '', dueDate: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const statuses = [
    'Assigned',
    'In Progress',
    'Waiting for Spare',
    'Completed',
    'Delivered'
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const token = authData?.token;
      const res = await axios.get(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);

      const techRes = await axios.get(`${API_URL}/technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(techRes.data);

      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openModal = (mode, service = null) => {
    setModalMode(mode);
    if (service) {
      setCurrentService(service);
    } else {
      setCurrentService({
        customerName: '', phoneNumber: '', customerEmail: '', deviceType: '', brand: '',
          problemDescription: '', estimatedCost: 0, status: 'Service Request Received', notes: '',
          dueDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);


  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setCurrentService(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(currentService.phoneNumber)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (currentService.customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentService.customerEmail)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    setFormLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const token = authData?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (modalMode === 'add') {
        const res = await axios.post(`${API_URL}/services`, currentService, config);
        setServices([...services, res.data]);
      } else {
        const res = await axios.put(`${API_URL}/services/${currentService._id}`, currentService, config);
        setServices(services.map(s => s._id === currentService._id ? res.data : s));
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving service');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      try {
        const authData = JSON.parse(localStorage.getItem('raasi_auth'));
        const token = authData?.token;
        await axios.delete(`${API_URL}/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setServices(services.filter(s => s._id !== id));
      } catch {
        alert('Failed to delete service');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle size={14}/> {status}</span>;
      case 'Waiting for Spare':
      case 'In Progress':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={14}/> {status}</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock size={14}/> {status}</span>;
    }
  };

  const filteredData = useMemo(() => {
    return services.filter(s => {
      const matchSearch = 
        (s.serviceId && s.serviceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phoneNumber && s.phoneNumber.includes(searchTerm));
      const matchCat = filterStatus ? s.status === filterStatus : true;
      return matchSearch && matchCat;
    });
  }, [services, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Service Tracking</h1>
        <button onClick={() => openModal('add')} className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Plus size={20} /> Create New Service
        </button>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm mb-6 border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Service ID, Customer, or Phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-[200px]"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Filter Status</option>
          {statuses.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>

      {submitNotice && (
        <div
          className={`mb-4 p-3 rounded border text-sm ${
            submitNotice.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-green-50 text-green-800 border-green-200'
          }`}
        >
          {submitNotice.message}
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm">
              <th className="p-4 font-semibold text-gray-700">Service ID</th>
              <th className="p-4 font-semibold text-gray-700">Date</th>
              <th className="p-4 font-semibold text-gray-700">Customer</th>
              <th className="p-4 font-semibold text-gray-700">Device</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" /></td></tr>
            ) : currentData.length > 0 ? (
              currentData.map(s => (
                <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4 font-bold text-secondary">{s.serviceId}</td>
                  <td className="p-4 text-gray-600 truncate">{formatDate(s.createdAt)}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {s.customerName}
                    <div className="text-xs text-gray-500 font-normal">{s.phoneNumber}</div>
                  </td>
                  <td className="p-4 text-gray-600">{s.brand} {s.deviceType}</td>
                  <td className="p-4">{getStatusBadge(s.status)}</td>
                  <td className="p-4 flex justify-center gap-3">
                    <button onClick={() => openModal('edit', s)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No services found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-600">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-white bg-gray-50 text-sm">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-white bg-gray-50 text-sm">Next</button>
          </div>
        </div>
      )}
    </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{modalMode === 'add' ? 'Create Service' : `Edit Service ${currentService.serviceId || ''}`}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input required type="text" name="customerName" value={currentService.customerName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input required type="text" name="phoneNumber" value={currentService.phoneNumber} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                  <input
                    required={modalMode === 'add'}
                    type="email"
                    name="customerEmail"
                    value={currentService.customerEmail || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary/50 outline-none"
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input required type="text" name="brand" value={currentService.brand} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                  <input required type="text" name="deviceType" value={currentService.deviceType} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
                  <textarea required name="problemDescription" value={currentService.problemDescription} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" rows="2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <input type="number" name="estimatedCost" value={currentService.estimatedCost} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Technician</label>
                  <select 
                    name="technicianAssigned" 
                    value={currentService.technicianAssigned?._id || currentService.technicianAssigned} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-primary/50"
                  >
                    <option value="">Select Technician</option>
                    {technicians.map(tech => (
                      <option key={tech._id} value={tech._id}>{tech.name} ({tech.specialization})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Due Date *</label>
                  <input 
                    required 
                    type="date" 
                    name="dueDate" 
                    value={currentService.dueDate ? new Date(currentService.dueDate).toISOString().split('T')[0] : ''} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border border-gray-300 rounded-md outline-none focus:ring-primary/50" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea name="notes" value={currentService.notes} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" rows="2"></textarea>
                </div>
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary hover:bg-orange-600 text-white flex items-center justify-center rounded-md">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
