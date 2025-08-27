import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/auth";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // First, authenticate the user using the client-side client
    const userClient = await createServerSupabaseClient(req, res);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Use service role client for database operations (bypasses RLS)
    const serviceClient = createServiceSupabaseClient();

    const { data, error } = await serviceClient
      .from("claimed_signatures")
      .select("*")
      .eq("claimed_by_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user signatures:", error);
      return new Response("Failed to fetch user signatures", { status: 500 });
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("Error fetching user signatures:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
