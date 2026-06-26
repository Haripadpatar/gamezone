import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070c] border-t border-slate-900 text-slate-500 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-400 mb-1 text-sm">NexaCart Ecosystem</p>
          <p>&copy; {new Date().getFullYear()} NexaCart Inc. All rights reserved.</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Vendor Guidelines</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
