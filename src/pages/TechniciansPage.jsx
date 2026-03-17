import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Edit, Trash2, X, Shield, Phone, Mail, Check, UserCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const TechniciansPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', specialization: '', status: 'Active'
  });

  const fetchTechnicians = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` }
      };
      const { data } = await axios.get(`${API_URL}/technicians`, config);
      setTechnicians(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTechnicians();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const openModal = (mode, tech = null) => {
    setModalMode(mode);
    if (tech) {
      setFormData(tech);
    } else {
      setFormData({ name: '', email: '', phone: '', password: '', specialization: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` }
      };
      if (modalMode === 'add') {
        await axios.post(`${API_URL}/technicians`, formData, config);
      } else {
        await axios.put(`${API_URL}/technicians/${formData._id}`, formData, config);
      }
      setIsModalOpen(false);
      fetchTechnicians();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving technician');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician?')) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` }
      };
      await axios.delete(`${API_URL}/technicians/${id}`, config);
      fetchTechnicians();
    } catch {
      alert('Error deleting technician');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-secondary">Technician Management</h1>
          <p className="text-gray-500">Add, monitor and manage your service team</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-primary-dark transition transform hover:-translate-y-1"
        >
          <Plus size={20} /> Add Technician
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {technicians.map(tech => (
          <div key={tech._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 group">
            <div className="bg-secondary p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                  {tech.name[0]}
                </div>
                <h3 className="text-white font-bold">{tech.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${tech.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {tech.status}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-primary" />
                <span className="text-sm">{tech.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-primary" />
                <span className="text-sm">{tech.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Shield size={18} className="text-primary" />
                <span className="text-sm italic">{tech.specialization}</span>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <button
                  onClick={() => openModal('edit', tech)}
                  className="flex-1 bg-gray-50 text-secondary py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(tech._id)}
                  className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {modalMode === 'add' ? 'Add New Technician' : 'Edit Technician'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Full Name</label>
                  <input
                    required type="text"
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Email</label>
                    <input
                      required type="email"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Phone</label>
                    <input
                      required type="text"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                {modalMode === 'add' && (
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Password</label>
                    <input
                      required type="password"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Specialization</label>
                    <input
                      required type="text"
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Status</label>
                    <select
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-secondary text-white py-4 rounded-xl font-bold uppercase tracking-widest mt-4 hover:bg-primary transition shadow-lg"
              >
                {modalMode === 'add' ? 'Create Account' : 'Update Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;
