import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Trash, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import InvoiceTemplate from '../components/InvoiceTemplate';

const BillingPage = () => {
  const [inventory, setInventory] = useState([]);
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [billingMode, setBillingMode] = useState('Product');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [labourCharge, setLabourCharge] = useState(0);
  const [discountType, setDiscountType] = useState('None');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const componentRef = React.useRef(null);

  async function fetchInventory() {
    try {
      const authData = JSON.parse(localStorage.getItem('raasi_auth') || '{}');
      const token = authData?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [invRes, serviceRes] = await Promise.all([
        axios.get('http://localhost:5001/api/inventory', config),
        axios.get('http://localhost:5001/api/services', config),
      ]);

      setInventory(invRes.data);
      setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to fetch inventory. Please login again.');
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventory();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert('Product out of stock');
      return;
    }
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        alert(`Only ${product.quantity} items available in stock`);
        return;
      }
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, productId: product._id }]);
    }
  };

  const updateCartQuantity = (id, delta) => {
    const item = cart.find(i => i._id === id);
    const product = inventory.find(p => p._id === id);
    if (!item || !product) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    if (newQty > product.quantity) {
      alert(`Only ${product.quantity} items available in stock`);
      return;
    }
    setCart(cart.map(i => i._id === id ? { ...i, quantity: newQty } : i));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const addSparePartRow = () => {
    setSpareParts((prev) => [...prev, { partId: '', partName: '', quantity: 1, price: 0 }]);
  };

  const updateSparePart = (index, key, value) => {
    setSpareParts((prev) =>
      prev.map((row, i) => {
        if (i !== index) {
          return row;
        }
        const next = { ...row, [key]: value };
        if (key === 'partId') {
          const found = inventory.find((item) => item._id === value);
          if (found) {
            next.partName = found.productName;
            next.price = Number(found.sellingPrice || 0);
          }
        }
        return next;
      })
    );
  };

  const removeSparePart = (index) => {
    setSpareParts((prev) => prev.filter((_, i) => i !== index));
  };

  const onServiceSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    const selected = services.find((service) => service._id === serviceId);
    if (!selected) {
      return;
    }

    setCustomer({
      name: selected.customerName || '',
      phone: selected.phoneNumber || '',
      email: selected.customerEmail || '',
    });
    setServiceDescription(selected.problemDescription || '');
  };

  const selectedService = services.find((service) => service._id === selectedServiceId) || null;

  const availableProducts = inventory.filter((item) => item.itemType === 'Product');
  const availableSpares = inventory.filter((item) => item.itemType === 'Spare Part');

  const calculateTotal = () => {
    const productSubtotal = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    const spareSubtotal = spareParts.reduce((acc, part) => acc + (Number(part.quantity || 0) * Number(part.price || 0)), 0);
    const serviceSubtotal = Number(labourCharge || 0);
    const subtotal = productSubtotal + spareSubtotal + serviceSubtotal;

    let discountAmount = 0;
    if (discountType === 'Amount') {
      discountAmount = Math.min(Number(discountValue || 0), subtotal);
    } else if (discountType === 'Percentage') {
      discountAmount = subtotal * (Math.min(Number(discountValue || 0), 100) / 100);
    }

    const taxable = Math.max(subtotal - discountAmount, 0);
    const gst = taxable * 0.18;
    const total = taxable + gst;
    return { productSubtotal, spareSubtotal, serviceSubtotal, subtotal, discountAmount, taxable, gst, total };
  };

  const handleCreateInvoice = async () => {
    const usingService = billingMode === 'Service' || billingMode === 'Mixed';
    const usingProducts = billingMode === 'Product' || billingMode === 'Mixed';

    if (!customer.name || !customer.phone) {
      alert('Please enter customer name and phone number');
      return;
    }

    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customer.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    if (customer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    if (usingService && !selectedServiceId) {
      alert('Please select a completed service for service billing');
      return;
    }

    if (usingProducts && cart.length === 0 && spareParts.length === 0 && Number(labourCharge || 0) <= 0) {
      alert('Add at least one product/spare or service charge');
      return;
    }

    const { subtotal, gst, total, discountAmount } = calculateTotal();
    const invoiceData = {
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      serviceId: selectedServiceId || undefined,
      serviceDescription,
      labourCharge: Number(labourCharge || 0),
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.sellingPrice
      })),
      spareParts: spareParts
        .filter((part) => part.partId && Number(part.quantity) > 0)
        .map((part) => ({
          partId: part.partId,
          partName: part.partName,
          quantity: Number(part.quantity),
          price: Number(part.price),
        })),
      paymentMethod,
      discountType,
      discountValue: Number(discountValue || 0),
      subtotal,
      tax: gst,
      discountAmount,
      totalAmount: total,
    };


    try {
      const config = {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('raasi_auth')).token}` }
      };
      const { data } = await axios.post('http://localhost:5001/api/invoices', invoiceData, config);
      setCreatedInvoice(data);
      setSubmitStatus('Invoice generated successfully.');
      alert('Invoice generated successfully!');
      setCart([]);
      setSpareParts([]);
      setCustomer({ name: '', phone: '', email: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating invoice');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: createdInvoice?.invoiceNumber || 'invoice',
  });

  const filteredInventory = availableProducts.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Product Selection */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 sm:items-center">
          <label className="font-semibold text-sm text-gray-600">Billing Type</label>
          <select
            className="p-2 border rounded-lg"
            value={billingMode}
            onChange={(e) => setBillingMode(e.target.value)}
          >
            <option value="Product">Product Invoice</option>
            <option value="Service">Service Invoice</option>
            <option value="Mixed">Mixed Invoice</option>
          </select>
          {(billingMode === 'Service' || billingMode === 'Mixed') && (
            <select
              className="p-2 border rounded-lg flex-1"
              value={selectedServiceId}
              onChange={(e) => onServiceSelect(e.target.value)}
            >
              <option value="">Select Completed Service</option>
              {services
                .filter((service) => ['Completed', 'Ready for Delivery'].includes(service.status))
                .map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.serviceId} - {service.customerName}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {(billingMode === 'Product' || billingMode === 'Mixed') && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredInventory.map(item => (
              <div key={item._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                <h3 className="font-bold text-lg">{item.productName}</h3>
                <p className="text-gray-500 text-sm">{item.category}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-primary font-bold">₹{item.sellingPrice}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-secondary">In Stock: {item.quantity}</p>
              </div>
            ))}
          </div>
        )}

        {(billingMode === 'Service' || billingMode === 'Mixed') && (
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <h3 className="font-bold text-secondary">Service Charges & Spare Parts</h3>
            <textarea
              rows={3}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Service description"
            />
            <input
              type="number"
              min="0"
              value={labourCharge}
              onChange={(e) => setLabourCharge(Number(e.target.value))}
              className="w-full p-2 border rounded"
              placeholder="Labour / Service charge"
            />

            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Spare Parts</h4>
              <button
                type="button"

                onClick={addSparePartRow}
                className="text-sm bg-primary text-white px-3 py-1 rounded"
              >
                Add Spare Part
              </button>
            </div>

            {spareParts.map((part, index) => (
              <div key={`${part.partId}-${index}`} className="grid grid-cols-12 gap-2 items-center">
                <select
                  value={part.partId}
                  onChange={(e) => updateSparePart(index, 'partId', e.target.value)}
                  className="col-span-6 p-2 border rounded"
                >
                  <option value="">Select part</option>
                  {availableSpares.map((item) => (
                    <option key={item._id} value={item._id}>{item.productName}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={part.quantity}
                  onChange={(e) => updateSparePart(index, 'quantity', Number(e.target.value))}
                  className="col-span-2 p-2 border rounded"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  min="0"
                  value={part.price}
                  onChange={(e) => updateSparePart(index, 'price', Number(e.target.value))}
                  className="col-span-3 p-2 border rounded"
                  placeholder="Price"
                />
                <button type="button" onClick={() => removeSparePart(index)} className="col-span-1 text-red-500">
                  <Trash size={16} />
                </button>
                <div className="col-span-12 text-right text-xs text-gray-500">
                  Total: Rs.{(Number(part.quantity || 0) * Number(part.price || 0)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart & Billing */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg flex flex-col min-h-[calc(100vh-120px)]">
        <h2 className="text-xl font-bold mb-6 border-b pb-2">New Invoice</h2>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Customer Name"
            className="w-full p-2 border rounded"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-2 border rounded"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <h3 className="font-bold mb-2">Products</h3>
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm">No items in cart</p>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div className="flex-1">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-gray-500">{item.quantity} x ₹{item.sellingPrice}</p>
                  </div>
                  <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
                    <button onClick={() => updateCartQuantity(item._id, -1)} className="p-1 hover:bg-white rounded transition">-</button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item._id, 1)} className="p-1 hover:bg-white rounded transition">+</button>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <span className="font-bold w-16 text-right">₹{item.quantity * item.sellingPrice}</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700">
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(billingMode === 'Service' || billingMode === 'Mixed') && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Service Summary</h3>
              {selectedService ? (
                <div className="text-sm bg-gray-50 border rounded p-3 space-y-1">
                  <p><span className="font-semibold">Service ID:</span> {selectedService.serviceId}</p>
                  <p><span className="font-semibold">Status:</span> {selectedService.status}</p>
                  <p><span className="font-semibold">Labour:</span> Rs.{Number(labourCharge || 0).toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No service selected.</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Products</span>
            <span>₹{calculateTotal().productSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Spare Parts</span>
            <span>₹{calculateTotal().spareSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Charge</span>
            <span>₹{calculateTotal().serviceSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{calculateTotal().subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount</span>
            <span>-₹{calculateTotal().discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST (18%)</span>
            <span>₹{calculateTotal().gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t">
            <span>Total</span>
            <span>₹{calculateTotal().total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <select
              className="p-2 border rounded bg-gray-50"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="None">No Discount</option>
              <option value="Amount">Amount</option>
              <option value="Percentage">Percentage</option>
            </select>
            <input
              type="number"
              min="0"
              className="p-2 border rounded bg-gray-50"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              placeholder={discountType === 'Percentage' ? 'Discount %' : 'Discount Amount'}
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold text-gray-500 uppercase">Payment Method</label>
            <select
              className="w-full p-2 border rounded mt-1 bg-gray-50"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>Cash</option>
              <option>UPI</option>
            </select>
          </div>

          {submitStatus && (
            <div className="text-xs p-2 rounded border bg-blue-50 text-blue-700 border-blue-200">
              {submitStatus}
            </div>
          )}

          <button
            onClick={handleCreateInvoice}
            className="w-full bg-secondary text-white py-3 rounded-lg font-bold mt-6 hover:bg-opacity-90 transition flex items-center justify-center gap-2"
          >
            Create Invoice
          </button>

          {createdInvoice && (
            <button
              onClick={() => handlePrint?.()}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-2 hover:bg-opacity-90 transition flex items-center justify-center gap-2"
            >
              <Printer size={20} /> Print Invoice
            </button>
          )}
        </div>
      </div>

      {/* Hidden Print Content */}
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
        <InvoiceTemplate ref={componentRef} invoice={createdInvoice} />
      </div>
    </div>
  );
};

export default BillingPage;
