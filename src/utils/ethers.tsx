import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constant";

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

export const getTotalVotes = async () => {
  const provider = getProvider();
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  const totalVotes = await contract.totalVotes();
  return Number (totalVotes);
};

export const voteCandidate = async (candidateId: number) => {
  // if (!window.ethereum) throw new Error("Metamask not found");
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.vote(candidateId);
  await tx.wait();
};