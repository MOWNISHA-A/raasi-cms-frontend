import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Laptop } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('raasi_auth'));

  return (
    <nav className="bg-white shadow-md border-b-[3px] border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <Laptop className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
              <span className="font-bold text-lg sm:text-xl text-secondary tracking-tight truncate">Raasi Computers</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium text-sm">Home</Link>
            <Link to="/services" className="text-gray-700 hover:text-primary transition-colors font-medium text-sm">Services</Link>
            <Link to="/inventory" className="text-gray-700 hover:text-primary transition-colors font-medium text-sm">Accessories</Link>
            <Link to="/track" className="text-gray-700 hover:text-primary transition-colors font-medium text-sm">Track Service</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors font-medium text-sm">Contact</Link>

            {user?.role === 'Technician' && (
              <Link to="/tech/dashboard" className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary-dark transition shadow-lg">Tech Portal</Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none p-2 rounded-md"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-300 shadow-sm">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl">Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl">Services</Link>
            <Link to="/inventory" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl">Accessories</Link>
            <Link to="/track" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl">Track Service</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl">Contact</Link>
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              {user?.role === 'Technician' && <Link to="/tech/dashboard" onClick={() => setIsOpen(false)} className="block w-full text-center bg-primary text-white py-3 rounded-xl font-black">TECH PORTAL</Link>}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
