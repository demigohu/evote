'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import Navbar from '../../../components/Navbar';
import VotingCard from '../../../components/VotingCard';
import {
  useEVotingContract,
  useVotingDetails,
  useAllCandidates,
  useIsVoterRegistered,
  useHasVoterVoted,
  useCheckAllowance,
  useWinner,
} from '../../../hooks/useEVotingContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import Image from 'next/image';

export default function VotingRoundDetail() {
  const [winner, setWinner] = useState<{ id: number; name: string; votes: number; photoUrl: string } | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [voteStatus, setVoteStatus] = useState<
    | 'idle'
    | 'approving'
    | 'approve_failed'
    | 'approved'
    | 'voting'
    | 'vote_failed'
    | 'success'
    | 'loading'
  >('idle');
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [allowanceTxHash, setAllowanceTxHash] = useState<string | null>(null);
  const [voteTxHash, setVoteTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { id } = useParams();
  const votingId = Number(id);
  const { castVote, approveVotingTokens } = useEVotingContract();

  // Gunakan custom hooks untuk mengambil data
  const votingDetailsData = useVotingDetails(votingId);
  const candidatesData = useAllCandidates(votingId);
  const isRegistered = useIsVoterRegistered(votingId, address ?? '');
  const hasVoted = useHasVoterVoted(votingId, address ?? '');
  const allowance = useCheckAllowance(address ?? '');
  const winnerData = useWinner(votingId); // Pindahkan ke level atas

  // Menunggu konfirmasi transaksi allowance
  const { data: allowanceReceipt, error: allowanceError } = useWaitForTransactionReceipt({
    hash: allowanceTxHash as `0x${string}` | undefined,
  });

  // Menunggu konfirmasi transaksi vote
  const { data: voteReceipt, error: voteError } = useWaitForTransactionReceipt({
    hash: voteTxHash as `0x${string}` | undefined,
  });

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

  useEffect(() => {
    if (allowanceReceipt && voteStatus === 'approving') {
      setVoteStatus('approved');
      toast.success('Persetujuan token berhasil dikonfirmasi!');
    } else if (allowanceError && voteStatus === 'approving') {
      setVoteStatus('approve_failed');
      toast.error('Gagal mendapatkan persetujuan token: ' + (allowanceError.message || 'Unknown error'));
    }
  }, [allowanceReceipt, allowanceError, voteStatus]);

  useEffect(() => {
    if (voteReceipt && voteStatus === 'voting') {
      setVoteStatus('success');
      toast.success('Suara Anda berhasil dikirim!');
    } else if (voteError && voteStatus === 'voting') {
      setVoteStatus('vote_failed');
      toast.error('Gagal mengirim suara: ' + (voteError.message || 'Unknown error'));
    }
  }, [voteReceipt, voteError, voteStatus]);

  const handleAllowance = async () => {
    try {
      setVoteStatus('approving');
      toast.info('Mendapatkan persetujuan token...');
      const requiredAllowance = 1 * 10 ** 18; // 1 token dengan 18 desimal
      const allowanceHash = await approveVotingTokens(requiredAllowance.toString());
      setAllowanceTxHash(allowanceHash);
    } catch (error) {
      console.error('Persetujuan token gagal:', error);
      setVoteStatus('approve_failed');
      toast.error('Gagal mendapatkan persetujuan token: ' + ((error as Error).message || 'Unknown error'));
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) return;

    try {
      setVoteStatus('voting');
      toast.info('Mengirim suara...');
      const voteHash = await castVote(votingId, selectedCandidate);
      setVoteTxHash(voteHash);
    } catch (error) {
      console.error('Voting gagal:', error);
      setVoteStatus('vote_failed');
      toast.error('Gagal mengirim suara: ' + ((error as Error).message || 'Unknown error'));
    }
  };

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
    setAllowanceTxHash(null);
    setVoteTxHash(null);

    const requiredAllowance = 1 * 10 ** 18; // 1 token dengan 18 desimal
    if (allowance < requiredAllowance) {
      await handleAllowance();
    } else {
      setVoteStatus('approved');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleGetWinner = async () => {
    try {
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
              {(voteStatus === 'loading' || voteStatus === 'approving') && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  {voteStatus === 'approving' ? 'Menunggu persetujuan token...' : 'Mempersiapkan transaksi...'}
                  <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}

              {voteStatus === 'approve_failed' && (
                <div className="flex justify-between items-center w-full mt-2">
                  <span className="text-red-500 text-lg">❌ Persetujuan Token Gagal</span>
                  {allowanceTxHash && (
                    <a
                      href={`https://polygon.blockscout.com/tx/${allowanceTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-md hover:underline"
                    >
                      🔗
                    </a>
                  )}
                  <button
                    onClick={handleAllowance}
                    className="mt-2 text-blue-500 underline hover:text-blue-700 transition"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {voteStatus === 'approved' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  Persetujuan token selesai, melanjutkan ke voting...
                  <button
                    onClick={handleCastVote}
                    className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition"
                  >
                    Lanjutkan Voting
                  </button>
                </motion.div>
              )}

              {voteStatus === 'voting' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  Mengirim suara...
                  <div className="w-4 h-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}

              {voteStatus === 'vote_failed' && (
                <div className="flex justify-between items-center w-full mt-2">
                  <span className="text-red-500 text-lg">❌ Gagal Mengirim Suara</span>
                  {voteTxHash && (
                    <a
                      href={`https://polygon.blockscout.com/tx/${voteTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-md hover:underline"
                    >
                      🔗
                    </a>
                  )}
                  <button
                    onClick={handleCastVote}
                    className="mt-2 text-blue-500 underline hover:text-blue-700 transition"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {(voteStatus === 'approving' || voteStatus === 'voting') && (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="h-2 bg-blue-500 mt-2 rounded-lg"
                />
              )}

              {voteStatus === 'success' && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-500 text-lg">✅ Persetujuan Token Berhasil</span>
                    {allowanceTxHash && (
                      <a
                        href={`https://polygon.blockscout.com/tx/${allowanceTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-md hover:underline"
                      >
                        🔗
                      </a>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-500 text-lg">✅ Suara Terkirim</span>
                    {voteTxHash && (
                      <a
                        href={`https://polygon.blockscout.com/tx/${voteTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-md hover:underline"
                      >
                        🔗
                      </a>
                    )}
                  </div>
                </div>
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
              <Image
                src={winner.photoUrl}
                alt={winner.name}
                width={128}
                height={128}
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