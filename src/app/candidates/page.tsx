"use client";
import { useEffect, useState } from "react";
import Navbar from "../navbar/page";
import { getCandidates } from "@/utils/ethers";
import CandidateCard from "@/utils/CandidateCard";

export default function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const candidatesList = await getCandidates();
        setCandidates(candidatesList);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCandidates();
  }, []);

  return (
    <>
    <Navbar />
    <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-gradient-to-br from-teal-300 via-purple-200 to-indigo-500">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
    </>
  );
}