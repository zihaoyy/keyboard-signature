import {createSupabaseServiceClient} from '@/utils/supabase/server';
import {NextResponse} from 'next/server';

interface SignatureImageProps {
  params: Promise<{ name: string }>
}

export async function GET(request: Request, {params}: SignatureImageProps) {
  const name = (await params).name;

  if (!name) {
    return NextResponse.json({message: 'Invalid signature name'}, {status: 400});
  }

  try {
    // Use service role client for database operations
    const serviceClient = await createSupabaseServiceClient();

    const {data, error} = await serviceClient
    .from('claimed_signatures')
    .select('*')
    .eq('name', name.toUpperCase())
    .maybeSingle();

    if (error) {
      console.error('Error fetching signature:', error);
      return NextResponse.json({message: 'Failed to fetch signature'}, {status: 500});
    }
    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return NextResponse.json({message: 'Internal server error'}, {status: 500});
  }
}
