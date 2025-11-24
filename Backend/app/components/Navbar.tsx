"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="fixed top-0 inset-x-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-20">
      <div className="font-semibold text-emerald-700">
      FarmSeva –
For Pig & Poultry
Farmers Across India
      </div>
      <button
        onClick={handleLogout}
        className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
      >
        Logout
      </button>
    </nav>
  );
}
