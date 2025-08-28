import {NextRequest, NextResponse} from "next/server";
import {createSupabaseServiceClient} from "@/utils/supabase/server";

interface SignatureImageProps {
  params: Promise<{ name: string }>
}

export async function GET(req: NextRequest, {params}: SignatureImageProps) {
  try {
    const {name: originName} = await params;
    const name = decodeURIComponent(originName as string);

    if (!name) {
      return NextResponse.json({message: "Invalid signature name"}, {status: 400});
    }

    // Use service role client for database operations
    const serviceClient = await createSupabaseServiceClient();

    const {data, error} = await serviceClient
    .from("claimed_signatures")
    .select("*")
    .eq("name", name.toUpperCase())
    .limit(1)
    .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching signature:", error);
      return NextResponse.json({message: "Failed to fetch signature"}, {status: 500});
    }

    if (!data) {
      NextResponse.json({message: "Signature not found"}, {status: 404});
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching signature:", error);
    NextResponse.json({message: "Internal server error"}, {status: 500});
  }
}
