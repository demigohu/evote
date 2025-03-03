"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CandidateVoteCard from "@/utils/CandidateVoteCard";
import { getCandidates, voteCandidate, getTotalVotes, getProvider } from "@/utils/ethers";
import { contractABI, contractAddress } from "@/utils/constant";
import Navbar from "../navbar/page";

export default function Vote() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingStart, setVotingStart] = useState<number | null>(null);
  const [votingEnd, setVotingEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = getProvider();
        const candidateList = await getCandidates();
        console.log(candidateList);
        setCandidates(candidateList);

        // Ambil total votes
        const total = await getTotalVotes();
        setTotalVotes(total);

        // Cek apakah voting sudah selesai
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const start = await contract.votingStart();
        const end = await contract.votingEnd();

        
        setVotingStart(Number(start));
        setVotingEnd(Number(end));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleVote = async (candidateId: number) => {
    if (!votingStart || !votingEnd) {
      alert("Data voting belum dimuat, coba lagi nanti.");
      return;
    }
  
    const now = Math.floor(Date.now() / 1000);
    if (now < votingStart) {
      alert(`Voting belum dimulai! Silakan tunggu hingga ${formatDate(votingStart)}.`);
      return;
    }
  
    if (now > votingEnd) {
      alert("Voting sudah berakhir.");
      return;
    }
  
    try {
      await voteCandidate(candidateId);
      console.log(candidateId)
      alert("Vote berhasil!");
      window.location.reload();
    } catch (error) {
      console.error("Voting gagal:", error);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Loading...";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-300 via-purple-200 to-indigo-500 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">TOTAL VOTES : {totalVotes}</h1>
      <p className="text-sm text-gray-700">
        🕒 Voting Start: <strong>{formatDate(votingStart)}</strong>
      </p>
      <p className="text-sm text-gray-700">
        ⏳ Voting End: <strong>{formatDate(votingEnd)}</strong>
      </p>

      <p className={`text-lg font-semibold ${
        Date.now() / 1000 > (votingEnd || 0) ? "text-red-500" : "text-green-500"
      }`}>
        {Date.now() / 1000 > (votingEnd || 0) ? "Voting Has Ended" 
          : Date.now() / 1000 < (votingStart || 0) ? "Voting Has Not Started Yet" 
          : "Voting Is Ongoing"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {candidates.map((candidate) => (
          <CandidateVoteCard
            key={candidate.id}
            id={candidate.id}
            name={candidate.name}
            photoUrl={candidate.photoUrl}
            vision={candidate.vision}
            mission={candidate.mission}
            resumeLink={candidate.resume}
            onVote={handleVote} 
          />
        ))}
      </div>
    </div>
    </>
  );
};