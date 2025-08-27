import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { parse, serialize } from "cookie";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Client for server-side operations with service role (full access)
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key - NEVER expose to client
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Client for API routes with user context (limited access)
export async function createServerSupabaseClient(
  req: NextRequest,
  res: NextResponse
) {
  if (!req || !res) {
    throw new Error(
      "Request and response objects are required for server-side auth"
    );
  }
  console.log(req, "reqreqreq");

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const names = cookieStore.get(name);
          console.log(names, "names");

          return names;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set(name, "", options);
        },
      },
    }
  );
}

export async function getServerUser(req: NextRequest, res: NextResponse) {
  const supabase = await createServerSupabaseClient(req, res);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    username:
      user.user_metadata?.user_name ||
      user.user_metadata?.preferred_username ||
      user.user_metadata?.screen_name ||
      "user",
    profilePic:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.user_metadata?.profile_image_url ||
      "",
    email: user.email,
  };
}

export async function requireAuth(req: NextRequest, res: NextResponse) {
  const user = await getServerUser(req, res);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  return user;
}
