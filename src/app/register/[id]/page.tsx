'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  useEVotingContract,
  useVotingDetails,
  useIsVoterRegistered,
} from '../../../hooks/useEVotingContract';
import { useHasClaimed } from '../../../hooks/useVotingTokenContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../lib/supabase';
import { keccak256, toHex } from 'viem';
import debounce from 'lodash/debounce';

// Nonaktifkan SSR untuk Navbar
const Navbar = dynamic(() => import('../../../components/Navbar'), { ssr: false });

export default function Register() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [votingStatus, setVotingStatus] = useState<'notStarted' | 'ongoing' | 'ended' | 'registrationClosed' | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentAction, setCurrentAction] = useState<'register' | 'claim' | null>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isEmailUsedInRound, setIsEmailUsedInRound] = useState(false);

  const { address } = useAccount();
  const { id } = useParams();
  const votingId = Number(id);
  const { registerVoter, claimVotingTokens } = useEVotingContract();

  // Gunakan custom hooks untuk mengambil data
  const isRegistered = useIsVoterRegistered(votingId, address ?? '');
  const [isRegisteredState, setIsRegisteredState] = useState(isRegistered);
  const hasClaimed = useHasClaimed(votingId, address ?? '');
  const [hasClaimedState, setHasClaimedState] = useState(hasClaimed);
  const votingDetails = useVotingDetails(votingId);

  // Menunggu konfirmasi transaksi
  const { data: receipt, isLoading: isTransactionPending } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
  });

  // Set isHydrated to true after component mounts
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Perbarui status registrasi, klaim, dan voting
  useEffect(() => {
    if (!isHydrated || !address) return;

    if (isRegistered !== undefined && hasClaimed !== undefined && votingDetails !== null) {
      setIsDataLoading(false);
      setIsRegisteredState(isRegistered);
      setHasClaimedState(hasClaimed);

      // Periksa status voting
      if (votingDetails) {
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
      }
    }
  }, [address, isHydrated, votingId, votingDetails, isRegistered, hasClaimed]);

  // Tangani konfirmasi transaksi
  useEffect(() => {
    if (receipt) {
      if (currentAction === 'register') {
        setIsRegisteredState(true);
        setIsRegistering(false);
        if (toastId !== null) {
          toast.dismiss(toastId);
        }
        toast.success('Registrasi berhasil! Silakan klaim token Anda.');
        setToastId(null);
        setTransactionHash(null);

        // Simpan email ke used_emails di Supabase
        const emailHash = keccak256(toHex(email));
        const saveEmailUsage = async () => {
          const { error } = await supabase
            .from('used_emails')
            .insert({
              email_hash: emailHash,
              voting_id: votingId,
            });

          if (error) {
            console.error('Error saving email usage:', error);
          }
        };
        saveEmailUsage();
      } else if (currentAction === 'claim') {
        setIsClaiming(false);
        setHasClaimedState(true);
        if (toastId !== null) {
          toast.dismiss(toastId);
        }
        toast.success('Token berhasil diklaim!');
        setToastId(null);
        setTransactionHash(null);
      }
    }
  }, [receipt, currentAction, address, votingId, toastId, email]);

  // Periksa apakah email sudah digunakan
  const checkEmailUsage = useCallback(async (emailToCheck: string) => {
    const emailHash = keccak256(toHex(emailToCheck));
    const { data, error } = await supabase
      .from('used_emails')
      .select('email_hash')
      .eq('email_hash', emailHash)
      .eq('voting_id', votingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking email usage:', error);
      return;
    }

    setIsEmailUsedInRound(!!data);
    if (data) {
      toast.error('Email ini sudah digunakan di voting round ini.');
    }
  }, [votingId, toast]); // Tambahkan toast ke dependensi

  // Debounce checkEmailUsage
  const debouncedCheckEmailUsage = useCallback(
    debounce((email: string) => {
      checkEmailUsage(email);
    }, 500),
    [checkEmailUsage]
  );

  // Periksa email saat berubah
  useEffect(() => {
    if (!email || !isHydrated) return;
    debouncedCheckEmailUsage(email);
    return () => debouncedCheckEmailUsage.cancel();
  }, [email, isHydrated, debouncedCheckEmailUsage]);

  // Validasi email
  const validateEmail = async () => {
    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', email)
        .single();

      if (error || !data) {
        toast.error('Email tidak terdaftar.');
        return;
      }

      await sendOtp();
    } catch (error) {
      console.error('Error validating email:', error);
      toast.error('Gagal memvalidasi email.');
    }
  };

  // Kirim OTP
  const sendOtp = async () => {
    try {
      setIsOtpSending(true);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from('otps')
        .insert({
          email,
          otp: generatedOtp,
          expires_at: expiresAt,
        });

      if (insertError) {
        throw new Error('Gagal menyimpan OTP.');
      }

      const res = await fetch('/api/send-otp-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: generatedOtp, votingId }),
      });

      const response = await res.json();
      if (!res.ok) {
        throw new Error(response.error || 'Gagal mengirim OTP.');
      }

      setIsOtpSent(true);
      toast.success('OTP telah dikirim ke email Anda!');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Gagal mengirim OTP.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // Verifikasi OTP
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

      await supabase.from('otps').delete().eq('id', data.id);
      setIsOtpVerified(true);
      toast.success('Email berhasil diverifikasi!');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Gagal memverifikasi OTP.');
    }
  };

  // Tangani registrasi
  const handleRegister = async () => {
    try {
      if (!isOtpVerified) {
        toast.error('Harap verifikasi email Anda terlebih dahulu.');
        return;
      }

      if (isRegisteredState) {
        toast.error('Anda sudah terdaftar untuk voting ini.');
        return;
      }

      if (isEmailUsedInRound) {
        toast.error('Email ini sudah digunakan di voting round ini.');
        return;
      }

      setIsRegistering(true);
      const newToastId = toast.loading('Menunggu transaksi terkonfirmasi...');
      setToastId(newToastId);
      setCurrentAction('register');

      const hash = await registerVoter(votingId, email);
      setTransactionHash(hash);
    } catch (error) {
      console.error('Error registering voter:', error);
      setIsRegistering(false);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      setToastId(null);
      toast.error('Gagal mendaftar sebagai pemilih.');
    }
  };

  // Tangani klaim token
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

      const hash = await claimVotingTokens(votingId);
      setTransactionHash(hash);
    } catch (error) {
      console.error('Error claiming tokens:', error);
      setIsClaiming(false);
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
      setToastId(null);
      toast.error('Gagal mengklaim token.');
    }
  };

  if (!isHydrated || !address || isDataLoading || votingStatus === null) {
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
        className="flex extent-col items-center justify-center min-h-screen p-8 pt-[85px]"
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

          {isRegisteredState ? (
            <div className="text-center space-y-4">
              <p className="text-green-500">
                Anda sudah terdaftar untuk voting ini.
              </p>
              {hasClaimedState ? (
                <p className="text-green-500">
                  Token sudah diklaim untuk voting ini.
                </p>
              ) : (
                <button
                  onClick={handleClaimTokens}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                  disabled={isClaiming || isTransactionPending}
                >
                  {isClaiming || isTransactionPending ? 'Memproses...' : 'Klaim Token'}
                </button>
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
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  disabled={isEmailUsedInRound || isOtpSending}
                >
                  {isOtpSending ? 'Mengirim...' : 'Kirim OTP'}
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
                    disabled={isEmailUsedInRound}
                  >
                    Verifikasi OTP
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  disabled={isRegistering || isTransactionPending || isEmailUsedInRound}
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