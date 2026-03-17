import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary mb-4">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have a question or need a repair? Reach out to our team today or visit our store. 
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="card border-l-4 border-primary hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-secondary mb-6">Store Information</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-primary mt-1 mr-4 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Our Location</h4>
                  <p className="text-gray-600">RAASI COMPUTERS<br/>D.No:78B, DRM Complex<br/>Anna Salai, Rasipuram<br/>Namakkal – 637408</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-primary mt-1 mr-4 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Phone & WhatsApp</h4>
                  <p className="text-gray-600">+91 99946 04569<br/>+91 97503 73953</p>
                </div>
              </div>
              <div className="flex mt-6 gap-4">
                <a href="tel:+919994604569" className="bg-primary text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-dark transition">
                  <Phone size={18} /> Call Now
                </a>
                <a href="https://wa.me/919994604569" target="_blank" rel="noreferrer" className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition">
                   WhatsApp
                </a>
              </div>
            </div>
          </div>
          
          <div className="h-64 rounded-xl overflow-hidden shadow-inner bg-gray-200 border-2 border-primary/20">
            {/* Embedded Google Map */}
            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15653.3768925!2d78.1633!3d11.4589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDI3JzMyLjAiTiA3OMKwMDknNDguMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
               width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Shop Location"></iframe>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="card">
          <h3 className="text-xl font-bold text-secondary mb-6">Send us a Message</h3>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="input-field" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" className="input-field" placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea className="input-field h-32 resize-none" placeholder="Enter your message here..."></textarea>
            </div>
            <button className="btn-primary w-full mt-2">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
