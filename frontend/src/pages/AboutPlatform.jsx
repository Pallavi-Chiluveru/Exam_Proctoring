import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight,
  ClipboardList,
  Camera,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Shield,
  CheckCircle2,
  XCircle,
  FileCode2,
  Eye,
  Activity,
  Award
} from 'lucide-react';
import { Button, Glass, Page } from '../components/ui';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function AboutPlatform() {
  return (
    <Page className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-300 selection:bg-teal-500/30 font-sans">
      
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-teal-500/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 sm:px-10 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ProctorX</span>
        </Link>
        
        <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <Link to="/about-platform" className="relative group px-4 py-2">
            <span className="text-sm font-semibold text-teal-400">About Platform</span>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-teal-400 scale-x-100 transition-transform duration-300" />
            <div className="absolute inset-0 bg-teal-400/10 rounded-lg -z-10" />
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

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12 sm:px-10">
        
        {/* 1. Hero Section */}
        <motion.section 
          initial="hidden" animate="visible" variants={fadeIn}
          className="text-center max-w-4xl mx-auto mb-32 pt-10"
        >
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-6">
            ProctorX
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-8">
            AI-Powered Online Examination & Proctoring Platform
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-3xl mx-auto">
            ProctorX is a complete assessment ecosystem that allows administrators to create exams, conduct secure online assessments, monitor candidates in real time using AI-powered proctoring, generate automated results, and analyze exam integrity through detailed reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#features" className="h-14 px-8 rounded-full text-lg bg-white text-slate-950 hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 font-semibold">
              Explore Features
              <ArrowRight className="h-5 w-5" />
            </a>
            <a href="https://github.com/Pallavi-Chiluveru/Exam_Proctoring/blob/main/architecture.svg" target="_blank" rel="noreferrer" className="h-14 px-8 rounded-full text-lg font-medium text-white border border-slate-700 hover:bg-slate-800/50 hover:border-slate-500 transition-all backdrop-blur-sm flex items-center justify-center">
              View Architecture
            </a>
          </div>
        </motion.section>

        {/* 2. Core Platform Features */}
        <motion.section 
          id="features"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="mb-32 scroll-mt-24"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Core Platform Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={fadeIn}>
              <Glass className="h-full p-6 border-blue-500/20 hover:border-blue-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">📝 Assessment Creation</h3>
                <p className="text-sm text-slate-400 mb-3 font-medium">Create and manage:</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> MCQ Assessments</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> MSQ Assessments</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Descriptive Tests</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Coding Challenges</li>
                </ul>
              </Glass>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Glass className="h-full p-6 border-teal-500/20 hover:border-teal-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">🎥 AI-Powered Proctoring</h3>
                <p className="text-sm text-slate-400 mb-3 font-medium">Monitor candidates using:</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Webcam Monitoring</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Face Detection</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Identity Verification</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Browser Activity Tracking</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Screen Monitoring</li>
                </ul>
              </Glass>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Glass className="h-full p-6 border-purple-500/20 hover:border-purple-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">📊 Results & Analytics</h3>
                <p className="text-sm text-slate-400 mb-3 font-medium">Generate:</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Automatic Results</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Performance Reports</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Candidate Analytics</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Assessment Insights</li>
                </ul>
              </Glass>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Glass className="h-full p-6 border-rose-500/20 hover:border-rose-500/50 transition-all group">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">🛡️ Integrity & Risk Analysis</h3>
                <p className="text-sm text-slate-400 mb-3 font-medium">Track:</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Violations</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Suspicious Activities</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Risk Scores</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Integrity Reports</li>
                </ul>
              </Glass>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. Complete Assessment Lifecycle */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Complete Assessment Lifecycle</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">ProctorX handles the entire examination process from start to finish.</p>
          </div>

          <Glass className="p-8 sm:p-12 border border-slate-800 relative max-w-3xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-[39px] sm:left-1/2 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500 via-teal-500 to-purple-500 z-0 sm:-translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col gap-8">
              {[
                { title: "Create Assessment", desc: "Admin configures exam and questions" },
                { title: "Candidate Verification", desc: "System verifies identity and hardware" },
                { title: "Take Examination", desc: "Candidate attempts the secure exam" },
                { title: "AI Proctoring & Monitoring", desc: "Continuous live tracking for integrity" },
                { title: "Automatic Evaluation", desc: "System scores MCQ, coding, and MSQ" },
                { title: "Results Generation", desc: "Final scores and analytics produced" },
                { title: "Integrity Report & Risk Analysis", desc: "Detailed review of exam violations" }
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-6 sm:gap-8 group ${index % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                  
                  {/* Empty side for alternating layout on desktop */}
                  <div className="hidden sm:block flex-1" />

                  {/* Node */}
                  <div className="shrink-0 relative z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-bold text-white bg-slate-900 border-[3px] border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                    <h4 className="text-lg font-bold text-slate-200">
                      {item.title}
                    </h4>
                  </div>

                </div>
              ))}
            </div>
          </Glass>
        </motion.section>

        {/* 4. User Roles Section */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="mb-32"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">User Roles</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Admin Portal */}
            <motion.div variants={fadeIn}>
              <Glass className="h-full p-8 border-blue-500/30 bg-blue-900/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Shield className="h-8 w-8" /></div>
                    <h3 className="text-3xl font-bold text-white">👨‍💼 Admin Portal</h3>
                  </div>
                  <p className="text-blue-400 font-medium mb-8">Manage Assessments & Monitor Candidates</p>
                  
                  <ul className="space-y-3">
                    {[
                      "Create assessments", "Manage question banks", "Add MCQ questions", 
                      "Add MSQ questions", "Add descriptive questions", "Add coding challenges", 
                      "Configure examination settings", "Monitor live examinations", 
                      "View candidate activity", "Review proctoring violations", "Generate results", 
                      "Generate integrity reports", "Track risk scores", "View analytics dashboards", 
                      "Manage users and permissions"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Glass>
            </motion.div>

            {/* Student Portal */}
            <motion.div variants={fadeIn}>
              <Glass className="h-full p-8 border-emerald-500/30 bg-emerald-900/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><GraduationCap className="h-8 w-8" /></div>
                    <h3 className="text-3xl font-bold text-white">🎓 Student Portal</h3>
                  </div>
                  <p className="text-emerald-400 font-medium mb-8">Take Assessments & Track Performance</p>
                  
                  <ul className="space-y-3">
                    {[
                      "Register and login securely", "Access assigned assessments", 
                      "Complete identity verification", "Attempt MCQ exams", "Attempt coding assessments", 
                      "Submit descriptive answers", "Participate in secure online exams", "View results", 
                      "View performance reports", "Review feedback", "Track assessment history", 
                      "Monitor progress", "Access learning resources"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Glass>
            </motion.div>
          </div>
        </motion.section>

        {/* 5. Why ProctorX? */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
          className="mb-20"
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why ProctorX?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional */}
            <Glass className="p-8 border-slate-800 bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-400 mb-6 flex items-center justify-center gap-2">
                Traditional Exam Platforms
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-500">
                  <XCircle className="h-5 w-5 shrink-0" />
                  Assessment only
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                  <XCircle className="h-5 w-5 shrink-0" />
                  Limited monitoring
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                  <XCircle className="h-5 w-5 shrink-0" />
                  Basic reporting
                </li>
              </ul>
            </Glass>

            {/* ProctorX */}
            <Glass className="p-8 border-teal-500/50 bg-teal-900/10 relative shadow-[0_0_30px_rgba(20,184,166,0.15)]">
              <div className="absolute -top-3 -right-3 bg-teal-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                The Solution
              </div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                <ShieldCheck className="h-6 w-6 text-teal-400" />
                ProctorX
              </h3>
              <ul className="space-y-4">
                {[
                  "Assessment Creation", "AI Proctoring", "Live Monitoring", 
                  "Automatic Evaluation", "Results Generation", "Integrity Reports", 
                  "Risk Analysis", "Analytics Dashboard"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Glass>
          </div>
        </motion.section>

      </main>
    </Page>
  );
}
