import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, ChevronRight, LockKeyhole, Eye, CheckCircle2, MonitorSmartphone } from 'lucide-react';
import { Button, Glass, Page } from '../components/ui';

export default function Home() {
  return (
    <Page className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950 shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ProctorX</span>
        </div>

        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <Link to="/about-platform" className="relative group px-4 py-2">
            <span className="text-sm font-semibold text-slate-300 group-hover:text-teal-400 transition-colors">About Platform</span>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-teal-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register">
            <Button className="h-10 px-5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-16 sm:px-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.15)] backdrop-blur-sm">
            <Sparkles className="h-4 w-4" /> Next-Generation AI Proctoring
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl leading-[1.1]">
            Secure exams <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              without the stress.
            </span>
          </h1>
          
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            ProctorX delivers enterprise-grade security with advanced AI monitoring, live coding environments, and comprehensive analytics—all in a beautifully calm interface.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register">
              <Button className="h-14 px-8 rounded-full text-lg bg-white text-slate-950 hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2">
                Get Started for Free
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <button className="h-14 px-8 rounded-full text-lg font-medium text-white border border-slate-700 hover:bg-slate-800/50 transition-all backdrop-blur-sm">
                View Demo
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid w-full grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Glass className="p-6 text-left hover:-translate-y-2 transition-transform duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 text-teal-400">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Vision Analysis</h3>
            <p className="text-slate-400 leading-relaxed">
              Real-time facial recognition and movement tracking to ensure academic integrity seamlessly.
            </p>
          </Glass>
          
          <Glass className="p-6 text-left hover:-translate-y-2 transition-transform duration-300 delay-75">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
            <p className="text-slate-400 leading-relaxed">
              Bank-grade encryption, secure browser lockdown, and JWT protected architecture.
            </p>
          </Glass>

          <Glass className="p-6 text-left hover:-translate-y-2 transition-transform duration-300 delay-150">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <MonitorSmartphone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Integrated Workspace</h3>
            <p className="text-slate-400 leading-relaxed">
              Built-in Monaco editor for live coding assessments and seamless multimedia questions.
            </p>
          </Glass>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 pt-10 border-t border-slate-800/50 w-full flex flex-col items-center"
        >
          <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-widest">Trusted by innovative institutions</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Abstract logos made with icons/text for demo */}
            <div className="flex items-center gap-2 font-bold text-xl text-white"><CheckCircle2 className="h-6 w-6" /> EduTech</div>
            <div className="flex items-center gap-2 font-bold text-xl text-white"><Sparkles className="h-6 w-6" /> GlobalUni</div>
            <div className="flex items-center gap-2 font-bold text-xl text-white"><ShieldCheck className="h-6 w-6" /> SecureCert</div>
          </div>
        </motion.div>
      </main>
    </Page>
  );
}
