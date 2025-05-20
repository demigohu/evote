import { ethers } from "ethers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { contractABI, contractAddress, tokenAddress, tokenABI } from "./constant";

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask tidak terdeteksi");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getContractWithSigner() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

export async function getCandidates(votingId: number) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    const votingDetails = await contract.getVotingDetails(votingId);
    const count = Number(votingDetails[3]);
    const votingEnd = Number(votingDetails[2]);
    const isVotingEnded = Math.floor(Date.now() / 1000) > votingEnd;

    let candidates = [];
    for (let i = 1; i <= count; i++) {
      const candidate = await contract.getCandidate(votingId, i);
      candidates.push({
        id: candidate[0],
        name: candidate[1],
        photoUrl: candidate[2],
        resume: candidate[3],
        vision: candidate[4],
        mission: candidate[5],
        voteCount: isVotingEnded ? candidate[6].toString() : "0"
      });
    }
    return candidates;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    toast.error("Gagal mengambil daftar kandidat!");
    return [];
  }
}

export async function getTotalVotes(votingId: number) {
  const provider = getProvider();
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const votingDetails = await contract.getVotingDetails(votingId);
  return Number(votingDetails[4]);
}

export async function voteCandidate(
  votingId: number,
  candidateId: number,
  setApproveStatus: (status: "loading" | "success" | "failed") => void,
  setVoteStatus: (status: "idle" | "loading" | "success" | "failed") => void
): Promise<{ 
  approveSuccess: boolean; 
  voteSuccess: boolean;
  approveTxHash?: string;
  voteTxHash?: string;
}> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const votingContract = new ethers.Contract(contractAddress, contractABI, signer);
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
  const allowance = await tokenContract.allowance(await signer.getAddress(), contractAddress);

  let approveSuccess = false;
  let voteSuccess = false;
  let approveTxHash: string | undefined;
  let voteTxHash: string | undefined;

  if (allowance < ethers.parseUnits("1", 18)) {
    try {
      setApproveStatus("loading");
      const approveTx = await tokenContract.approve(contractAddress, ethers.parseUnits("1", 18));
      approveTxHash = approveTx.hash;
      await approveTx.wait();
      setApproveStatus("success");
      approveSuccess = true;
    } catch (error) {
      console.error("Approval gagal:", error);
      setApproveStatus("failed");
      return { approveSuccess: false, voteSuccess: false };
    }
  } else {
    approveSuccess = true;
    setApproveStatus("success");
  }

  setVoteStatus("loading");
  try {
    const voteTx = await votingContract.vote(votingId, candidateId);
    voteTxHash = voteTx.hash;
    await voteTx.wait();
    setVoteStatus("success");
    voteSuccess = true;
  } catch (error) {
    console.error("Voting gagal:", error);
    setVoteStatus("failed");
    return { approveSuccess: true, voteSuccess: false };
  }

  return { approveSuccess, voteSuccess, approveTxHash, voteTxHash };
}

export async function getWinner(votingId: number) {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const winner = await contract.getWinner(votingId);
    return {
      id: Number(winner[0]),
      name: winner[1],
      votes: Number(winner[2]),
      photoUrl: winner[3]
    };
  } catch (error) {
    console.error("Error fetching winner:", error);
    return null;
  }
}

export async function checkVoterStatus(votingId: number, voterAddress: string) {
  const provider = getProvider();
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const isRegistered = await contract.isVoterRegistered(votingId, voterAddress);
  const hasVoted = await contract.hasVoterVoted(votingId, voterAddress);
  return { isRegistered, hasVoted };
}

export async function checkClaimStatus(voterAddress: string) {
  const provider = getProvider();
  const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
  const hasClaimed = await contract.hasClaimed(voterAddress);
  return hasClaimed;
}

export async function claimToken() {
  if (!window.ethereum) {
    toast.error("Metamask tidak terdeteksi!");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, tokenABI, signer);

  try {
    const tx = await contract.claimVotingTokens();
    console.log("Transaksi dikirim:", tx.hash);
    toast.info("Transaksi sedang diproses...");
    await tx.wait();
    toast.success("Token berhasil diklaim!");
  } catch (error: any) {
    console.error("Gagal klaim token:", error);
    if (error.message.includes("Tokens are non-transferable")) {
      toast.error("Token tidak dapat ditransfer!");
    } else if (error.message.includes("You have already claimed")) {
      toast.error("Anda sudah mengklaim token sebelumnya!");
    } else {
      toast.error("Gagal klaim token: " + error.message);
    }
  }
}

export async function isAdmin() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const adminAddress = await contract.admin();
  return userAddress.toLowerCase() === adminAddress.toLowerCase();
}