import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, PackageCheck } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const PublicInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/inventory/public`);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) && p.quantity > 0
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getProductVisual = (product) => {
    const text = `${product.productName || ''} ${product.category || ''}`.toLowerCase();
    const navyGradient = 'from-[#0f2347] to-[#1a3a73]';

    if (text.includes('laptop') || text.includes('notebook')) {
      return { emoji: '💻', gradient: navyGradient };
    }
    if (text.includes('display') || text.includes('glass') || text.includes('screen') || text.includes('mobile')) {
      return { emoji: '📱', gradient: navyGradient };
    }
    if (text.includes('hard disk') || text.includes('hdd') || text.includes('ssd') || text.includes('storage')) {
      return { emoji: '💾', gradient: navyGradient };
    }
    if (text.includes('keyboard')) {
      return { emoji: '⌨️', gradient: navyGradient };
    }
    if (text.includes('mouse')) {
      return { emoji: '🖱️', gradient: navyGradient };
    }

    return { emoji: '📦', gradient: navyGradient };
  };

  const getInitial = (name) => {
    if (!name) return 'A';
    return name.trim().charAt(0).toUpperCase();
  };

  const getStockBadge = (qty) => {
    if (qty > 0) {
      return {
        label: 'In Stock',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
    return {
      label: 'Out of Stock',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-secondary">
            Inventory <span className="text-primary">Accessories</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
            Browse currently available accessories with real-time stock visibility.
          </p>
        </div>

        <div className="mb-10 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text" 
            placeholder="Search mouse, keyboard, SSD..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl px-6 py-10 text-center shadow-sm">
            <PackageCheck className="mx-auto text-slate-300" size={44} />
            <p className="mt-4 text-lg font-semibold text-secondary">No available products found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different keyword to find inventory items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              (() => {
                const stockBadge = getStockBadge(product.quantity);
                const visual = getProductVisual(product);
                return (
              <article
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`relative h-28 bg-gradient-to-r ${visual.gradient} px-4 py-3 flex items-center justify-between`}>
                  <div className="text-3xl leading-none" aria-hidden="true">{visual.emoji}</div>
                  <div className="w-10 h-10 rounded-full bg-white/20 text-white border border-white/40 flex items-center justify-center text-sm font-bold">
                    {getInitial(product.productName)}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-secondary leading-tight min-h-[52px]">{product.productName}</h3>
                    <p className="text-sm text-slate-500">{product.category || 'Accessories'}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Price</p>
                      <p className="text-xl font-extrabold text-secondary">{formatCurrency(product.sellingPrice)}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${stockBadge.className}`}
                    >
                      {stockBadge.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">Available Qty: <span className="font-semibold text-slate-700">{product.quantity}</span></p>
                </div>
              </article>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicInventory;
