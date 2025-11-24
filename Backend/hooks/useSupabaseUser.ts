"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type SupabaseUser = {
  id: string;
  email: string | null;
  displayName: string;
  role?: string | null;
};

export function useSupabaseUser() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setLoading(false);
        // not logged in → login page
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      const displayName =
        profile?.full_name || user.email?.split("@")[0] || "Farmer";

      setUser({
        id: user.id,
        email: user.email,
        displayName,
        role: profile?.role,
      });

      setLoading(false);
    }

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user;
        if (!u) {
          setUser(null);
          router.push("/login");
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading };
}
