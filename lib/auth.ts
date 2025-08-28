import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/utils/supabase/server";

export async function getServerUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: {user},
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

export async function requireAuth() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({message: "Unauthorized"}, {status: 401});
  }

  return user;
}
