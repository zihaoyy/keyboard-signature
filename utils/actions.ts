import {ClaimSignatureParams} from '@/app/api/signatures/claim/route';
import {UnclaimSignatureParams} from '@/app/api/signatures/unclaim/route';

// For client-side use, we'll use the existing supabase client
// Server-side operations will be handled through API endpoints
export async function claimSignatureAction(params: ClaimSignatureParams) {
  // This function is now a client-side wrapper that calls the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/signatures/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.message || 'Failed to claim signature',
    };
  }

  const data = await response.json();
  return {success: true, data};
}

export async function unclaimSignatureAction(params: UnclaimSignatureParams) {
  // This function is now a client-side wrapper that calls the API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/signatures/unclaim`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.message || 'Failed to claim signature',
    };
  }

  const data = await response.json();
  return {success: true, data};
}

export async function getSignatureByNameAction(name: string) {
  // This function is now a client-side wrapper that calls the API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/signatures/${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getClaimedSignaturesAction() {
  // This function is now a client-side wrapper that calls the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/signatures`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getUserClaimedSignaturesAction() {
  // This function is now a client-side wrapper that calls the API
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/signatures/user`);
  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getUserSignatureAction(signature: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/signature/${signature}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}
