import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import VotingTokenABI from '../lib/abis/VotingToken.json';
import EVotingABI from '../lib/abis/EVoting.json';
import { VOTINGTOKEN_ADDRESS } from '../lib/contractAddresses';

export const useVotingTokenContract = () => {
  const { address } = useAccount();

  // Mengambil status klaim
  const { data: claimActive } = useReadContract({
    address: VOTINGTOKEN_ADDRESS,
    abi: VotingTokenABI.abi,
    functionName: 'claimActive',
  }) as { data: boolean | undefined };

  // Mengambil jumlah klaim
  const { data: claimAmount } = useReadContract({
    address: VOTINGTOKEN_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'claimAmount',
  }) as { data: bigint | undefined };

  // Mengambil ID voting aktif
  const { data: activeVotingId } = useReadContract({
    address: VOTINGTOKEN_ADDRESS,
    abi: VotingTokenABI.abi,
    functionName: 'activeVotingId',
  }) as { data: bigint | undefined };

  // Mengecek apakah pemilih sudah mengklaim token
  const hasClaimed = (votingId: number, userAddress: string) => {
    const { data } = useReadContract({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'hasClaimed',
      args: [votingId, userAddress],
    }) as { data: boolean | undefined };

    return data ?? false;
  };

  // Fungsi untuk mengklaim token voting
  const { writeContract: claimVotingTokens } = useWriteContract();

  const claimTokens = (votingId: number) => {
    claimVotingTokens({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'claimVotingTokens',
      args: [votingId],
    });
  };

  // Fungsi untuk mengatur status klaim (hanya owner)
  const { writeContract: toggleClaim } = useWriteContract();

  const setClaimStatus = (status: boolean) => {
    toggleClaim({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'toggleClaim',
      args: [status],
    });
  };

  // Fungsi untuk mengatur jumlah klaim (hanya owner)
  const { writeContract: setClaimAmount } = useWriteContract();

  const updateClaimAmount = (amount: number) => {
    setClaimAmount({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'setClaimAmount',
      args: [amount],
    });
  };

  // Fungsi untuk mereset status klaim (hanya owner)
  const { writeContract: resetClaimStatus } = useWriteContract();

  const resetUserClaim = (userAddress: string, votingId: number) => {
    resetClaimStatus({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'resetClaimStatus',
      args: [userAddress, votingId],
    });
  };

  // Fungsi untuk mengatur kontrak EVoting (hanya owner)
  const { writeContract: setEVotingContract } = useWriteContract();

  const updateEVotingContract = (eVotingContract: string) => {
    setEVotingContract({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'setEVotingContract',
      args: [eVotingContract],
    });
  };

  // Fungsi untuk mengatur ID voting aktif (hanya EVoting contract)
  const { writeContract: setActiveVotingId } = useWriteContract();

  const updateActiveVotingId = (votingId: number) => {
    setActiveVotingId({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'setActiveVotingId',
      args: [votingId],
    });
  };

  return {
    claimActive: claimActive ?? false,
    claimAmount: Number(claimAmount ?? 0),
    activeVotingId: Number(activeVotingId ?? 0),
    hasClaimed,
    claimTokens,
    setClaimStatus,
    updateClaimAmount,
    resetUserClaim,
    updateEVotingContract,
    updateActiveVotingId,
  };
};