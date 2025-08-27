import {createSupabaseServiceClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export async function GET() {
  try {
    // Use service role client for database operations
    const serviceClient = createSupabaseServiceClient();

    const {data, error} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .order("created_at", {ascending: false});

    if (error) {
      console.error("Error fetching signatures:", error);
      return NextResponse.json({error: "Failed to fetch signatures"}, {status: 500});
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
