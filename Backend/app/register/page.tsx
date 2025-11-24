"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"farmer" | "vet" | "admin">("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      setError(error?.message || "Registration failed");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      phone,
      role,
    });

    if (profileError) {
      setError("Profile save failed: " + profileError.message);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">
          FarmSeva Portal – Register
        </h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border rounded px-3 py-2 text-sm"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Phone"
          className="w-full border rounded px-3 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select
          className="w-full border rounded px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="farmer">Farmer</option>
          <option value="vet">Veterinary Officer</option>
          <option value="admin">Admin</option>
        </select>

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
          Create Account
        </button>

        <p className="text-xs text-center text-neutral-500">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-600 font-medium">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
