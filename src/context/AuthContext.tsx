import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";


export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "member";
  membership_status: "none" | "pending" | "active" | "expired" | "rejected";
  membership_type: "individual" | "sme" | "corporate" | "enterprise" | "associate" | null;
  company_name: string | null;
  phone: string | null;
  business_address: string | null;
  business_category: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isActiveMember: boolean;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch or auto-create a profile row for the given user.
 * This is a pure async function with no React state side-effects.
 */
async function getOrCreateProfile(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  try {
    // 1. Try to fetch existing profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return data as Profile;
    }

    // 2. If no profile found, auto-create one
    if (error?.code === "PGRST116" || error?.message?.includes("coerce") || error?.details?.includes("0 rows")) {
      console.log("Profile not found, auto-creating for:", userId);

      const { data: newData, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email || "",
          full_name: fullName || "New Member",
          role: "member",
          membership_status: "none",
        })
        .select()
        .single();

      if (!insertError && newData) {
        return newData as Profile;
      }

      // 3. Handle duplicate key (concurrent creation)
      if (insertError?.code === "23505" || insertError?.message?.includes("duplicate key")) {
        const { data: retryData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (retryData) return retryData as Profile;
      }

      console.error("Failed to auto-create profile:", insertError?.message);
      return null;
    }

    console.error("Error fetching profile:", error?.message);
    return null;
  } catch (err) {
    console.error("Profile fetch exception:", err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Track whether initial auth check is done
  const authReady = useRef(false);

  // ── Effect 1: Auth state listener (synchronous callback, as Supabase recommends) ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // This callback MUST stay synchronous — no async/await here.
        // Supabase fires INITIAL_SESSION on subscribe, covering initial load.
        setUser(session?.user ?? null);
        authReady.current = true;
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── Effect 2: Fetch profile whenever user changes ──
  useEffect(() => {
    // Don't run until auth has resolved at least once
    if (!authReady.current) return;

    // No user → clear profile, done loading
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // User exists → fetch their profile
    let cancelled = false;

    getOrCreateProfile(
      user.id,
      user.email || "",
      user.user_metadata?.full_name
    ).then((result) => {
      if (!cancelled) {
        setProfile(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Effect 3: Safety net — never stay stuck on loading ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("[AuthContext] Safety timeout — forcing loading=false");
        }
        return false;
      });
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const refetchProfile = async () => {
    if (user) {
      const result = await getOrCreateProfile(
        user.id,
        user.email || "",
        user.user_metadata?.full_name
      );
      setProfile(result);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const isAdmin = profile?.role === "admin";
  const isActiveMember = profile?.membership_status === "active";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isActiveMember,
        logout,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
