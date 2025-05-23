'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEVotingContract } from '../hooks/useEVotingContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [totalVotings, setTotalVotings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { allVotingDetails } = useEVotingContract();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setTotalVotings(allVotingDetails.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data voting.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [allVotingDetails]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">E-Voting HMIF</h1>
          <p className="text-gray-700 mb-6">
            Selamat datang di platform E-Voting HMIF! Berikan suara Anda untuk memilih kandidat terbaik dalam pemilihan yang aman dan transparan menggunakan teknologi Web3.
          </p>

          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-800">
              Total Voting Tersedia: {totalVotings}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/voting-round"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Lihat Daftar Voting
            </Link>
            <Link
              href="/register"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Registrasi untuk Voting
            </Link>
            <Link
              href="/result"
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
            >
              Lihat Hasil Voting
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}