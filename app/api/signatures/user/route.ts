import {createSupabaseServerClient, createSupabaseServiceClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  try {
    // First, authenticate the user using the client-side client
    const userClient = await createSupabaseServerClient();
    const {
      data: {user},
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    // Use service role client for database operations (bypasses RLS)
    const serviceClient = await createSupabaseServiceClient();

    const {data, error} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .eq("claimed_by_user_id", user.id)
    .order("created_at", {ascending: false});

    if (error) {
      console.error("Error fetching user signatures:", error);
      return NextResponse.json({message: "Failed to fetch user signatures"}, {status: 500});
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("Error fetching user signatures:", error);
    return NextResponse.json({message: "Internal server error"}, {status: 500});
  }
}
