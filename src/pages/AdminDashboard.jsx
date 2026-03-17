import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  IndianRupee, Wrench, Package, AlertCircle, TrendingUp, 
  Activity, ShoppingCart, Clock, Filter, CheckCircle 
} from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [revenueFilter, setRevenueFilter] = useState('daily');
  const [profitFilter, setProfitFilter] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      const res = await axios.get(`${API_URL}/dashboard/stats`, config);
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchRevenue = async (filter) => {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      const res = await axios.get(`${API_URL}/dashboard/revenue?filter=${filter}`, config);
      setRevenueData(res.data);
    } catch (err) {
      console.error('Revenue fetch error:', err);
    }
  };

  const fetchProfit = async (filter) => {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      const res = await axios.get(`${API_URL}/dashboard/profit-analytics?filter=${filter}`, config);
      setProfitData(res.data);
    } catch (err) {
      console.error('Profit fetch error:', err);
    }
  };

  const fetchLowStock = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      const res = await axios.get(`${API_URL}/dashboard/demand-prediction`, config);
      setLowStockItems(res.data?.lowStockItems || []);
    } catch (err) {
      console.error('Low stock fetch error:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRevenue(revenueFilter),
    fetchProfit(profitFilter),
    fetchLowStock()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    fetchRevenue(revenueFilter);
  }, [revenueFilter]);

  useEffect(() => {
    fetchProfit(profitFilter);
  }, [profitFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-gray-500">Loading Raasi Dashboard...</p>
    </div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-secondary uppercase tracking-tight">Dashboard</h1>
           <p className="text-gray-500 font-medium">System performance overview</p>
        </div>
        {stats?.pendingSpareRequests > 0 && (
          <div className="bg-amber-100 border-2 border-amber-200 text-amber-800 px-6 py-3 rounded-2xl flex items-center gap-3 animate-bounce shadow-sm">
            <AlertCircle className="text-amber-600" />
            <span className="font-bold">New Spare Part Request from Technician ({stats.pendingSpareRequests})</span>
          </div>
        )}
      </div>

      {/* Top Low Stock Alert */}
      <div className="bg-white p-5 md:p-6 shadow-sm rounded-2xl border border-red-100 mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Package size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-secondary">Low Stock Alert</h3>
              <p className="text-xs text-gray-500">Items below minimum stock threshold</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
            {lowStockItems.length} Item{lowStockItems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="py-3 text-sm text-gray-600 font-medium flex items-center gap-2">
            <CheckCircle className="text-green-500" size={16} />
            All inventory levels are healthy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-red-50 text-red-700">
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-800">{item.productName}</td>
                    <td className="px-3 py-2 text-gray-500">{item.category || '-'}</td>
                    <td className={`px-3 py-2 text-right font-bold ${item.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.quantity === 0 ? 'OUT' : item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 shadow-xl rounded-3xl border-b-8 border-primary hover:translate-y-[-4px] transition duration-300">
          <div className="flex justify-between items-center text-primary mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl"><Wrench size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Uncompleted</span>
          </div>
          <h3 className="text-4xl font-black text-secondary">{stats?.uncompletedServices || 0}</h3>
          <p className="text-xs text-gray-400 font-bold mt-2 uppercase">Active Services</p>
        </div>

        <div className="bg-white p-6 shadow-xl rounded-3xl border-b-8 border-green-500 hover:translate-y-[-4px] transition duration-300">
          <div className="flex justify-between items-center text-green-500 mb-4">
            <div className="p-3 bg-green-100 rounded-2xl"><IndianRupee size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Today</span>
          </div>
          <h3 className="text-4xl font-black text-secondary">{formatCurrency(stats?.todayRevenue || 0)}</h3>
          <p className="text-xs text-gray-400 font-bold mt-2 uppercase">Today's Revenue</p>
        </div>

        <div className="bg-white p-6 shadow-xl rounded-3xl border-b-8 border-blue-500 hover:translate-y-[-4px] transition duration-300">
          <div className="flex justify-between items-center text-blue-500 mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl"><ShoppingCart size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Today</span>
          </div>
          <h3 className="text-4xl font-black text-secondary">{stats?.todayProductsSold || 0}</h3>
          <p className="text-xs text-gray-400 font-bold mt-2 uppercase">Products Sold</p>
        </div>

        <div className="bg-white p-6 shadow-xl rounded-3xl border-b-8 border-amber-500 hover:translate-y-[-4px] transition duration-300">
          <div className="flex justify-between items-center text-amber-500 mb-4">
            <div className="p-3 bg-amber-100 rounded-2xl"><Activity size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Requests</span>
          </div>
          <h3 className="text-4xl font-black text-secondary">{stats?.pendingSpareRequests || 0}</h3>
          <p className="text-xs text-gray-400 font-bold mt-2 uppercase">Spare Requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Graph */}
        <div className="bg-white p-8 shadow-xl rounded-[40px] border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-secondary uppercase tracking-tight">Revenue Analysis</h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Cash flow trends</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
              {['daily', 'monthly', 'yearly'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setRevenueFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${revenueFilter === f ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#FF9933" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#FF9933" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#FF9933', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF9933" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Graph */}
        <div className="bg-white p-8 shadow-xl rounded-[40px] border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-secondary uppercase tracking-tight">Profit Analytics</h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Earnings performance</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
              {['daily', 'monthly', 'yearly'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setProfitFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${profitFilter === f ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitData}>
                <defs>
                   <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#10b981', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
