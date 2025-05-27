import { useReadContract, useWriteContract } from 'wagmi';
import EVotingABI from '../lib/abis/EVoting.json';
import VotingTokenABI from '../lib/abis/VotingToken.json';
import { EVOTING_ADDRESS, VOTINGTOKEN_ADDRESS } from '../lib/contractAddresses';
import { VotingDetails, Candidate, Winner } from '../types/voting';
import { keccak256, toHex } from 'viem';
import { useMemo } from 'react';

// Custom hook untuk mengambil detail voting berdasarkan votingId
export const useVotingDetails = (votingId: number) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getVotingDetails',
    args: [votingId],
  }) as { data: [string, bigint, bigint, bigint, bigint, bigint] | undefined };

  if (data) {
    return {
      title: data[0],
      votingStart: Number(data[1]),
      votingEnd: Number(data[2]),
      registrationEnd: Number(data[3]),
      candidatesCount: Number(data[4]),
      totalVotes: Number(data[5]),
    };
  }
  return null;
};

// Custom hook untuk mengambil semua kandidat berdasarkan votingId
export const useAllCandidates = (votingId: number) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getAllCandidates',
    args: [votingId],
  }) as { data: { id: bigint; name: string; photoUrl: string; resume: string; vision: string; mission: string; voteCount: bigint }[] | undefined };

  if (data) {
    return data.map((candidate) => ({
      id: Number(candidate.id),
      name: candidate.name,
      photoUrl: candidate.photoUrl,
      resume: candidate.resume,
      vision: candidate.vision,
      mission: candidate.mission,
      voteCount: Number(candidate.voteCount),
    })) as Candidate[];
  }
  return [];
};

// Custom hook untuk mengambil kandidat spesifik berdasarkan votingId dan candidateId
export const useCandidate = (votingId: number, candidateId: number) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getCandidate',
    args: [votingId, candidateId],
  }) as { data: [bigint, string, string, string, string, string, bigint] | undefined };

  if (data) {
    return {
      id: Number(data[0]),
      name: data[1],
      photoUrl: data[2],
      resume: data[3],
      vision: data[4],
      mission: data[5],
      voteCount: Number(data[6]),
    } as Candidate;
  }
  return null;
};

// Custom hook untuk mengambil pemenang berdasarkan votingId
export const useWinner = (votingId: number) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getWinner',
    args: [votingId],
  }) as { data: [bigint, string, bigint, string] | undefined };

  if (data) {
    return {
      id: Number(data[0]),
      name: data[1],
      voteCount: Number(data[2]),
      photoUrl: data[3],
    } as Winner;
  }
  return null;
};

// Custom hook untuk mengecek apakah pemilih sudah terdaftar
export const useIsVoterRegistered = (votingId: number, voterAddress: string) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'isVoterRegistered',
    args: [votingId, voterAddress],
  }) as { data: boolean | undefined };

  return data ?? false;
};

// Custom hook untuk mengecek apakah pemilih sudah memilih
export const useHasVoterVoted = (votingId: number, voterAddress: string) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'hasVoterVoted',
    args: [votingId, voterAddress],
  }) as { data: boolean | undefined };

  return data ?? false;
};

// Custom hook untuk memeriksa allowance token pengguna untuk kontrak EVoting
export const useCheckAllowance = (owner: string) => {
  const { data } = useReadContract({
    address: VOTINGTOKEN_ADDRESS,
    abi: VotingTokenABI.abi,
    functionName: 'allowance',
    args: [owner, EVOTING_ADDRESS],
  }) as { data: bigint | undefined };

  return data ? Number(data) : 0;
};

// Custom hook untuk mengecek apakah pemilih sudah terdaftar (isRegistered)
export const useIsRegistered = (votingId: number, voterAddress: string) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'isRegistered',
    args: [votingId, voterAddress],
  }) as { data: boolean | undefined };

  return data ?? false;
};

// Custom hook untuk mengambil hash email pemilih
export const useVoterEmailHash = (votingId: number, voterAddress: string) => {
  const { data } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getVoterEmailHash',
    args: [votingId, voterAddress],
  }) as { data: string | undefined };

  return data ?? '0x0';
};

// Hook utama untuk kontrak EVoting
export const useEVotingContract = () => {
  const { writeContractAsync } = useWriteContract();

  // Mengambil alamat admin
  const { data: admin } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'admin',
  }) as { data: string | undefined };

  // Mengambil jumlah voting
  const { data: votingCount } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'votingCount',
  }) as { data: bigint | undefined };

  // Mengambil semua voting details
  const { data: allVotingDetailsRaw } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getAllVotingDetails',
  }) as { data: { id: bigint; title: string; votingStart: bigint; votingEnd: bigint; registrationEnd: bigint; candidatesCount: bigint; totalVotes: bigint }[] | undefined };

  // Mengambil semua pemenang
  const { data: allWinners } = useReadContract({
    address: EVOTING_ADDRESS,
    abi: EVotingABI.abi,
    functionName: 'getAllWinners',
  }) as { data: { votingId: bigint; votingTitle: string; winnerId: bigint; winnerName: string; voteCount: bigint; photoUrl: string }[] | undefined };

  // Gunakan useMemo untuk mencegah pembuatan array baru setiap render
  const allVotingDetails = useMemo(() => {
    return (allVotingDetailsRaw || []).map((voting) => ({
      id: Number(voting.id),
      title: voting.title,
      votingStart: Number(voting.votingStart),
      votingEnd: Number(voting.votingEnd),
      registrationEnd: Number(voting.registrationEnd),
      candidatesCount: Number(voting.candidatesCount),
      totalVotes: Number(voting.totalVotes),
    })) as VotingDetails[];
  }, [allVotingDetailsRaw]);

  // Mendapatkan semua pemenang
  const getAllWinners = () => {
    if (allWinners) {
      return allWinners.map((winner) => ({
        votingId: Number(winner.votingId),
        votingTitle: winner.votingTitle,
        winnerId: Number(winner.winnerId),
        winnerName: winner.winnerName,
        voteCount: Number(winner.voteCount),
        photoUrl: winner.photoUrl,
      }));
    }
    return [];
  };

  // Meng-approve token untuk kontrak EVoting
  const approveVotingTokens = async (amount: string) => {
    const hash = await writeContractAsync({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'approve',
      args: [EVOTING_ADDRESS, amount],
    });
    return hash;
  };

  // Fungsi untuk mendaftar sebagai pemilih
  const registerVoter = async (votingId: number, email: string) => {
    const emailHash = keccak256(toHex(email));
    const hash = await writeContractAsync({
      address: EVOTING_ADDRESS,
      abi: EVotingABI.abi,
      functionName: 'selfRegister',
      args: [votingId, emailHash],
    });
    return hash;
  };

  // Fungsi untuk memilih kandidat
  const castVote = async (votingId: number, candidateId: number) => {
    const hash = await writeContractAsync({
      address: EVOTING_ADDRESS,
      abi: EVotingABI.abi,
      functionName: 'vote',
      args: [votingId, candidateId],
    });
    return hash;
  };

  // Fungsi untuk membuat voting baru
  const createVoting = async (
    title: string,
    candidateNames: string[],
    photoUrls: string[],
    resumes: string[],
    visions: string[],
    missions: string[],
    votingStart: number,
    votingEnd: number,
    registrationEnd: number
  ) => {
    const hash = await writeContractAsync({
      address: EVOTING_ADDRESS,
      abi: EVotingABI.abi,
      functionName: 'createVoting',
      args: [
        title,
        candidateNames,
        photoUrls,
        resumes,
        visions,
        missions,
        votingStart,
        votingEnd,
        registrationEnd,
      ],
    });
    return hash;
  };

  // Fungsi untuk mengklaim token voting
  const claimVotingTokens = async (votingId: number) => {
    const hash = await writeContractAsync({
      address: VOTINGTOKEN_ADDRESS,
      abi: VotingTokenABI.abi,
      functionName: 'claimVotingTokens',
      args: [votingId],
    });
    return hash;
  };

  return {
    admin,
    votingCount: Number(votingCount ?? 0),
    allVotingDetails,
    getAllWinners,
    approveVotingTokens,
    registerVoter,
    castVote,
    createVoting,
    claimVotingTokens,
  };
};