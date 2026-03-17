import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PenTool, Loader2 } from 'lucide-react';

const TechLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      
      if (data.role !== 'Technician' && data.role !== 'Admin') {
        setError('Unauthorized: Technician access required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('raasi_auth', JSON.stringify(data));
      navigate('/tech/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full card shadow-lg border-t-4 border-secondary">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
            <PenTool className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold text-secondary">Technician Portal</h2>
          <p className="text-gray-500 mt-2">Access your assigned repair tasks</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email / ID</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="tech@raasicomputers.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TechLogin;
