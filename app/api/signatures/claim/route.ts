import {NextResponse} from "next/server";
import {StrokeConfig} from "@/utils/constants";
import {createSupabaseServerClient, createSupabaseServiceClient} from "@/utils/supabase/server";
import {getServerUser} from "@/utils/auth";

export interface ClaimSignatureParams {
  name: string;
  signaturePath: string;
  strokeConfig: StrokeConfig;
  includeNumbers: boolean;
}

export async function POST(request: Request) {
  try {
    const allowedClaimCount = parseInt(process.env.ALLOWED_CLAIM_SIGNATURE_COUNT || '1');
    const {name, signaturePath, strokeConfig, includeNumbers} =
      (await request.json()) as ClaimSignatureParams;
    // Validate input
    if (!name || !signaturePath || !strokeConfig) {
      return NextResponse.json({message: "Missing required parameters"}, {status: 400});
    }

    // Sanitize name - only allow alphanumeric characters and spaces
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (!sanitizedName) {
      return NextResponse.json({message: "Invalid signature name"}, {status: 400});
    }
    // First, authenticate the user using the client-side client
    const userClient = await createSupabaseServerClient();
    const users = await getServerUser();
    const {
      data: {user},
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }
    // Use service role client for database operations (bypasses RLS)
    const serviceClient = await createSupabaseServiceClient();

    // Check if signature is already claimed
    const {data: existingClaim, error: checkError} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .eq("name", sanitizedName.toUpperCase())
    .limit(1)
    .maybeSingle();

    if (checkError) {
      return NextResponse.json({message: "Failed to check existing claims"}, {status: 500});
    }

    if (existingClaim) {
      return NextResponse.json({message: "signature_already_claimed"}, {status: 409});
    }

    // Check if the user already has more signatures than the number declared
    const {data: userClaimedData, error: userCheckError} =
      await serviceClient
      .from("claimed_signatures")
      .select("*")
      .eq("claimed_by_user_id", user.id);

    if (userCheckError) {
      return NextResponse.json({message: "Failed to check user claims"}, {status: 500});
    }

    if (userClaimedData?.length >= allowedClaimCount) {
      return NextResponse.json({message: "user_already_claimed"}, {status: 409});
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
    .limit(allowedClaimCount)
    .maybeSingle();

    if (error) {
      return NextResponse.json({message: "Failed to claim signature"}, {status: 500});
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error claiming signature:", error);
    return NextResponse.json({message: "Internal server error"}, {status: 500});
  }
}
