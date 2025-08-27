import {NextResponse} from "next/server";
import {createSupabaseServerClient, createSupabaseServiceClient} from "@/utils/supabase/server";

export interface UnclaimSignatureParams {
  name: string;
  username: string;
}

export async function POST(request: Request) {
  try {
    const {name, username} = (await request.json()) as UnclaimSignatureParams;

    // Validate input
    if (!name || !username) {
      return NextResponse.json({error: "Missing required parameters"}, {status: 400});
    }

    // Sanitize name - only allow alphanumeric characters and spaces
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (!sanitizedName) {
      return NextResponse.json({error: "Invalid signature name"}, {status: 401});
    }

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

    // Check if signature is claimed
    const {data: existingClaim, error: checkError} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .eq("name", sanitizedName.toUpperCase())
    .eq("claimed_by_user_id", user.id)
    .limit(1)
    .maybeSingle();

    if (checkError) {
      return NextResponse.json({error: "Failed to check existing claim"}, {status: 500});
    }

    if (!existingClaim) {
      return NextResponse.json({error: "signature_not_found"}, {status: 404});
    }

    // Delete the claimed signature by record id
    const {data, error} = await serviceClient
    .from("claimed_signatures")
    .delete()
    .eq("id", existingClaim.id);

    if (error) {
      console.log(error);
      return NextResponse.json({error: "Failed to unclaim signature"}, {status: 500});
    }

    return Response.json({success: "true"});
  } catch (error) {
    console.error("Error unclaiming signature:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
