"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../navbar/page";
import { getProvider } from "@/utils/ethers";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "@/utils/constant";
import { useAccount } from "wagmi";

export default function Votings() {
  const [votings, setVotings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    async function fetchVotings() {
      try {
        setIsLoading(true);
        const provider = getProvider();
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const votingCount = Number(await contract.votingCount());
        let votingList = [];

        for (let i = 1; i <= votingCount; i++) {
          const votingDetails = await contract.getVotingDetails(i);
          votingList.push({
            id: i,
            title: votingDetails[0],
            startTime: Number(votingDetails[1]),
            endTime: Number(votingDetails[2]),
            candidateCount: Number(votingDetails[3]),
            totalVotes: Number(votingDetails[4])
          });
        }

        setVotings(votingList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVotings();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
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
      <div className="flex flex-col items-center justify-start min-h-screen p-8 pt-[85px]" style={{ backgroundImage: "url('/4.jpg')", minHeight: "100vh", backgroundSize: "cover", backgroundPosition: "center" }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Daftar Voting</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {votings.map((voting) => (
            <div key={voting.id} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800">{voting.title}</h2>
              <p className="text-sm text-gray-600">Mulai: {formatDate(voting.startTime)}</p>
              <p className="text-sm text-gray-600">Selesai: {formatDate(voting.endTime)}</p>
              <p className="text-sm text-gray-600">Jumlah Kandidat: {voting.candidateCount}</p>
              <p className="text-sm text-gray-600">Total Suara: {voting.totalVotes}</p>
              <button
                onClick={() => router.push(`/candidates?votingId=${voting.id}`)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Lihat Kandidat
              </button>
              <button
                onClick={() => router.push(`/vote?votingId=${voting.id}`)}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Vote Sekarang
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}