import React from 'react';
import { Monitor, Cpu, Server, Shield, PenTool } from 'lucide-react';

const Services = () => {
  const serviceList = [
    {
      title: 'Laptop & Desktop Repair',
      description: 'Screen replacement, battery issues, keyboard fixes, and motherboard chip-level service.',
      icon: <Monitor className="w-10 h-10 text-primary" />,
      features: ['Diagnostic Service', 'Hardware Upgrades', 'Chip Level Repair']
    },
    {
      title: 'Custom PC Builds',
      description: 'Tailored rigs for Gaming, Editing, and Office use based on your budget.',
      icon: <Cpu className="w-10 h-10 text-primary" />,
      features: ['Component Selection', 'Assembly & Config', 'Thermal Optimization']
    },
    {
      title: 'Software & OS Installation',
      description: 'Windows, Linux, MacOS installations, driver updates, and essential software setup.',
      icon: <PenTool className="w-10 h-10 text-primary" />,
      features: ['OS Formatting', 'Data Backup', 'Software Licensing']
    },
    {
      title: 'Networking Solutions',
      description: 'Router configuration, LAN setup, and commercial network infrastructure planning.',
      icon: <Server className="w-10 h-10 text-primary" />,
      features: ['Wi-Fi Optimization', 'Cable Management', 'Network Security']
    },
    {
      title: 'Data Recovery & Security',
      description: 'Retrieval of deleted files, failing hard drives, and antivirus shielding.',
      icon: <Shield className="w-10 h-10 text-primary" />,
      features: ['HDD/SSD Recovery', 'Virus Removal', 'Data Encryption']
    }
  ];

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary mb-4">Our Premium Services</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We provide end-to-end IT hardware and software solutions backed by certified professionals. Choose from our comprehensive service domains below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceList.map((service, idx) => (
          <div key={idx} className="card hover:shadow-xl transition-shadow duration-300 border-t-4 border-primary">
            <div className="mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold text-secondary mb-2">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <ul className="space-y-2">
              {service.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-center text-sm text-gray-500">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
