import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Plus, Search, Loader2, Printer, Eye, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api';

const InvoicePage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const printRef = useRef();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem('raasi_auth'));
      const token = authData?.token;
      const res = await axios.get(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setInvoices([]);
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoice?.invoiceNumber || 'invoice',
  });

  const onPrintClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShouldPrint(true);
  };

  const onDownloadPdf = async (invoice) => {
    setSelectedInvoice(invoice);

    setTimeout(async () => {
      if (!printRef.current) {
        return;
      }

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
    }, 80);
  };

  useEffect(() => {
    if (!shouldPrint || !selectedInvoice) {
      return;
    }
    const timeoutId = setTimeout(() => {
      handlePrint?.();
      setShouldPrint(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [shouldPrint, selectedInvoice, handlePrint]);

  const filteredData = useMemo(() => {
    return invoices.filter(inv => 
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  const currentData = filteredData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">Invoices</h1>
        <button 
          onClick={() => navigate('/admin/billing')}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition"
        >
          <Plus size={20} /> New Invoice
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID or customer..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-700">Invoice #</th>
              <th className="p-4 font-bold text-gray-700">Customer</th>
              <th className="p-4 font-bold text-gray-700">Date</th>
              <th className="p-4 font-bold text-gray-700 text-right">Total</th>
              <th className="p-4 font-bold text-gray-700">Payment</th>
              <th className="p-4 font-bold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
            ) : currentData.length > 0 ? currentData.map(inv => (
              <tr key={inv._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold text-secondary">{inv.invoiceNumber}</td>
                <td className="p-4">{inv.customerName}</td>
                <td className="p-4 text-gray-500">{new Date(inv.date || inv.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right font-bold">₹{inv.totalAmount || inv.total}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {inv.paymentMethod || inv.paymentMode}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-4">
                  <button onClick={() => onPrintClick(inv)} className="text-primary hover:text-primary-dark" title="Print/View">
                    <Printer size={20} />
                  </button>
                  <button onClick={() => onDownloadPdf(inv)} className="text-emerald-600 hover:text-emerald-800" title="Download PDF">
                    <Download size={20} />
                  </button>
                  <button className="text-blue-500 hover:text-blue-700"><Eye size={20} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">{error || 'No invoices found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        <InvoiceTemplate ref={printRef} invoice={selectedInvoice} />
      </div>
    </div>
  );
};

export default InvoicePage;
