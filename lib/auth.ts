import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/utils/supabase/server";

export async function getServerUser(request: Request) {
  const supabase = await createSupabaseServerClient(request);

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

export async function requireAuth(request: Request) {
  const user = await getServerUser(request);

  if (!user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  return user;
}
