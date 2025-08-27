import { createServiceSupabaseClient } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { name: originName } = await req.json();
    const name = decodeURIComponent(originName as string);

    if (!name || typeof name !== "string") {
      return new Response("Invalid signature name", { status: 400 });
    }

    console.log(name);

    // Use service role client for database operations
    const serviceClient = createServiceSupabaseClient();

    const { data, error } = await serviceClient
      .from("claimed_signatures")
      .select("*")
      .eq("name", name.toUpperCase())
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching signature:", error);
      return new Response("Failed to fetch signature", { status: 500 });
    }

    if (!data) {
      return new Response("Signature not found", { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching signature:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
