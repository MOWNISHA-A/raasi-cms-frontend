import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">Raasi Computer Sales & Service</h3>
            <p className="text-gray-300 text-sm">
              Your trusted partner for all computer hardware, software, and networking solutions. Providing quality service for over a decade.
            </p>
          </div>
          <div>
  <h3 className="text-lg font-bold mb-4">Contact Info</h3>
  <ul className="space-y-2 text-gray-300 text-sm">
    <li>📍 RAASI COMPUTERS, D.No:78B, DRM Complex, Anna Salai, Rasipuram, Namakkal – 637408</li>
    <li>📞 +91 99946 04569</li>
    <li>💬 +91 97503 73953 (WhatsApp)</li>
  </ul>
</div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/admin-login" className="hover:text-primary transition-colors">Admin Portal Access</Link></li>
              <li><Link to="/tech-login" className="hover:text-primary transition-colors">Technician Portal Access</Link></li>
              <li><Link to="/track" className="hover:text-primary transition-colors">Track Your Repair</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-light mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Raasi Computer Sales and Service. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
