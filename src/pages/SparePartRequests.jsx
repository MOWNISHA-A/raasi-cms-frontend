import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, AlertCircle } from 'lucide-react';

const SparePartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequests() {
    try {
      const config = {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` }
      };
      const { data } = await axios.get('http://localhost:5001/api/spare-requests', config);
      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` }
      };
      await axios.put(`http://localhost:5001/api/spare-requests/${id}/status`, { status }, config);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating request');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading requests...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">Spare Part Requests</h1>
        <p className="text-gray-500">Approve or reject technician requests for parts</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.length === 0 ? (
          <div className="bg-gray-100 p-12 text-center rounded-xl">
            <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No pending spare part requests</p>
          </div>
        ) : (
          requests.map(request => (
            <div key={request._id} className={`bg-white p-6 rounded-xl shadow-md border-l-8 ${request.status === 'Approved' ? 'border-green-500' : request.status === 'Rejected' ? 'border-red-500' : 'border-primary'}`}>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary text-white text-xs px-2 py-0.5 rounded uppercase font-bold">{request.service?.serviceId}</span>
                    <h3 className="text-lg font-bold">{request.part?.productName}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-secondary">Technician:</span> {request.technician?.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-secondary">Reason:</span> {request.reason}
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase font-bold">Qty Requested</p>
                    <p className="text-xl font-bold text-primary">{request.quantity}</p>
                  </div>
                  
                  <div className="text-center border-l pl-8">
                    <p className="text-xs text-gray-400 uppercase font-bold">Stock Available</p>
                    <p className="text-xl font-bold text-secondary">{request.part?.quantity || 0}</p>
                  </div>

                  {request.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(request._id, 'Approved')}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition shadow-sm"
                        title="Approve"
                      >
                        <Check size={24} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shadow-sm"
                        title="Reject"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`font-bold px-4 py-2 rounded-lg ${request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SparePartRequests;
