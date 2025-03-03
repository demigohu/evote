import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {contractABI, contractAddress} from "./constant";
import { getProvider } from "./ethers";

interface CandidateProps {
  id: number;
  name: string;
  photoUrl: string;
  vision: string;
  mission: string;
  resumeLink: string;
  onVote: (candidateId: number) => void;
}

const CandidateVoteCard: React.FC<CandidateProps> = ({ id, name, photoUrl, vision, mission, resumeLink, onVote }) => {
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const provider = getProvider(); // Ganti dengan RPC node kamu
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const voteCount = await contract.getVoteCount(id);
        setVotes(Number(voteCount));
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    fetchVotes();
  }, [id]); // Fetch ulang jika ID kandidat berubah

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
      <img src={photoUrl} alt={name} className="w-full h-40 object-cover rounded-xl mb-4" />
      <h2 className="text-lg font-bold text-gray-800">{name}</h2>

      {/* Tombol Detail Candidate */}
      <button
        onClick={() => console.log("Show candidate details")}
        className="mt-2 border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition w-full"
      >
        Detail Candidate
      </button>

      {/* Menampilkan hasil voting */}
      <p className="mt-2 text-gray-700 font-semibold">Total Votes: {votes}</p>

      {/* Tombol Vote */}
      <button
        onClick={() => onVote(id)}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
      >
        Vote Now
      </button>
    </div>
  );
};

export default CandidateVoteCard;
