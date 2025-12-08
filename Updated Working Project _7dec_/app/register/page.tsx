"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, User, Phone, Briefcase, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("farmer"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- CREATE USER ---
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // These fields are passed to the trigger via raw_user_meta_data
        data: {
          role: role,
          fullname: fullName,
          phone: phone,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if session is null (Email confirmation is likely ON)
    if (data.user && !data.session) {
      setSuccessMessage("Registration successful! Please check your email to verify your account.");
      setLoading(false);
      return;
    }

    // If session exists (Email confirmation is OFF), redirect immediately
    if (data.user && data.session) {
       handleRedirect(role);
    }
  };

  const handleRedirect = (userRole: string) => {
     if (userRole === "farmer") router.push("/dashboard/farmer");
     else if (userRole === "retailer") router.push("/dashboard/retailer");
     else if (userRole === "vet") router.push("/dashboard/vet");
     else router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-neutral-800">
      <Navbar />
      
      <div className="flex flex-1 pt-32">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" 
            alt="Agriculture Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent" />
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">FarmSeva</span>
          </div>

          <div className="max-w-md">
            <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-green-400"></div>)}
            </div>
            <blockquote className="text-3xl font-serif leading-snug mb-6">
              "Joining FarmSeva was the best decision for my poultry business. The veterinary support is world-class."
            </blockquote>
            <div>
              <p className="font-bold text-lg">Anita Desai</p>
              <p className="text-green-300">Poultry Farmer, Maharashtra</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-50 lg:bg-white overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6 py-8"
        >
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-6 justify-center">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                    <Leaf size={18} />
                </div>
                <span className="text-xl font-bold text-neutral-900">FarmSeva</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-2">Create Account</h1>
            <p className="text-neutral-500">Join our community of smart farmers today.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </motion.div>
          )}

          {successMessage ? (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
             >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Check your inbox!</h3>
                <p className="text-green-800 text-sm mb-6">{successMessage}</p>
                <button 
                  onClick={() => router.push('/login')}
                  className="text-sm font-bold text-green-700 hover:text-green-800 underline"
                >
                  Back to Login
                </button>
             </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm font-medium"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Phone</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                            <Phone size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="+91..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm font-medium"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">I am a...</label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Briefcase size={18} />
                    </div>
                    <select
                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="farmer">Farmer</option>
                        <option value="retailer">Retailer / Buyer</option>
                        <option value="vet">Veterinary Officer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-2 border-neutral-200">
                        <ArrowRight size={14} className="text-neutral-400 rotate-90" />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-sm font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Creating Account...
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-neutral-100 mt-6">
            <p className="text-sm text-neutral-500">
                Already have an account?{" "}
                <Link href="/login" className="text-green-700 font-bold hover:underline">
                    Log in here
                </Link>
            </p>
          </div>

          {!successMessage && (
            <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-neutral-400 justify-center">
                    <CheckCircle2 size={12} className="text-green-500"/> No Credit Card
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-neutral-400 justify-center">
                    <CheckCircle2 size={12} className="text-green-500"/> Instant Access
                </div>
            </div>
          )}

        </motion.div>
      </div>
      </div>
      <Footer />
    </div>
  );
}