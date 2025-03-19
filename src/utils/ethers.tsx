import { ethers } from "ethers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { contractABI, contractAddress, tokenAddress, tokenABI } from "./constant";

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask is not installed");
  return new ethers.BrowserProvider(window.ethereum);
}



export async function getContractWithSigner() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}


export async function getCandidates() {
  const provider = getProvider();
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  // Ambil jumlah kandidat
  const count = await contract.candidatesCount();
  let candidates = [];

  for (let i = 1; i <= count; i++) {
    const candidate = await contract.getCandidate(i);
    candidates.push({
      id: candidate[0],
      name: candidate[1],
      photoUrl: candidate[2],
      resume: candidate[3],
      vision: candidate[4],
      mission: candidate[5],
      voteCount: candidate[6].toString()
    });
  }

  return candidates;
}

export async function getTotalVotes() {
  const provider = getProvider();
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const totalVotes = await contract.totalVotes();
  return Number (totalVotes);
}

export async function voteCandidate (
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

  // Step 1: Approve Token jika diperlukan
  if (allowance < ethers.parseUnits("1", 18)) {
    try {
      setApproveStatus("loading");
      const approveTx = await tokenContract.approve(contractAddress, ethers.parseUnits("1", 18));
      approveTxHash = approveTx.hash; // Simpan hash transaksi approve
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

  // Step 2: Lakukan Voting
  setVoteStatus("loading");
  try {
    const voteTx = await votingContract.vote(candidateId);
    voteTxHash = voteTx.hash; // Simpan hash transaksi vote
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




export async function getWinner() {
    try {
        const provider = getProvider();
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const winner = await contract.getWinner();
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

export async function claimToken() {
  if (!window.ethereum) {
    alert("Metamask tidak terdeteksi!");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, tokenABI, signer);

  try {
    const tx = await contract.claimVotingTokens();
    console.log("Transaksi dikirim:", tx.hash);
    toast.info("Transaksi sedang diproses...");

    await tx.wait(); // Tunggu transaksi selesai
    console.log("Klaim berhasil!");
    toast.success("Token berhasil diklaim!");
  } catch (error) {
    console.error("Gagal klaim token:", error);
    toast.error("Gagal klaim token!");
  }
}