"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CandidateVoteCard from "@/utils/CandidateVoteCard";
import { getCandidates, voteCandidate, getTotalVotes, getProvider, getWinner, checkVoterStatus } from "@/utils/ethers";
import { contractABI, contractAddress } from "@/utils/constant";
import Navbar from "../navbar/page";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

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
  const [approveTxHash, setApproveTxHash] = useState<string | null>(null);
  const [voteTxHash, setVoteTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const votingId = Number(searchParams.get("votingId")) || 1;

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

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
        setIsLoading(true);
        const provider = getProvider();
        const candidateList = await getCandidates(votingId);
        setCandidates(candidateList);

        const total = await getTotalVotes(votingId);
        setTotalVotes(total);

        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const votingDetails = await contract.getVotingDetails(votingId);
        const start = Number(votingDetails[1]);
        const end = Number(votingDetails[2]);

        setVotingStart(start);
        setVotingEnd(end);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [votingId]);

  const handleVote = async (candidateId: bigint | number) => {
    if (!votingStart || !votingEnd) {
      toast.error("Data voting belum dimuat, coba lagi nanti.");
      return;
    }
  
    const now = Math.floor(Date.now() / 1000);
    if (now < votingStart) {
      toast.error(`Voting belum dimulai! Silakan tunggu hingga ${formatDate(votingStart)}.`);
      return;
    }
    if (now > votingEnd) {
      toast.error("Voting sudah berakhir.");
      return;
    }

    const voterAddress = (await getProvider().getSigner()).address;
    const { isRegistered, hasVoted } = await checkVoterStatus(votingId, voterAddress);

    if (!isRegistered) {
      toast.error("Anda belum terdaftar sebagai pemilih!");
      return;
    }
    if (hasVoted) {
      toast.error("Anda sudah memilih sebelumnya!");
      return;
    }
  
    setSelectedCandidate(Number(candidateId));
    setIsTransactionModalOpen(true);
    setApproveStatus("loading");
    setVoteStatus("idle");
    setApproveTxHash(null);
    setVoteTxHash(null);
  
    try {
      const { approveSuccess, voteSuccess, approveTxHash, voteTxHash } = await voteCandidate(
        votingId,
        Number(candidateId), 
        setApproveStatus, 
        setVoteStatus
      );
  
      if (approveTxHash) setApproveTxHash(approveTxHash);
      if (voteTxHash) setVoteTxHash(voteTxHash);
  
      if (approveSuccess && voteSuccess) {
        setVoteStatus("success");
      }
    } catch (error) {
      console.error("Voting gagal:", error);
    }
  };
  
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Memuat...";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleGetWinner = async () => {
    try {
      const winnerData = await getWinner(votingId);
      setWinner(winnerData);
      setIsWinnerModalOpen(true);
    } catch (error) {
      console.error("Error fetching winner:", error);
      toast.error("Gagal mengambil pemenang.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-[85px]" style={{ backgroundImage: "url('/4.jpg')", minHeight: "100vh", backgroundSize: "cover", backgroundPosition: "center" }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">TOTAL SUARA: {totalVotes}</h1>
        <p className="text-sm text-gray-700">
          🕒 Waktu Mulai Voting: <strong>{formatDate(votingStart)}</strong>
        </p>
        <p className="text-sm text-gray-700">
          ⏳ Waktu Selesai Voting: <strong>{formatDate(votingEnd)}</strong>
        </p>

        <p className={`text-lg pt-2 font-semibold ${
          Date.now() / 1000 > (votingEnd || 0) ? "text-red-500" : "text-green-500"
        }`}>
          {Date.now() / 1000 > (votingEnd || 0) ? (
            <button 
              onClick={handleGetWinner} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              🎉 Lihat Pemenang
            </button>
          ) : Date.now() / 1000 < (votingStart || 0) ? "Voting Belum Dimulai" 
            : "Voting Sedang Berlangsung"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
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

      {isTransactionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white p-6 rounded-2xl shadow-xl w-96 text-left"
          >
            <h2 className="text-2xl font-bold flex items-center gap-2 justify-center">
              📝 Progres Voting
            </h2>

            <div className="flex flex-col items-start mt-4 w-full">
              {approveStatus === "loading" && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  Menyetujui Token...
                  <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}

              {approveStatus === "loading" && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5 }}
                  className="h-2 bg-blue-500 mt-2 rounded-lg"
                />
              )}

              {approveStatus === "success" && (
                <div className="flex justify-between items-center w-full mt-2">
                  <span className="text-green-500 text-lg">✅ Disetujui</span>
                  {approveTxHash && (
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${approveTxHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 text-md hover:underline"
                    >
                      🔗
                    </a>
                  )}
                </div>
              )}

              {approveStatus === "failed" && (
                <button 
                  onClick={() => handleVote(Number(selectedCandidate))} 
                  className="mt-2 text-red-500 underline hover:text-red-700 transition"
                >
                  Coba Lagi
                </button>
              )}
            </div>

            <div className="flex flex-col items-start mt-4 w-full">
              {voteStatus === "loading" && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  Mengirim Suara...
                  <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}

              {voteStatus === "loading" && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-2 bg-blue-500 mt-2 rounded-lg"
                />
              )}

              {voteStatus === "success" && (
                <div className="flex justify-between items-center w-full mt-2">
                  <span className="text-green-500 text-lg">✅ Suara Terkirim</span>
                  {voteTxHash && (
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${voteTxHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 text-md hover:underline"
                    >
                      🔗
                    </a>
                  )}
                </div>
              )}

              {voteStatus === "failed" && (
                <button 
                  onClick={() => voteCandidate(votingId, Number(selectedCandidate), setApproveStatus, setVoteStatus)} 
                  className="mt-2 text-red-500 underline hover:text-red-700 transition"
                >
                  Coba Lagi
                </button>
              )}
            </div>

            {voteStatus === "success" && approveStatus === "success" && (
              <motion.button
                onClick={() => setIsTransactionModalOpen(false)}
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md flex justify-center mx-auto"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Selesai
              </motion.button>
            )}
          </motion.div>
        </div>
      )}

      {isWinnerModalOpen && winner && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={300}
            recycle={true}
            gravity={0.2}
          />
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Pemenang</h2>
              <img 
                src={winner.photoUrl} 
                alt={winner.name} 
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-yellow-500"
              />
              <h3 className="text-xl font-semibold mt-4">{winner.name}</h3>
              <p className="text-gray-600">Total Suara: {winner.votes}</p>
              <button 
                onClick={() => setIsWinnerModalOpen(false)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Tutup
              </button>
            </motion.div>
          </div> 
        </>
      )}
    </>
  );
}