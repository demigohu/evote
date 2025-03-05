"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CandidateVoteCard from "@/utils/CandidateVoteCard";
import { getCandidates, voteCandidate, getTotalVotes, getProvider, getWinner } from "@/utils/ethers";
import { contractABI, contractAddress } from "@/utils/constant";
import Navbar from "../navbar/page";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function Vote() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingStart, setVotingStart] = useState<number | null>(null);
  const [votingEnd, setVotingEnd] = useState<number | null>(null);
  const [winner, setWinner] = useState<{ id: number, name: string, votes: number, photoUrl: string } | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [approveStatus, setApproveStatus] = useState<"loading" | "success" | "failed">("loading");
  const [voteStatus, setVoteStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Update ukuran confetti saat resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
  
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = getProvider();
        const candidateList = await getCandidates();
        setCandidates(candidateList);

        // Ambil total votes
        const total = await getTotalVotes();
        setTotalVotes(total);

        // Ambil waktu voting
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

  const handleVote = async (candidateId: bigint | number) => {
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
  
    setSelectedCandidate(Number(candidateId)); // Simpan candidate ID ke state
    setIsTransactionModalOpen(true); // Buka modal
    setApproveStatus("loading");
    setVoteStatus("idle");
  
    try {
      const { approveSuccess, voteSuccess } = await voteCandidate(Number(candidateId), setApproveStatus, setVoteStatus);
  
      if (approveSuccess && voteSuccess) {
        setTimeout(() => {
          setIsTransactionModalOpen(false);
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Voting gagal:", error);
    }
  };
  
  

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Loading...";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleGetWinner = async () => {
    try {
      const winnerData = await getWinner();
      setWinner(winnerData);
      setIsWinnerModalOpen(true);
    } catch (error) {
      console.error("Error fetching winner:", error);
      alert("Gagal mengambil pemenang.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-[85px]" style={{ backgroundImage: "url('/4.jpg')", minHeight: "100vh", backgroundSize: "cover", backgroundPosition: "center" }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">TOTAL VOTES : {totalVotes}</h1>
        <p className="text-sm text-gray-700">
          🕒 Voting Start: <strong>{formatDate(votingStart)}</strong>
        </p>
        <p className="text-sm text-gray-700">
          ⏳ Voting End: <strong>{formatDate(votingEnd)}</strong>
        </p>

        <p className={`text-lg pt-2 font-semibold ${
          Date.now() / 1000 > (votingEnd || 0) ? "text-red-500" : "text-green-500"
        }`}>
          {Date.now() / 1000 > (votingEnd || 0) ? (
            <button 
              onClick={handleGetWinner} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              🎉 See Winner
            </button>
          ) : Date.now() / 1000 < (votingStart || 0) ? "Voting Has Not Started Yet" 
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

      {/* MODAL Transaction */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }} // Animasi awal
            animate={{ opacity: 1, scale: 1 }} // Animasi saat muncul
            exit={{ opacity: 0, scale: 0.7 }} // Animasi saat ditutup
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white p-6 rounded-lg shadow-lg w-96 text-center"
          >
            <h2 className="text-xl font-bold">📝 Voting Progress</h2>

            {/* Step 1: Approve Token */}
            <div className="flex items-center justify-between mt-4">
              <p>Approving Token...</p>
              {approveStatus === "loading" && (
                <motion.div 
                  className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              )}
              {approveStatus === "success" && <span className="text-green-500">✅</span>}
              {approveStatus === "failed" && (
                <button onClick={() => handleVote(Number(selectedCandidate))} className="text-red-500 underline">
                  Retry
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: approveStatus === "loading" ? "50%" : voteStatus === "loading" ? "100%" : "100%" }}
              transition={{ duration: 2 }}
              className="h-2 bg-blue-500 mt-4 rounded-lg"
            />

            {/* Step 2: Voting */}
            <div className="flex items-center justify-between mt-4">
              <p>Submitting Vote...</p>
              {voteStatus === "loading" && (
                <motion.div 
                  className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              )}
              {voteStatus === "success" && <span className="text-green-500">✅</span>}
              {voteStatus === "failed" && (
                <button onClick={() => voteCandidate(Number(selectedCandidate), setApproveStatus, setVoteStatus)} className="text-red-500 underline">
                  Retry
                </button>
              )}
            </div>

            {/* Close Modal Button */}
            {voteStatus === "success" && (
              <motion.button
                onClick={() => setIsTransactionModalOpen(false)}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Done
              </motion.button>
            )}
          </motion.div>
        </div>
      )}


      {/* MODAL WINNER */}
      {isWinnerModalOpen && winner && (
        <>
          {/* 🎉 Confetti Effect */}
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={300} // Banyaknya confetti
            recycle={true} // Hanya muncul sekali
            gravity={0.2} // Kecepatan jatuh confetti
          />
        {/* Modal dengan Animasi */}
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} // Animasi awal (fade-in + zoom)
            animate={{ opacity: 1, scale: 1 }} // Animasi setelah muncul
            exit={{ opacity: 0, scale: 0.5 }} // Animasi saat ditutup
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 The Winner</h2>
            <img 
              src={winner.photoUrl} 
              alt={winner.name} 
              className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-yellow-500"
            />
            <h3 className="text-xl font-semibold mt-4">{winner.name}</h3>
            <p className="text-gray-600">Total Votes: {winner.votes}</p>
            <button 
              onClick={() => setIsWinnerModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Close
            </button>
          </motion.div>
        </div> 
        </>
      )}
    </>
  );
};
