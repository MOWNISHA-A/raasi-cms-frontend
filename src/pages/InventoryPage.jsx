import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Loader2, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter, Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState({ 
    productName: '', category: '', itemType: 'Product', supplier: '', purchasePrice: 0, sellingPrice: 0, quantity: 0, minStockLevel: 5 
  });
  const [formLoading, setFormLoading] = useState(false);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set(inventory.map(item => item.category));
    return Array.from(cats).filter(Boolean);
  }, [inventory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const token = authData?.token;
      const res = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem({ productName: '', category: '', itemType: 'Product', supplier: '', purchasePrice: 0, sellingPrice: 0, quantity: 0, minStockLevel: 5 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setCurrentItem(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const token = authData?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (modalMode === 'add') {
        const res = await axios.post(`${API_URL}/inventory`, currentItem, config);
        if (res.data.isDuplicate) {
          alert(res.data.message);
          // If duplicate, the item in res.data.item is the updated one
          setInventory(inventory.map(i => i._id === res.data.item._id ? res.data.item : i));
          // If the item wasn't in the current view (unlikely if just added, but safe), fetch fresh
          if (!inventory.find(i => i._id === res.data.item._id)) {
             fetchInventory();
          }
        } else {
          setInventory([...inventory, res.data]);
        }
      } else {
        const res = await axios.put(`${API_URL}/inventory/${currentItem._id}`, currentItem, config);
        setInventory(inventory.map(i => i._id === currentItem._id ? res.data : i));
      }
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const authData = JSON.parse(localStorage.getItem('raasi_auth'));
        const token = authData?.token;
        await axios.delete(`${API_URL}/inventory/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInventory(inventory.filter(i => i._id !== id));
      } catch {
        alert('Failed to delete item');
      }
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Filter and pagination
  const filteredData = useMemo(() => {
    return inventory.filter(i => {
      const matchSearch = i.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory ? i.category === filterCategory : true;
      return matchSearch && matchCat;
    });
  }, [inventory, searchTerm, filterCategory]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Inventory Management</h1>
        <button onClick={() => openModal('add')} className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm mb-6 border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-[200px]"
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm">
              <th className="p-4 font-semibold text-gray-700">Product Name</th>
              <th className="p-4 font-semibold text-gray-700">Category</th>
              <th className="p-4 font-semibold text-gray-700">Type</th>
              <th className="p-4 font-semibold text-gray-700">Stock</th>
              <th className="p-4 font-semibold text-gray-700">Price</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" /></td></tr>
            ) : currentData.length > 0 ? (
              currentData.map(item => {
                const isLow = item.quantity <= item.minStockLevel;
                return (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 font-medium text-secondary">{item.productName}</td>
                    <td className="p-4 text-gray-600">{item.category}</td>
                    <td className="p-4 text-gray-600">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.itemType === 'Spare Part' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.itemType || 'Product'}
                        </span>
                    </td>
                    <td className={`p-4 font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{item.quantity}</td>
                    <td className="p-4 text-gray-600">{formatCurrency(item.sellingPrice)}</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded w-fit">
                          <AlertTriangle size={14} /> Low
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded w-fit inline-block"> Good </span>
                      )}
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button onClick={() => openModal('edit', item)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No inventory items found.</td></tr>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input required type="text" name="productName" value={currentItem.productName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input required type="text" name="category" value={currentItem.category} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
                  <select 
                    required 
                    name="itemType" 
                    value={currentItem.itemType || 'Product'} 
                    onChange={handleInputChange} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary/50 outline-none"
                  >
                    <option value="Product">Product</option>
                    <option value="Spare Part">Spare Part</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input type="text" name="supplier" value={currentItem.supplier} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                  <input required type="number" name="purchasePrice" value={currentItem.purchasePrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <input required type="number" name="sellingPrice" value={currentItem.sellingPrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input required type="number" name="quantity" value={currentItem.quantity} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stock Level</label>
                  <input required type="number" name="minStockLevel" value={currentItem.minStockLevel} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
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

export default InventoryPage;
