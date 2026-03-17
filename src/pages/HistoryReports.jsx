import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Printer, Activity } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const HistoryReports = () => {
  const [filter, setFilter] = useState('month');
  const [dateInput, setDateInput] = useState('');
  const [monthInput, setMonthInput] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');
  const [reportRangeLabel, setReportRangeLabel] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const config = { headers: { Authorization: `Bearer ${authData.token}` } };
      
      const params = new URLSearchParams({ filter });
      if (filter === 'day' && dateInput) params.append('day', dateInput);
      if (filter === 'month' && monthInput) {
        const [year, month] = monthInput.split('-');
        params.append('year', year);
        params.append('month', String(Number(month) - 1));
      }
      if (filter === 'year' && monthInput) params.append('year', monthInput.split('-')[0]);
      if (filter === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const { data } = await axios.get(`${API_URL}/dashboard/history-report?${params.toString()}`, config);
      setReport(data);

      // Build a human-friendly range label for on-screen + print header
      const now = new Date();
      let label = '';
      if (filter === 'day' && dateInput) {
        label = `For ${new Date(dateInput).toLocaleDateString()}`;
      } else if (filter === 'month' && monthInput) {
        const [y, m] = monthInput.split('-');
        label = `For ${new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
      } else if (filter === 'year' && monthInput) {
        label = `For the year ${monthInput.split('-')[0]}`;
      } else if (filter === 'custom' && startDate && endDate) {
        label = `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      } else {
        label = `For ${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
      }
      setReportRangeLabel(label);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    if (!report) return;

    const isInvoices = activeTab === 'invoices';
    const rows = isInvoices ? report.invoiceRows || [] : report.serviceRows || [];
    const title = isInvoices ? 'Invoice Report' : 'Service Report';

    const tableHeaders = isInvoices
      ? ['Inv #', 'Customer', 'Items / Services', 'Payment', 'Date & Time', 'Total Amount']
      : ['Service ID', 'Customer', 'Device / Problem', 'Status', 'Date & Time', 'Estimated Cost'];

    const tableRows = rows.map((row) => {
      if (isInvoices) {
        return [
          row.invoiceNumber || '-',
          row.customerName || '-',
          row.itemsSold || '-',
          row.paymentMethod || '-',
          row.date ? new Date(row.date).toLocaleString('en-IN') : '-',
          formatCurrency(row.totalAmount),
        ];
      }

      return [
        row.serviceId || '-',
        row.customerName || '-',
        row.problemDescription ? `${row.device || '-'} - ${row.problemDescription}` : (row.device || '-'),
        row.status || '-',
        row.date ? new Date(row.date).toLocaleString('en-IN') : '-',
        formatCurrency(row.cost),
      ];
    });

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
            h1 { margin: 0; color: #0f2a56; font-size: 24px; }
            .sub { margin-top: 6px; color: #6b7280; font-size: 13px; }
            .meta { margin: 12px 0 16px; font-size: 13px; color: #374151; }
            .chip { display: inline-block; background: #eef2ff; color: #1e3a8a; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; font-weight: 700; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Raasi Computer Care</h1>
          <div class="sub">${title}</div>
          <div class="meta">
            <div><span class="chip">${reportRangeLabel || 'Selected Range'}</span></div>
            <div style="margin-top: 8px;">Generated on: ${new Date().toLocaleString('en-IN')}</div>
            <div>Total rows: ${rows.length}</div>
          </div>
          <table>
            <thead>
              <tr>
                ${tableHeaders.map((h) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows.map((r) => `
                <tr>
                  ${r.map((c, idx) => `<td class="${idx === r.length - 1 ? 'right' : ''}">${c}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const formatCurrency = (amount) => {
     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">History Reports</h1>
          <p className="text-slate-500">Generate and print business reports by selected timeframe.</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!report}
          className="bg-secondary text-white px-5 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 font-semibold hover:bg-primary transition disabled:opacity-50"
        >
          <Printer size={18} /> Print Current View
        </button>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500">Timeframe</label>
             <select
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-secondary"
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             >
               <option value="day">Single Day</option>
               <option value="month">Monthly</option>
               <option value="year">Yearly</option>
               <option value="custom">Custom Range</option>
             </select>
          </div>

          {filter === 'day' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Select Date</label>
              <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
            </div>
          )}

          {(filter === 'month' || filter === 'year') && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Month/Year</label>
              <input type="month" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={monthInput} onChange={(e) => setMonthInput(e.target.value)} />
            </div>
          )}

          {filter === 'custom' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Start Date</label>
                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">End Date</label>
                <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          <button
            onClick={fetchReport}
            className="bg-primary text-white p-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition h-[48px]"
          >
            <Filter size={16} /> Generate
          </button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-secondary">Raasi Computer Care</h2>
                <p className="text-sm text-slate-500">Comprehensive sales and service history</p>
                {reportRangeLabel && <p className="text-sm text-slate-600 font-semibold mt-1">{reportRangeLabel}</p>}
              </div>
              <div className="text-sm text-slate-600 lg:text-right">
                <p className="font-semibold">Generated on: {new Date().toLocaleString()}</p>
                <p>Total Invoices: <span className="font-semibold">{report.invoiceRows?.length || 0}</span></p>
                <p>Total Services: <span className="font-semibold">{report.serviceRows?.length || 0}</span></p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold">Revenue</p>
                <p className="text-xl font-extrabold text-secondary mt-1">{formatCurrency(report.totalRevenue)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold">Invoice Count</p>
                <p className="text-xl font-extrabold text-secondary mt-1">{report.invoiceRows?.length || 0}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold">Service Count</p>
                <p className="text-xl font-extrabold text-secondary mt-1">{report.serviceRows?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="flex border-b border-slate-200">
               <button 
                onClick={() => setActiveTab('invoices')}
                className={`flex-1 p-4 font-semibold text-sm transition ${activeTab === 'invoices' ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                 Invoices ({report.invoiceRows?.length})
               </button>
               <button 
                onClick={() => setActiveTab('services')}
                className={`flex-1 p-4 font-semibold text-sm transition ${activeTab === 'services' ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                 Services ({report.serviceRows?.length})
               </button>
             </div>

             <div className="overflow-x-auto">
               {activeTab === 'invoices' ? (
                 <table className="w-full text-left">
                   <thead className="bg-slate-50">
                     <tr className="text-xs font-semibold text-slate-500">
                       <th className="px-5 py-3">Inv #</th>
                       <th className="px-5 py-3">Customer</th>
                       <th className="px-5 py-3">Items / Services</th>
                       <th className="px-5 py-3">Payment</th>
                       <th className="px-5 py-3">Date &amp; Time</th>
                       <th className="px-5 py-3 text-right">Total Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {report.invoiceRows?.map((row, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 transition">
                         <td className="px-5 py-4 font-semibold text-secondary">{row.invoiceNumber}</td>
                         <td className="px-5 py-4 text-sm font-medium text-slate-700">{row.customerName}</td>
                         <td className="px-5 py-4 text-sm text-slate-500 max-w-[220px] truncate">{row.itemsSold}</td>
                         <td className="px-5 py-4"><span className="px-2.5 py-1 bg-slate-100 text-secondary text-xs font-semibold rounded-full">{row.paymentMethod}</span></td>
                         <td className="px-5 py-4 text-sm text-slate-500">
                           {row.date ? new Date(row.date).toLocaleString('en-IN') : '-'}
                         </td>
                         <td className="px-5 py-4 text-right font-bold text-primary">{formatCurrency(row.totalAmount)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs font-semibold text-slate-500">
                      <th className="px-5 py-3">Service ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Device / Problem</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date &amp; Time</th>
                      <th className="px-5 py-3 text-right">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.serviceRows?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 font-semibold text-secondary">{row.serviceId}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">{row.customerName}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          <div className="font-semibold">{row.device}</div>
                          {row.problemDescription && (
                            <div className="text-xs text-slate-400 mt-1 line-clamp-1">{row.problemDescription}</div>
                          )}
                        </td>
                        <td className="px-5 py-4"><span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{row.status}</span></td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {row.date ? new Date(row.date).toLocaleString('en-IN') : '-'}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-secondary">{formatCurrency(row.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               )}
             </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-16 gap-3 text-secondary animate-pulse">
          <Activity className="animate-spin" />
          <span className="font-semibold">Preparing report data...</span>
        </div>
      )}
    </div>
  );
};

export default HistoryReports;
