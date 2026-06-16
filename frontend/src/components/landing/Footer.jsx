import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-100 block">ProctorX</span>
              <span className="text-sm text-slate-500 block">AI Powered Examination Monitoring</span>
            </div>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">Contact Support</a>
          </div>
        </div>
        
        <div className="text-center border-t border-slate-800/50 pt-8 text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} ProctorX Inc. All rights reserved. Designed for Enterprise Integrity.
        </div>
      </div>
    </footer>
  );
}
