"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"farmer" | "vet" | "admin" | "retailer">("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- CREATE USER ---
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,              // <-- IMPORTANT
          fullname: fullName,      // use lowercase key
          phone: phone,            // safe
        },
      },
    });

    if (error || !data.user) {
      setError(error?.message || "Registration failed");
      setLoading(false);
      return;
    }

    // --- SAVE PROFILE ---
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      fullname: fullName,
      phone: phone,
      role: role,
    });

    if (profileError) {
      setError("Profile save failed: " + profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    // OPTIONAL: Auto redirect based on role
    if (role === "farmer") router.push("/dashboard/farmer");
    else if (role === "retailer") router.push("/dashboard/retailer");
    else if (role === "vet") router.push("/dashboard/vet");
    else router.push("/login");
  };

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
          <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

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
              onChange={(e) => setRole(e.target.value as any)}
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
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
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
      </div>
    </div>
  );
}
