import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, ShieldCheck, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-cyan-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              System Online v2.4
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="block text-slate-100">Welcome to ProctorX</span>
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                AI-Powered Exam Proctoring
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Ensure academic integrity through real-time AI monitoring, intelligent behavior detection, secure browser enforcement, and detailed integrity analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login"
                className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-lg text-white font-medium bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-lg text-slate-200 font-medium bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all backdrop-blur-sm">
                <Play className="w-4 h-4 text-cyan-400" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Right Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto"
          >
            <div className="relative rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl overflow-hidden aspect-[16/10] w-full max-w-[600px] flex flex-col">
              {/* Browser Header */}
              <div className="h-8 bg-slate-950 flex items-center px-4 gap-2 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto bg-slate-800/50 rounded-md h-5 w-48 border border-slate-700/50 flex items-center px-2">
                  <ShieldCheck className="w-3 h-3 text-cyan-500 mr-2" />
                  <div className="w-24 h-1.5 bg-slate-600 rounded-full"></div>
                </div>
              </div>
              
              {/* Mockup Dashboard Body */}
              <div className="flex-1 bg-slate-900 p-4 flex gap-4 overflow-hidden relative">
                {/* Sidebar */}
                <div className="w-16 h-full bg-slate-950/50 rounded-lg border border-slate-800 flex flex-col items-center py-4 gap-4">
                  <div className="w-8 h-8 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-md bg-slate-800 text-slate-500 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-md bg-slate-800 text-slate-500 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Main Area */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Top Nav */}
                  <div className="h-10 w-full flex items-center justify-between">
                    <div className="w-32 h-4 bg-slate-800 rounded-md"></div>
                    <div className="flex gap-2">
                      <div className="w-20 h-6 bg-slate-800 rounded-md"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                    </div>
                  </div>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-3 gap-4 h-24">
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex flex-col justify-center">
                      <div className="w-16 h-3 bg-slate-700 rounded-full mb-2"></div>
                      <div className="text-xl text-cyan-400 font-bold">99.9%</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex flex-col justify-center">
                      <div className="w-20 h-3 bg-slate-700 rounded-full mb-2"></div>
                      <div className="text-xl text-green-400 font-bold">12 Active</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex flex-col justify-center">
                      <div className="w-14 h-3 bg-slate-700 rounded-full mb-2"></div>
                      <div className="text-xl text-red-400 font-bold">0 Alerts</div>
                    </div>
                  </div>
                  
                  {/* Large Area */}
                  <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
                    <div className="w-full h-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow under mockup */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-2xl opacity-20 -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
