import {createSupabaseServerClient, createSupabaseServiceClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  try {
    // First, authenticate the user using the client-side client
    const userClient = await createSupabaseServerClient(request);
    const {
      data: {user},
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    // Use service role client for database operations (bypasses RLS)
    const serviceClient = createSupabaseServiceClient();

    const {data, error} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .eq("claimed_by_user_id", user.id)
    .order("created_at", {ascending: false});

    if (error) {
      console.error("Error fetching user signatures:", error);
      return NextResponse.json({error: "Failed to fetch user signatures"}, {status: 500});
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("Error fetching user signatures:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
