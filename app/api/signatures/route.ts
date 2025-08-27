import { createServiceSupabaseClient } from "@/lib/auth";

export async function GET() {
  try {
    // Use service role client for database operations
    const serviceClient = createServiceSupabaseClient();

    const { data, error } = await serviceClient
      .from("claimed_signatures")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching signatures:", error);
      return new Response("Failed to fetch signatures", { status: 500 });
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
