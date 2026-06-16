import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { num: '01', title: 'Admin Creates Exam', desc: 'Configure test parameters, security levels, and monitoring features.' },
    { num: '02', title: 'Student Verification', desc: 'Secure identity check using AI facial recognition and ID scan.' },
    { num: '03', title: 'Secure Environment', desc: 'Browser enters lockdown mode preventing unauthorized access.' },
    { num: '04', title: 'AI Monitoring', desc: 'Continuous tracking of behavior, audio, and environment.' },
    { num: '05', title: 'Report Generation', desc: 'Detailed integrity analytics compiled automatically post-exam.' },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-slate-900/20">
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">It Works</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A seamless, five-step process ensuring total exam integrity from configuration to completion.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-[5%] right-[5%] h-[2px] bg-slate-800 -translate-y-1/2 z-0">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-full opacity-50 shadow-[0_0_10px_rgba(8,145,178,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mb-6 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all duration-300 relative">
                  <span className="text-xl font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">{step.num}</span>
                  
                  {/* Outer glow ring on hover */}
                  <div className="absolute -inset-2 border border-cyan-500/0 group-hover:border-cyan-500/30 rounded-full scale-90 group-hover:scale-100 transition-all duration-500"></div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
