"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar/page";
import { getCandidates, getWinner, getProvider } from "@/utils/ethers";
import CandidateCard from "@/utils/CandidateCard";
import { contractABI, contractAddress } from "@/utils/constant";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";

export default function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [winner, setWinner] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votingEnd, setVotingEnd] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
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
    async function fetchData() {
      try {
        setIsLoading(true);
        const provider = getProvider();
        const network = await provider.getNetwork();
        console.log("Network ID:", network.chainId);
        console.log("Provider:", provider);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        const votingDetails = await contract.getVotingDetails(votingId);
        const end = Number(votingDetails[2]);
        setVotingEnd(end);

        const candidatesList = await getCandidates(votingId);
        setCandidates(candidatesList);

        if (Date.now() / 1000 > end) {
          const winnerData = await getWinner(votingId);
          if (winnerData) {
            setWinner({
              id: winnerData?.id,
              name: winnerData?.name,
              votes: winnerData?.votes,
              photoUrl: winnerData?.photoUrl,
            });
          }
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [votingId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col items-center justify-start min-h-screen p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2 pt-5">Kandidat</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              name={candidate.name}
              photoUrl={candidate.photoUrl}
              vision={candidate.vision}
              mission={candidate.mission}
              resumeLink={candidate.resume}
            />
          ))}
        </div>
      </div>

      {isModalOpen && winner && (
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
                onClick={() => setIsModalOpen(false)}
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