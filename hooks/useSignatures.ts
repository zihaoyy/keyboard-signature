import {useCallback, useEffect, useState} from 'react';
import {claimSignatureAction, getClaimedSignaturesAction, getSignatureByNameAction,} from '@/utils/actions';
import {ClaimedSignature, CurveType, KeyboardLayout, StrokeConfig} from '@/types/signature';


export const useSignatures = () => {
  const [claimedSignatures, setClaimedSignatures] = useState<ClaimedSignature[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClaimedSignatures = useCallback(async () => {
    try {
      const data = await getClaimedSignaturesAction();
      console.log(data, 'data');
      setClaimedSignatures(data);
    } catch (error) {
      console.error('Error fetching signatures:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const claimSignature = async (
    userId: string,
    username: string,
    avatar: string | null,
    name: string,
    signaturePath: string,
    strokeConfig: StrokeConfig,
    includeNumbers: boolean,
    curveType: CurveType,
    keyboardLayout: KeyboardLayout,
  ) => {
    try {
      const result = await claimSignatureAction({
        name,
        signaturePath,
        strokeConfig,
        includeNumbers,
        curveType,
        keyboardLayout,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      // Add to local state
      if (result.data) {
        setClaimedSignatures((prev) => [
          result.data as ClaimedSignature,
          ...prev,
        ]);
      }

      return {success: true, data: result.data};
    } catch (error) {
      console.error('Error claiming signature:', error);
      return {success: false, message: 'claim_failed'};
    }
  };

  const getSignatureByName = async (name: string) => {
    try {
      return await getSignatureByNameAction(name);
    } catch (error) {
      console.error('Error fetching signature:', error);
      return null;
    }
  };

  const getUserClaimedSignatures = (userId: string) => {
    return claimedSignatures.filter((sig) => sig.claimed_by_user_id === userId);
  };

  const searchSignatures = (query: string) => {
    if (!query.trim()) return claimedSignatures;

    const searchTerm = query.toLowerCase().trim();
    return claimedSignatures.filter(
      (sig) =>
        sig.name.toLowerCase().includes(searchTerm) ||
        sig.claimed_by_username.toLowerCase().includes(searchTerm)
    );
  };

  useEffect(() => {
    fetchClaimedSignatures();
  }, [fetchClaimedSignatures]);

  return {
    claimedSignatures,
    isLoading,
    claimSignature,
    getSignatureByName,
    getUserClaimedSignatures,
    searchSignatures,
    fetchClaimedSignatures,
  };
};
