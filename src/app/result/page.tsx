'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEVotingContract } from '../../hooks/useEVotingContract';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Nonaktifkan SSR untuk Navbar
const Navbar = dynamic(() => import('../../components/Navbar'), { ssr: false });

export default function Result() {
  const { getAllWinners } = useEVotingContract();

  // Ambil data pemenang langsung dari getAllWinners
  const winners = getAllWinners();

  // Jika data belum tersedia, kita anggap masih loading
  const loading = !winners;

  // Format data pemenang
  const results = winners.map((winner) => ({
    votingId: winner.votingId,
    title: winner.votingTitle,
    winner: {
      id: winner.winnerId,
      name: winner.winnerName,
      voteCount: winner.voteCount,
      photoUrl: winner.photoUrl,
    },
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="flex flex-col items-center justify-start min-h-screen p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Hasil Voting</h1>
        {results.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <p className="text-gray-700">
              Belum ada voting yang selesai atau belum ada pemenang untuk ditampilkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result) => (
              <div
                key={result.votingId}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-2">{result.title}</h2>
                <p className="text-sm text-gray-600 mb-4">Voting ID: {result.votingId}</p>
                <Image
                  src={result.winner.photoUrl}
                  alt={result.winner.name}
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-yellow-500 mb-4"
                  onError={() => console.error(`Failed to load image for ${result.winner.name}`)}
                  placeholder="blur"
                  blurDataURL="/placeholder-image.jpg" // Ganti dengan URL placeholder yang sesuai
                />
                <h3 className="text-xl font-semibold text-gray-800">{result.winner.name}</h3>
                <p className="text-gray-600">Total Suara: {result.winner.voteCount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}