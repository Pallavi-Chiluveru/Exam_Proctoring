import React from 'react';
import { motion } from 'framer-motion';

export default function TechStack() {
  const technologies = [
    { name: 'MongoDB', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { name: 'Express.js', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20' },
    { name: 'React.js', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { name: 'Node.js', color: 'text-green-600', bg: 'bg-green-600/10', border: 'border-green-600/20' },
    { name: 'Socket.IO', color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' },
    { name: 'JWT', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { name: 'Cloudinary', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'OpenAI', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  ];

  return (
    <section id="tech-stack" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-8">
          Powered By Modern Technology
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`px-6 py-3 rounded-full border ${tech.bg} ${tech.border} backdrop-blur-sm flex items-center shadow-lg transition-transform hover:-translate-y-1 cursor-default`}
            >
              <span className={`font-medium ${tech.color}`}>
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
