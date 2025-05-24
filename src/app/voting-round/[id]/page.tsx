'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Navbar from '../../../components/Navbar';
import VotingCard from '../../../components/VotingCard';
import { useEVotingContract } from '../../../hooks/useEVotingContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

export default function VotingRoundDetail() {
  const [winner, setWinner] = useState<{ id: number; name: string; votes: number; photoUrl: string } | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [voteStatus, setVoteStatus] = useState<'idle' | 'approving' | 'loading' | 'success' | 'failed'>('idle');
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [voteTxHash, setVoteTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { id } = useParams();
  const votingId = Number(id);
  const { getVotingDetails, getAllCandidates, castVote, getWinner, isVoterRegistered, hasVoterVoted, checkAllowance, approveVotingTokens } = useEVotingContract();

  // Ambil detail voting langsung menggunakan getVotingDetails
  const votingDetailsData = getVotingDetails(votingId);

  // Ambil daftar kandidat langsung menggunakan getAllCandidates
  const candidatesData = getAllCandidates(votingId);

  // Ambil status registrasi dan voting langsung di tubuh komponen
  const isRegistered = address ? isVoterRegistered(votingId, address) : false;
  const hasVoted = address ? hasVoterVoted(votingId, address) : false;

  // Ambil allowance token pengguna untuk kontrak EVoting
  const allowance = address ? checkAllowance(address) : 0;

  // Tentukan status loading berdasarkan keberadaan data
  const isLoading = !votingDetailsData || !candidatesData;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleVote = async (candidateId: number) => {
    if (!votingDetailsData?.votingStart || !votingDetailsData?.votingEnd) {
      toast.error('Data voting belum dimuat, coba lagi nanti.');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < votingDetailsData.votingStart) {
      toast.error(`Voting belum dimulai! Silakan tunggu hingga ${formatDate(votingDetailsData.votingStart)}.`);
      return;
    }
    if (now > votingDetailsData.votingEnd) {
      toast.error('Voting sudah berakhir.');
      return;
    }

    if (!address) {
      toast.error('Silakan hubungkan wallet Anda terlebih dahulu.');
      return;
    }

    if (!isRegistered) {
      toast.error('Anda belum terdaftar sebagai pemilih!');
      return;
    }
    if (hasVoted) {
      toast.error('Anda sudah memilih sebelumnya!');
      return;
    }

    setSelectedCandidate(candidateId);
    setIsTransactionModalOpen(true);
    setVoteStatus('loading');
    setVoteTxHash(null);

    try {
      // Periksa allowance token
      const requiredAllowance = 1 * 10 ** 18; // 1 token dengan 18 desimal
      if (allowance < requiredAllowance) {
        setVoteStatus('approving');
        toast.info('Mendapatkan persetujuan token...');
        await approveVotingTokens(requiredAllowance.toString());
        toast.success('Token berhasil disetujui!');
      }

      setVoteStatus('loading');
      await castVote(votingId, candidateId);
      setVoteStatus('success');
      toast.success('Suara Anda berhasil dikirim!');
    } catch (error) {
      console.error('Voting gagal:', error);
      setVoteStatus('failed');
      toast.error('Gagal mengirim suara: ' + ((error as Error).message || 'Unknown error'));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleGetWinner = async () => {
    try {
      const winnerData = await getWinner(votingId);
      if (winnerData) {
        setWinner({
          id: winnerData.id,
          name: winnerData.name,
          votes: winnerData.voteCount,
          photoUrl: winnerData.photoUrl,
        });
        setIsWinnerModalOpen(true);
      } else {
        toast.error('Belum ada pemenang atau voting masih berlangsung.');
      }
    } catch (error) {
      console.error('Error fetching winner:', error);
      toast.error('Gagal mengambil pemenang.');
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
        {votingDetailsData && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">TOTAL SUARA: {votingDetailsData.totalVotes}</h1>
            <p className="text-sm text-gray-700">
              🕒 Waktu Mulai Voting: <strong>{formatDate(votingDetailsData.votingStart)}</strong>
            </p>
            <p className="text-sm text-gray-700">
              ⏳ Waktu Selesai Voting: <strong>{formatDate(votingDetailsData.votingEnd)}</strong>
            </p>
            <p
              className={`text-lg pt-2 font-semibold ${
                Date.now() / 1000 > votingDetailsData.votingEnd ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {Date.now() / 1000 > votingDetailsData.votingEnd ? (
                <button
                  onClick={handleGetWinner}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                  🎉 Lihat Pemenang
                </button>
              ) : Date.now() / 1000 < votingDetailsData.votingStart ? (
                'Voting Belum Dimulai'
              ) : (
                'Voting Sedang Berlangsung'
              )}
            </p>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          {candidatesData.map((candidate) => (
            <VotingCard
              key={candidate.id}
              id={candidate.id}
              votingId={votingId}
              name={candidate.name}
              photoUrl={candidate.photoUrl}
              vision={candidate.vision}
              mission={candidate.mission}
              resumeLink={candidate.resume}
              voteCount={candidate.voteCount}
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
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white p-6 rounded-2xl shadow-xl w-96 text-left"
          >
            <h2 className="text-2xl font-bold flex items-center gap-2 justify-center">📝 Progres Voting</h2>

            <div className="flex flex-col items-start mt-4 w-full">
              {voteStatus === 'approving' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  Menunggu persetujuan token...
                  <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}

              {voteStatus === 'loading' && (
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

              {(voteStatus === 'approving' || voteStatus === 'loading') && (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-2 bg-blue-500 mt-2 rounded-lg"
                />
              )}

              {voteStatus === 'success' && (
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

              {voteStatus === 'failed' && (
                <button
                  onClick={() => handleVote(selectedCandidate!)}
                  className="mt-2 text-red-500 underline hover:text-red-700 transition"
                >
                  Coba Lagi
                </button>
              )}
            </div>

            {voteStatus === 'success' && (
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
          <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={300} recycle={true} gravity={0.2} />
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
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