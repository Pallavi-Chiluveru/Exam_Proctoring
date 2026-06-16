import React from 'react';
import { motion } from 'framer-motion';

export default function Stats() {
  const stats = [
    { value: '99.9%', label: 'Monitoring Accuracy' },
    { value: '< 1s', label: 'Real-Time Alerts' },
    { value: '100%', label: 'Secure Browser Environment' },
    { value: '50+', label: 'Detailed Integrity Analytics' },
  ];

  return (
    <section className="py-12 border-y border-slate-800/50 bg-slate-900/30 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col"
            >
              <span className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                {stat.value}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
