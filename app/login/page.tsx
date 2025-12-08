"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import {Navbar}  from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Login failed");
      }

      const user = data.user;

      // 2) GET ROLE FROM user_metadata (most reliable)
      let role = user.user_metadata.role;

      // 3) Fallback to profiles table if missing
      if (!role) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        role = profile?.role || "farmer";
      }

      // 4) Hard override for main admin email
      if (email === "admin@farmseva.in") {
        role = "admin";
      }

      // 5) Redirect based on final role
      if (role === "admin") router.push("/dashboard/admin");
      else if (role === "vet") router.push("/dashboard/vet");
      else if (role === "retailer") router.push("/dashboard/retailer");
      else router.push("/dashboard/farmer");

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-neutral-800">
      <Navbar />
      
      <div className="flex flex-1 pt-32">
      {/* Left Panel - Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop" 
            alt="Farm Background" 
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
              "FarmSeva connected me to a subsidy I didn't know existed. It changed my farm's future."
            </blockquote>
            <div>
              <p className="font-bold text-lg">Rajesh Kumar</p>
              <p className="text-green-300">Pig Farmer, Punjab</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-50 lg:bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-8 justify-center">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                    <Leaf size={18} />
                </div>
                <span className="text-xl font-bold text-neutral-900">FarmSeva</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-3">Welcome Back</h1>
            <p className="text-neutral-500">Enter your details to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
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

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-neutral-900 placeholder:text-neutral-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-neutral-900 placeholder:text-neutral-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end mt-2">
                    <Link href="#" className="text-sm font-semibold text-green-600 hover:text-green-700">Forgot Password?</Link>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-50 lg:bg-white text-neutral-500 font-medium">New to FarmSeva?</span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 text-green-700 font-bold hover:text-green-800 transition-colors p-2 rounded-lg hover:bg-green-50"
            >
              Create an Account <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quick Features */}
          <div className="pt-8 grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                <CheckCircle2 size={14} className="text-green-500" /> Free Registration
             </div>
             <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                <CheckCircle2 size={14} className="text-green-500" /> Secure Data
             </div>
             <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                <CheckCircle2 size={14} className="text-green-500" /> Government Backed
             </div>
             <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                <CheckCircle2 size={14} className="text-green-500" /> 24/7 Support
             </div>
          </div>

        </motion.div>
      </div>
      </div>
      <Footer />
    </div>
  );
}