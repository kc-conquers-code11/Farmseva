"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // 1) LOGIN
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setError(error?.message || "Login failed");
      return;
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">
          FarmSeva Portal – Login
        </h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm hover:bg-emerald-700"
        >
          Login
        </button>

        <p className="text-xs text-center text-neutral-500">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-emerald-600 font-medium">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
