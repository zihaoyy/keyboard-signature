import {useState, useEffect} from "react";
import {User} from "@supabase/supabase-js";
import {createSupabaseBrowserClient} from "@/utils/supabase/client";

export interface AuthUser {
  id: string;
  username: string;
  profilePic: string;
  email?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(formatUser(session.user));
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(formatUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatUser = (supabaseUser: User): AuthUser => {
    const userMetadata = supabaseUser.user_metadata;
    return {
      id: supabaseUser.id,
      username:
        userMetadata.user_name ||
        userMetadata.preferred_username ||
        userMetadata.screen_name ||
        "user",
      profilePic:
        userMetadata.avatar_url ||
        userMetadata.picture ||
        userMetadata.profile_image_url ||
        "",
      email: supabaseUser.email || undefined,
    };
  };

  const signInWithGithub = async () => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_URL,
      },
    });
    if (error) {
      console.error("Error signing in:", error.message);
    }
  };

  const signOut = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return {
    user,
    isLoading,
    signInWithGithub,
    signOut,
  };
};
