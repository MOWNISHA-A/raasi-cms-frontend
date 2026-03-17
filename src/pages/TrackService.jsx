import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, CheckCircle2, Clock3, Package, Truck, AlertCircle, Wrench } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const STATUS_FLOW = ['Assigned', 'In Progress', 'Waiting for Spare', 'Completed', 'Delivered'];

const STATUS_META = {
  Assigned: {
    label: 'Assigned',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock3,
  },
  'In Progress': {
    label: 'In Progress',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    icon: Wrench,
  },
  'Waiting for Spare': {
    label: 'Waiting for Spare',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Package,
  },
  Completed: {
    label: 'Completed',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  Delivered: {
    label: 'Delivered',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    icon: Truck,
  },
};

const TrackService = () => {
  const [serviceId, setServiceId] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!serviceId.trim()) return;

    setLoading(true);
    setError('');
    setStatusResult(null);

    try {
      const { data } = await axios.get(`${API_URL}/services/track/${serviceId.trim().toUpperCase()}`);
      setStatusResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Service ID. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const normalizedStatus = statusResult?.status || '';
  const currentStepIndex = Math.max(STATUS_FLOW.indexOf(normalizedStatus), 0);
  const currentStatusMeta = STATUS_META[normalizedStatus] || STATUS_META.Assigned;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 px-4 sm:px-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-secondary">Track Your Service</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500">Enter your service ID to view the latest repair progress.</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Service ID (Example: RS-2026-0001)"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-secondary font-medium outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Track'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-rose-50 p-3 rounded-xl flex items-start gap-2 text-rose-700 border border-rose-100 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {statusResult && (
          <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Service ID</p>
                <h2 className="text-2xl font-black text-secondary">{statusResult.serviceId}</h2>
                <p className="text-sm text-slate-500 mt-1">{statusResult.brand} • {statusResult.deviceType}</p>
              </div>
              <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold w-fit ${currentStatusMeta.badge}`}>
                <currentStatusMeta.icon size={16} />
                {currentStatusMeta.label}
              </span>
            </div>

            <div className="py-6">
              <div className="hidden sm:block">
                <div className="relative mb-3">
                  <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                  <div
                    className="absolute left-0 top-0 h-1 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (STATUS_FLOW.length - 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {STATUS_FLOW.map((step, index) => {
                    const stepMeta = STATUS_META[step];
                    const StepIcon = stepMeta.icon;
                    const isDone = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step} className="text-center">
                        <div className={`mx-auto mb-2 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${isDone ? 'bg-primary text-white border-primary' : isCurrent ? 'bg-secondary text-white border-secondary' : 'bg-white text-slate-400 border-slate-200'}`}>
                          {isDone ? <CheckCircle2 size={15} /> : <StepIcon size={15} />}
                        </div>
                        <p className={`text-[11px] font-semibold ${isCurrent ? 'text-secondary' : 'text-slate-500'}`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sm:hidden space-y-2">
                {STATUS_FLOW.map((step, index) => {
                  const stepMeta = STATUS_META[step];
                  const StepIcon = stepMeta.icon;
                  const isDone = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isCurrent ? 'border-secondary bg-slate-50' : 'border-slate-200 bg-white'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDone ? 'bg-primary text-white' : isCurrent ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {isDone ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
                      </div>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-secondary' : 'text-slate-600'}`}>{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Problem Reported</p>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{statusResult.problemDescription}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Technician Notes</p>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{statusResult.notes || 'No technician notes added yet.'}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400 text-right">Last updated: {new Date(statusResult.updatedAt || statusResult.createdAt).toLocaleString()}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default TrackService;
