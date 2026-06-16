import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Video, FileText, Bell, Lock, UserCheck } from 'lucide-react';

export default function Features() {
  const features = [
    {
      title: 'AI Monitoring',
      description: 'Advanced computer vision algorithms track head movement, eye focus, and detect unauthorized individuals or objects.',
      icon: <Eye className="w-6 h-6 text-cyan-400" />,
      delay: 0.1,
    },
    {
      title: 'Live Proctoring',
      description: 'Human proctors can join any active session instantly to review flagged behaviors in real-time.',
      icon: <Video className="w-6 h-6 text-blue-400" />,
      delay: 0.2,
    },
    {
      title: 'Integrity Reports',
      description: 'Comprehensive post-exam reports detailing every flagged event with timestamped video evidence.',
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      delay: 0.3,
    },
    {
      title: 'Real-Time Alerts',
      description: 'Instant notifications sent to administrators when suspicious activity is detected with high confidence.',
      icon: <Bell className="w-6 h-6 text-cyan-400" />,
      delay: 0.4,
    },
    {
      title: 'Browser Lockdown',
      description: 'Enforces full-screen mode, prevents tab switching, disables copy-paste, and blocks external applications.',
      icon: <Lock className="w-6 h-6 text-blue-400" />,
      delay: 0.5,
    },
    {
      title: 'Student Verification',
      description: 'Multi-factor identity verification using facial recognition and ID card scanning before exam entry.',
      icon: <UserCheck className="w-6 h-6 text-indigo-400" />,
      delay: 0.6,
    },
  ];

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
            Powerful Features for Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Online Examinations</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Our comprehensive suite of tools ensures a cheat-free environment without compromising the test-taker's experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(8,145,178,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
