'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEVotingContract } from '../../../hooks/useEVotingContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../lib/supabase';

// Nonaktifkan SSR untuk Navbar
const Navbar = dynamic(() => import('../../../components/Navbar'), { ssr: false });

export default function Register() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState<'notStarted' | 'ongoing' | 'ended' | 'registrationClosed' | null>(null);
  const [hasRegisteredInOtherRound, setHasRegisteredInOtherRound] = useState(false);
  const [currentAction, setCurrentAction] = useState<'register' | 'claim' | null>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true); // State baru untuk loading data

  const { address } = useAccount();
  const { id } = useParams();
  const votingId = Number(id);
  const { isVoterRegistered, registerVoter, claimVotingTokens, getVotingDetails, hasRegisteredInAnyRound } = useEVotingContract();

  // Ambil status registrasi tanpa kondisi untuk votingId saat ini
  const isRegisteredRaw = address ? isVoterRegistered(votingId, address) : false;
  const [isRegistered, setIsRegistered] = useState(false);

  // Ambil status apakah pengguna sudah terdaftar di salah satu voting round
  const hasRegisteredInAnyRoundRaw = address ? hasRegisteredInAnyRound(address) : false;

  // Ambil detail voting di level atas tubuh komponen
  const votingDetails = getVotingDetails(votingId);

  // Menunggu konfirmasi transaksi
  const { data: receipt, isLoading: isTransactionPending } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  });

  // Set isHydrated to true after the component mounts on the client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Perbarui isRegistered dan hasRegisteredInOtherRound saat data tersedia
  useEffect(() => {
    if (!isHydrated || !address) return;

    // Periksa apakah data sudah tersedia
    if (isRegisteredRaw !== undefined && hasRegisteredInAnyRoundRaw !== undefined && votingDetails !== null) {
      setIsDataLoading(false);
      setIsRegistered(isRegisteredRaw);

      // Periksa status voting untuk votingId saat ini
      const now = Math.floor(Date.now() / 1000);
      if (now > votingDetails.registrationEnd) {
        setVotingStatus('registrationClosed');
      } else if (now > votingDetails.votingEnd) {
        setVotingStatus('ended');
      } else if (now > votingDetails.votingStart) {
        setVotingStatus('ongoing');
      } else {
        setVotingStatus('notStarted');
      }

      // Periksa apakah pengguna sudah terdaftar di voting round lain
      if (hasRegisteredInAnyRoundRaw && !isRegisteredRaw) {
        setHasRegisteredInOtherRound(true);
      }
    }
  }, [address, isHydrated, votingId, votingDetails, hasRegisteredInAnyRoundRaw, isRegisteredRaw]);

  // Perbarui isRegistered dan lanjutkan ke klaim token setelah transaksi registrasi dikonfirmasi
  useEffect(() => {
    if (receipt && currentAction === 'register') {
      setIsRegistered(true);
      setIsRegistering(false);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      toast.success('Registrasi berhasil! Melanjutkan untuk klaim token...');
      setToastId(null);
      setTransactionHash(null);

      // Otomatis lanjutkan ke klaim token
      handleClaimTokens();
    } else if (receipt && currentAction === 'claim') {
      setIsClaiming(false);
      setHasClaimed(true);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      toast.success('Token berhasil diklaim!');
      setToastId(null);
      setTransactionHash(null);

      // Simpan status hasClaimed ke localStorage
      if (address) {
        const claimKey = `hasClaimed_${address}_${votingId}`;
        localStorage.setItem(claimKey, 'true');
      }
    }
  }, [receipt, currentAction, address, votingId, toastId]);

  // Periksa status hasClaimed saat komponen dimuat dari localStorage
  useEffect(() => {
    if (!address || !isHydrated) return;

    const claimKey = `hasClaimed_${address}_${votingId}`;
    const storedHasClaimed = localStorage.getItem(claimKey);
    if (storedHasClaimed === 'true') {
      setHasClaimed(true);
    }
  }, [address, isHydrated, votingId]);

  // Tentukan status loading berdasarkan keberadaan data
  const loading = !isHydrated || !address || isDataLoading || votingStatus === null;

  const validateEmail = async () => {
    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', email)
        .single();

      if (error || !data) {
        toast.error('Email tidak terdaftar.');
        setIsEmailValid(false);
        return;
      }

      setIsEmailValid(true);
      await sendOtp();
    } catch (error) {
      console.error('Error validating email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Gagal memvalidasi email: ' + errorMessage);
    }
  };

  const sendOtp = async () => {
    try {
      // Generate OTP (6 digit)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set OTP expiration (5 minutes from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

      // Simpan OTP ke Supabase
      const { error: insertError } = await supabase
        .from('otps')
        .insert({
          email,
          otp: generatedOtp,
          expires_at: expiresAt,
        });

      if (insertError) {
        throw new Error('Gagal menyimpan OTP: ' + insertError.message);
      }

      // Kirim OTP ke email menggunakan Gmail SMTP
      const res = await fetch('/api/send-otp-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: generatedOtp,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Gagal mengirim OTP.');
      }

      setIsOtpSent(true);
      toast.success('OTP telah dikirim ke email Anda!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Gagal mengirim OTP: ' + errorMessage);
    }
  };

  const verifyOtp = async () => {
    try {
      const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast.error('OTP tidak valid atau telah kadaluarsa.');
        return;
      }

      // Hapus OTP setelah verifikasi
      await supabase.from('otps').delete().eq('id', data.id);

      setIsOtpVerified(true);
      toast.success('Email berhasil diverifikasi!');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Gagal memverifikasi OTP: ' + errorMessage);
    }
  };

  const handleRegister = async () => {
    try {
      if (!isOtpVerified) {
        toast.error('Harap verifikasi email Anda terlebih dahulu.');
        return;
      }

      if (isRegistered) {
        toast.error('Anda sudah terdaftar untuk voting ini.');
        return;
      }

      setIsRegistering(true);
      const newToastId = toast.loading('Menunggu transaksi terkonfirmasi...');
      setToastId(newToastId);
      setCurrentAction('register');

      // Panggil fungsi registerVoter dari useEVotingContract
      const hash = await registerVoter(votingId, email);

      // Simpan hash transaksi untuk ditunggu konfirmasi
      setTransactionHash(hash);
    } catch (error) {
      console.error('Error registering voter:', error);
      setIsRegistering(false);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      setToastId(null);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Gagal mendaftar sebagai pemilih: ' + errorMessage);
    }
  };

  const handleClaimTokens = async () => {
    try {
      if (!address) {
        toast.error('Alamat wallet tidak ditemukan.');
        return;
      }

      setIsClaiming(true);
      const newToastId = toast.loading('Menunggu transaksi terkonfirmasi...');
      setToastId(newToastId);
      setCurrentAction('claim');

      // Panggil fungsi claimVotingTokens dari useEVotingContract
      const hash = await claimVotingTokens(votingId);

      // Simpan hash transaksi untuk ditunggu konfirmasi
      setTransactionHash(hash);
    } catch (error) {
      console.error('Error claiming tokens:', error);
      setIsClaiming(false);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      setToastId(null);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Gagal mengklaim token: ' + errorMessage);
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
            <div className="text-center space-y-4">
              <p className="text-green-500">
                Anda sudah terdaftar untuk voting ini.
              </p>
              {!hasClaimed && (
                <button
                  onClick={handleClaimTokens}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                  disabled={isClaiming || isTransactionPending}
                >
                  {isClaiming || isTransactionPending ? 'Memproses...' : 'Klaim Token'}
                </button>
              )}
              {hasClaimed && (
                <p className="text-green-500">
                  Token sudah diklaim untuk voting ini.
                </p>
              )}
            </div>
          ) : votingStatus === 'registrationClosed' ? (
            <div className="text-center space-y-4">
              <p className="text-red-500">
                Pendaftaran untuk voting ini sudah ditutup.
              </p>
            </div>
          ) : votingStatus === 'ongoing' || votingStatus === 'ended' ? (
            <div className="text-center space-y-4">
              <p className="text-red-500">
                Voting sudah {votingStatus === 'ongoing' ? 'berlangsung' : 'selesai'}, pendaftaran tidak lagi diperbolehkan.
              </p>
            </div>
          ) : hasRegisteredInOtherRound ? (
            <div className="text-center space-y-4">
              <p className="text-red-500">
                Anda sudah terdaftar di voting round lain.
              </p>
            </div>
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
                  disabled={isOtpSent}
                />
              </div>

              {!isOtpSent ? (
                <button
                  onClick={validateEmail}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Kirim OTP
                </button>
              ) : !isOtpVerified ? (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Masukkan OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      placeholder="Masukkan OTP"
                    />
                  </div>
                  <button
                    onClick={verifyOtp}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                    Verifikasi OTP
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  disabled={isRegistering || isTransactionPending}
                >
                  {isRegistering || isTransactionPending ? 'Mendaftar...' : 'Daftar'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}