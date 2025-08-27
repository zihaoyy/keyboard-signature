import {StrokeConfig} from "@/utils/constants";
import {createSupabaseServerClient, createSupabaseServiceClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";

export interface ClaimSignatureParams {
  name: string;
  signaturePath: string;
  strokeConfig: StrokeConfig;
  includeNumbers: boolean;
}

export async function POST(request: Request) {
  try {
    const {name, signaturePath, strokeConfig, includeNumbers} =
      (await request.json()) as ClaimSignatureParams;
    // Validate input
    if (!name || !signaturePath || !strokeConfig) {
      return NextResponse.json({error: "Missing required parameters"}, {status: 400});
    }

    // Sanitize name - only allow alphanumeric characters and spaces
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (!sanitizedName) {
      return NextResponse.json({error: "Invalid signature name"}, {status: 400});
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

    // Check if signature is already claimed
    const {data: existingClaim, error: checkError} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .eq("name", sanitizedName.toUpperCase())
    .limit(1)
    .maybeSingle();

    if (checkError) {
      return NextResponse.json({error: "Failed to check existing claims"}, {status: 500});
    }

    if (existingClaim) {
      return NextResponse.json({error: "signature_already_claimed"}, {status: 409});
    }

    // Check if user already has a claimed signature (one per account limit)
    const {data: userExistingClaim, error: userCheckError} =
      await serviceClient
      .from("claimed_signatures")
      .select("*")
      .eq("claimed_by_user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (userCheckError) {
      return NextResponse.json({error: "Failed to check user claims"}, {status: 500});
    }

    // i (conrad) get two signatures because one is for my girlfriend :)
    if (userExistingClaim && user.user_metadata.user_name !== "notcnrad") {
      return NextResponse.json({error: "user_already_claimed"}, {status: 409});
    }

    // Get user metadata
    const userMetadata = user.user_metadata;
    const username =
      userMetadata?.user_name ||
      userMetadata?.preferred_username ||
      userMetadata?.screen_name ||
      "user";
    const avatar =
      userMetadata?.avatar_url ||
      userMetadata?.picture ||
      userMetadata?.profile_image_url ||
      null;

    // Claim the signature using service role client
    const insertData = {
      name: sanitizedName.toUpperCase(),
      signature_path: signaturePath,
      claimed_by_user_id: user.id,
      claimed_by_username: username,
      claimed_by_avatar: avatar,
      stroke_config: strokeConfig,
      include_numbers: includeNumbers,
    };

    const {data, error} = await serviceClient
    .from("claimed_signatures")
    .insert(insertData)
    .select()
    .limit(1)
    .maybeSingle();

    if (error) {
      return NextResponse.json({error: "Failed to claim signature"}, {status: 500});
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error claiming signature:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
