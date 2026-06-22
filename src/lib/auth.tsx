"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { youId as MOCK_YOU } from "./mockData";

type AuthState = {
  ready: boolean;
  isLive: boolean;
  // The current user's PROFILE id (not the auth id). Null when signed out.
  profileId: string | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function resolveProfileId(authId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("id").eq("auth_id", authId).single();
  return data?.id ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In mock mode we're always "signed in" as the demo user (Alex).
  const [profileId, setProfileId] = useState<string | null>(isSupabaseConfigured ? null : MOCK_YOU);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (active && user) {
        setEmail(user.email ?? null);
        setProfileId(await resolveProfileId(user.id));
      }
      if (active) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const user = session?.user;
      setEmail(user?.email ?? null);
      setProfileId(user ? await resolveProfileId(user.id) : null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthState["signIn"] = async (em, password) => {
    if (!isSupabaseConfigured || !supabase) return {}; // mock mode: always ok
    const { error } = await supabase.auth.signInWithPassword({ email: em, password });
    return error ? { error: error.message } : {};
  };

  const signUp: AuthState["signUp"] = async (name, em, password) => {
    if (!isSupabaseConfigured || !supabase) return {};
    const handle = em.split("@")[0];
    const { error } = await supabase.auth.signUp({
      email: em,
      password,
      options: { data: { name, handle } },
    });
    return error ? { error: error.message } : {};
  };

  const signOut: AuthState["signOut"] = async () => {
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
    setProfileId(isSupabaseConfigured ? null : MOCK_YOU);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ ready, isLive: isSupabaseConfigured, profileId, email, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
