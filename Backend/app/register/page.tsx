"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Ensure this path is correct
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  // Defaulting to "farmer", but you might want a placeholder or validation
  const [role, setRole] = useState("farmer"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- CREATE USER ---
    // We only need to sign up. The Postgres Trigger handles the profile creation
    // using the data inside 'options.data'.
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
       // Optional: Short delay or immediate push
       handleRedirect(role);
    }
  };

  const handleRedirect = (userRole) => {
     if (userRole === "farmer") router.push("/dashboard/farmer");
     else if (userRole === "retailer") router.push("/dashboard/retailer");
     else if (userRole === "vet") router.push("/dashboard/vet");
     else router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
          FarmSeva – Register
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Create your account to access smart agriculture tools.
        </p>

        {error && (
          <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        {successMessage ? (
           <div className="text-green-700 text-center mb-4 bg-green-50 p-4 rounded border border-green-200">
             <p className="font-semibold">Check your inbox!</p>
             <p className="text-sm mt-1">{successMessage}</p>
             <button 
               onClick={() => router.push('/login')}
               className="mt-4 text-emerald-600 hover:underline text-sm"
             >
               Back to Login
             </button>
           </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-700">Select Role</label>
              <select
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="farmer">Farmer</option>
                <option value="retailer">Retailer</option>
                <option value="vet">Veterinary Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-xs text-center text-gray-500 mt-2">
              Already have an account?{" "}
              <a href="/login" className="text-emerald-600 font-medium">
                Login
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}