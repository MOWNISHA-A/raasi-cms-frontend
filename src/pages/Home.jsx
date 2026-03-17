import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Cpu, HardDrive, ShieldCheck, PenTool, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-secondary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Raasi <span className="text-primary">Computer</span> Sales & Service
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Your one-stop destination for premium computer hardware, software solutions, and expert repair services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/services" className="btn-primary text-lg flex items-center justify-center gap-2">
              Explore Services <ArrowRight size={20} />
            </Link>
            <Link to="/track" className="bg-white text-secondary hover:bg-gray-100 font-medium py-3 px-6 rounded transition-colors duration-200 text-lg flex items-center justify-center gap-2">
              Track Repair
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-secondary mb-12">Why Choose Us?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Quality Assured</h3>
              <p className="text-gray-600">Genuine parts and certified hardware for maximum reliability.</p>
            </div>
            
            <div className="card text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Expert Repair</h3>
              <p className="text-gray-600">Skilled technicians resolving complex hardware and software issues.</p>
            </div>
            
            <div className="card text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Custom Builds</h3>
              <p className="text-gray-600">Tailor-made PCs for gaming, workstation, and office needs.</p>
            </div>
            
            <div className="card text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Live Tracking</h3>
              <p className="text-gray-600">Track your service status in real-time with your Service ID.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need a quick diagnosis?</h2>
            <p className="text-white/90">Visit our store or contact us today for a free consultation.</p>
          </div>
          <Link to="/contact" className="bg-secondary hover:bg-secondary-light text-white font-bold py-3 px-8 rounded shadow-lg transition-colors duration-200">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
