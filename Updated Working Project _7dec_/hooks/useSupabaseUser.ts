"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

type SupabaseUser = {
  user_metadata: any;
  id: string;
  email: string | null;
  displayName: string;
  role?: string | null;
};

export function useSupabaseUser() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && pathname !== '/register' && pathname !== '/login' && pathname !== '/') {
        setUser(null);
        setLoading(false);
        // not logged in → login page
        router.push("/login");
        return;
      }

  const { data: profile } = await supabase
  .from("profiles")
  .select("fullname, role")
  .eq("id", user.id)
  .single();

const displayName =
  (profile as any)?.fullname || user.email?.split("@")[0] || "Farmer";

setUser({
  id: user.id,
  email: user.email,
  displayName,
  role: (profile as any)?.role ?? null,
});


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
        if (!u && pathname !== '/register' && pathname !== '/login' && pathname !== '/') {
          setUser(null);
          router.push("/login");
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  return { user, loading };
}
