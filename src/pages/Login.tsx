import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Lock } from "lucide-react";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-600 shadow-diffuse mb-6 hover:scale-105 transition-transform duration-300">
            <span className="text-white font-heading font-bold text-lg">TC</span>
          </Link>
          <h1 className="text-2xl font-heading font-black text-[#0D1117] mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your member portal</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" placeholder="you@company.com" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-heading font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-green-700 font-medium hover:text-green-800">Forgot password?</a>
          </div>

          <button type="button" className="w-full btn-premium bg-[#0D1117] hover:bg-navy-mid text-white justify-center shadow-navy-diffuse mt-2">
            Sign In
            <span className="btn-icon-wrap !bg-white/10"><ArrowRight size={14} /></span>
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Not a member yet? <Link to="/register" className="text-green-700 font-semibold hover:underline">Apply here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
