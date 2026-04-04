"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/utils/supabase/client";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthMessage(error.message);
      } else {
        setSession(data.session);
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithMagicLink() {
    setIsSendingLink(true);
    setAuthMessage(null);

    const redirectTo =
      typeof window !== "undefined"
        ? window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage(`Magic link sent to ${email}`);
    }

    setIsSendingLink(false);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthMessage(error.message);
      return false;
    }

    setAuthMessage("Signed out.");
    setSession(null);
    return true;
  }

  return {
    authMessage,
    email,
    isLoading,
    isSendingLink,
    session,
    setAuthMessage,
    setEmail,
    signInWithMagicLink,
    signOut,
  };
}
