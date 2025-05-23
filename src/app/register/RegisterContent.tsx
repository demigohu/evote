'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEVotingContract } from '../../hooks/useEVotingContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Nonaktifkan SSR untuk Navbar
const Navbar = dynamic(() => import('../../components/Navbar'), { ssr: false });

export default function RegisterContent() {
  const [email, setEmail] = useState('');

  const { address } = useAccount();
  const searchParams = useSearchParams();
  const votingId = Number(searchParams.get('votingId')) || 1;
  const { isVoterRegistered, registerVoter } = useEVotingContract();

  // Ambil status registrasi langsung dari isVoterRegistered
  const isRegistered = address ? isVoterRegistered(votingId, address) : false;

  // Tentukan status loading berdasarkan keberadaan data
  const loading = !address || isRegistered === undefined;

  const handleRegister = async () => {
    try {
      if (!email) {
        toast.error('Email harus diisi.');
        return;
      }

      if (isRegistered) {
        toast.error('Anda sudah terdaftar untuk voting ini.');
        return;
      }

      // Panggil fungsi registerVoter dari useEVotingContract
      await registerVoter(votingId, email);

      toast.success('Berhasil mendaftar sebagai pemilih!');
      setEmail('');
    } catch (error) {
      console.error('Error registering voter:', error);
      toast.error('Gagal mendaftar sebagai pemilih.');
    }
  };

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
        className="flex flex-col items-center justify-center min-h-screen p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Registrasi Pemilih untuk Voting ID: {votingId}
          </h2>

          {isRegistered ? (
            <p className="text-green-500 text-center mb-4">
              Anda sudah terdaftar untuk voting ini.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (akan di-hash)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Masukkan email Anda"
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Daftar
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}