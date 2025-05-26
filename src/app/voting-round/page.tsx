'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useEVotingContract } from '../../hooks/useEVotingContract';

export default function VotingRound() {
  const [isLoading, setIsLoading] = useState(true);
  const { allVotingDetails } = useEVotingContract();

  useEffect(() => {
    if (allVotingDetails) {
      setIsLoading(false);
    }
  }, [allVotingDetails]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getVotingStatus = (startTime: number, endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    if (now < startTime) return 'Belum Dimulai';
    if (now > endTime) return 'Selesai';
    return 'Sedang Berlangsung';
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
      <div
        className="flex flex-col items-center justify-start min-h-screen p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Daftar Voting</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allVotingDetails.map((voting) => (
            <div key={voting.id} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800">{voting.title}</h2>
              <p className="text-sm text-gray-600">Mulai: {formatDate(voting.votingStart)}</p>
              <p className="text-sm text-gray-600">Selesai: {formatDate(voting.votingEnd)}</p>
              <p className="text-sm text-gray-600">Jumlah Kandidat: {voting.candidatesCount}</p>
              <p className="text-sm text-gray-600">Total Suara: {voting.totalVotes}</p>
              <p
                className={`text-sm font-semibold mt-2 ${
                  getVotingStatus(voting.votingStart, voting.votingEnd) === 'Selesai'
                    ? 'text-red-500'
                    : getVotingStatus(voting.votingStart, voting.votingEnd) === 'Belum Dimulai'
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`}
              >
                Status: {getVotingStatus(voting.votingStart, voting.votingEnd)}
              </p>
              <Link
                href={`/voting-round/${voting.id}`}
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Lihat Kandidat
              </Link>
              <Link
                href={`/register/${voting.id}`}
                className="mt-2 ml-2 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Daftar untuk Vote
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}