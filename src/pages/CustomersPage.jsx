import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Loader2, Edit, Trash2, X } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentCustomer, setCurrentCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const token = authData?.token;
      const res = await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentCustomer({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setModalMode('edit');
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer({ name: '', phone: '', email: '', address: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(currentCustomer.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (currentCustomer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentCustomer.email)) {
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
        const res = await axios.post(`${API_URL}/customers`, currentCustomer, config);
        setCustomers([...customers, res.data]);
      } else {
        const res = await axios.put(`${API_URL}/customers/${currentCustomer._id}`, currentCustomer, config);
        setCustomers(customers.map(c => c._id === currentCustomer._id ? res.data : c));
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const authData = JSON.parse(localStorage.getItem('raasi_auth'));
        const token = authData?.token;
        await axios.delete(`${API_URL}/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(customers.filter(c => c._id !== id));
      } catch {
        alert('Failed to delete customer');
      }
    }
  };

  // Filter and pagination
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentData = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Customers Directory</h1>
        <button onClick={openAddModal} className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm mb-6 border border-gray-100 flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm">
              <th className="p-4 font-semibold text-gray-700">Name</th>
              <th className="p-4 font-semibold text-gray-700">Phone</th>
              <th className="p-4 font-semibold text-gray-700">Email</th>
              <th className="p-4 font-semibold text-gray-700">Address</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" /></td></tr>
            ) : currentData.length > 0 ? (
              currentData.map(c => (
                <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4 font-medium text-secondary">{c.name}</td>
                  <td className="p-4 text-gray-600">{c.phone}</td>
                  <td className="p-4 text-gray-600">{c.email || 'N/A'}</td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate" title={c.address}>{c.address || 'N/A'}</td>
                  <td className="p-4 flex justify-center gap-3">
                    <button onClick={() => openEditModal(c)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-600">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-white bg-gray-50 text-sm">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-white bg-gray-50 text-sm">Next</button>
          </div>
        </div>
      )}
    </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{modalMode === 'add' ? 'Add Customer' : 'Edit Customer'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required type="text" name="name" value={currentCustomer.name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input required type="text" name="phone" value={currentCustomer.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={currentCustomer.email} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea name="address" value={currentCustomer.address} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 outline-none" rows="3"></textarea>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary hover:bg-orange-600 text-white flex items-center justify-center rounded-md transition-colors">
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

export default CustomersPage;
