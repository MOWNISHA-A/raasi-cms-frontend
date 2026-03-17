import React, { forwardRef } from 'react';

const InvoiceTemplate = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const spareParts = Array.isArray(invoice.spareParts) ? invoice.spareParts : [];
  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax || invoice.gst || 0);
  const discountAmount = Number(invoice.discountAmount || 0);
  const totalAmount = Number(invoice.totalAmount || 0);
  const serviceCharge = Number(invoice.labourCharge || 0);
  const amountPaid = Number(invoice.amountPaid || 0);
  const remainingBalance = Number(invoice.remainingBalance || 0);

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans max-w-4xl mx-auto shadow-none print:shadow-none prnt-container">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">RAASI COMPUTERS</h1>
          <p className="text-sm">D.No:78B, DRM Complex</p>
          <p className="text-sm">Anna Salai, Rasipuram</p>
          <p className="text-sm">Namakkal – 637408</p>
          <p className="text-sm font-semibold">Mobile: 9994604569, 9750373953</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-500">Invoice</h2>
          <p className="mt-1"><span className="font-semibold">No:</span> {invoice.invoiceNumber}</p>
          <p><span className="font-semibold">Date:</span> {new Date(invoice.date || invoice.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-gray-500 font-bold uppercase text-xs mb-1">Bill To:</h3>
          <p className="font-bold text-lg">{invoice.customerName}</p>
          <p>{invoice.customerPhone || invoice.phone}</p>
          <p>{invoice.customerEmail || ''}</p>
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 font-bold uppercase text-xs mb-1">Payment Method:</h3>
          <p className="font-bold">{invoice.paymentMethod}</p>
          {invoice.invoiceType && <p className="text-sm text-gray-500">Type: {invoice.invoiceType}</p>}
        </div>
      </div>

      {invoice.serviceId && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h3 className="font-semibold text-sm text-gray-700 mb-1">Service Details</h3>
          <p className="text-sm"><span className="font-medium">Service Ref:</span> {invoice.serviceId?.serviceId || invoice.serviceId}</p>
          <p className="text-sm"><span className="font-medium">Description:</span> {invoice.serviceDescription || '-'}</p>
          <p className="text-sm"><span className="font-medium">Labour Charge:</span> Rs.{serviceCharge.toFixed(2)}</p>
        </div>
      )}

      {/* Items Table */}
      <table className="w-full mt-8 border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            <th className="p-2 text-left border border-primary">#</th>
            <th className="p-2 text-left border border-primary">Item / Description</th>
            <th className="p-2 text-center border border-primary">Qty</th>
            <th className="p-2 text-right border border-primary">Price</th>
            <th className="p-2 text-right border border-primary">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.productName || item.description}</td>
              <td className="p-2 border text-center">{item.quantity}</td>
              <td className="p-2 border text-right">₹{Number(item.price || 0).toFixed(2)}</td>
              <td className="p-2 border text-right">₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
            </tr>
          ))}
          {spareParts.map((part, index) => (
            <tr key={`spare-${index}`} className="border-b bg-orange-50/40">
              <td className="p-2 border">{items.length + index + 1}</td>
              <td className="p-2 border">{part.partName} (Spare Part)</td>
              <td className="p-2 border text-center">{part.quantity}</td>
              <td className="p-2 border text-right">Rs.{Number(part.price || 0).toFixed(2)}</td>
              <td className="p-2 border text-right">Rs.{(Number(part.total || 0)).toFixed(2)}</td>
            </tr>
          ))}
          {serviceCharge > 0 && (
            <tr className="border-b bg-blue-50/30">
              <td className="p-2 border">{items.length + spareParts.length + 1}</td>
              <td className="p-2 border">Labour / Service Charge</td>
              <td className="p-2 border text-center">1</td>
              <td className="p-2 border text-right">Rs.{serviceCharge.toFixed(2)}</td>
              <td className="p-2 border text-right">Rs.{serviceCharge.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between pb-1 border-b">
            <span>Subtotal:</span>
            <span>Rs.{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-1 border-b">
            <span>Discount:</span>
            <span>-Rs.{discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-1 border-b">
            <span>Tax:</span>
            <span>Rs.{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-primary">
            <span>Total:</span>
            <span>Rs.{totalAmount.toFixed(2)}</span>
          </div>
          {invoice.paymentMethod === 'EMI' && (
            <>
              <div className="flex justify-between pb-1 border-t pt-2 text-sm">
                <span>Paid / Down Payment:</span>
                <span>Rs.{amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-red-700">
                <span>Remaining Balance:</span>
                <span>Rs.{remainingBalance.toFixed(2)}</span>
              </div>
            </>
          )}
          {invoice.emiPlan?.enabled && (
            <div className="mt-2 text-xs text-gray-600 border-t pt-2">
              EMI Plan: {invoice.emiPlan.installments || 0} installments from {invoice.emiPlan.emiStartDate ? new Date(invoice.emiPlan.emiStartDate).toLocaleDateString('en-IN') : 'N/A'}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
        <p>Thank you for choosing Raasi Computers!</p>
        <p>Terms: Goods once sold will not be taken back. Service warranty as per manufacturer policy.</p>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
