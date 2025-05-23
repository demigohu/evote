'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Navbar from '../../components/Navbar';
import { useEVotingContract } from '../../hooks/useEVotingContract';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboard() {
  const [votingTitle, setVotingTitle] = useState('');
  const [votingStart, setVotingStart] = useState('');
  const [votingEnd, setVotingEnd] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');
  const [candidates, setCandidates] = useState([
    { name: '', photoUrl: '', resume: '', vision: '', mission: '' },
  ]);
  const [voterAddress, setVoterAddress] = useState('');

  const { address } = useAccount();
  const { admin, registerVoter, createVoting } = useEVotingContract();
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Memeriksa apakah pengguna adalah admin
  useEffect(() => {
    if (address && admin) {
      setIsAdminUser(address.toLowerCase() === admin.toLowerCase());
    }
  }, [address, admin]);

  const addCandidateField = () => {
    setCandidates([...candidates, { name: '', photoUrl: '', resume: '', vision: '', mission: '' }]);
  };

  const handleCreateVoting = async () => {
    try {
      const candidateNames = candidates.map((c) => c.name);
      const photoUrls = candidates.map((c) => c.photoUrl);
      const resumes = candidates.map((c) => c.resume);
      const visions = candidates.map((c) => c.vision);
      const missions = candidates.map((c) => c.mission);

      const startTimestamp = Math.floor(new Date(votingStart).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(votingEnd).getTime() / 1000);
      const regEndTimestamp = Math.floor(new Date(registrationEnd).getTime() / 1000);

      // Validasi input
      if (!votingTitle || !votingStart || !votingEnd || !registrationEnd) {
        toast.error('Semua kolom waktu harus diisi.');
        return;
      }
      if (candidates.some((c) => !c.name || !c.photoUrl || !c.resume || !c.vision || !c.mission)) {
        toast.error('Semua kolom kandidat harus diisi.');
        return;
      }

      // Panggil fungsi createVoting dari useEVotingContract
      await createVoting(
        votingTitle,
        candidateNames,
        photoUrls,
        resumes,
        visions,
        missions,
        startTimestamp,
        endTimestamp,
        regEndTimestamp
      );

      toast.success('Voting berhasil dibuat!');
      setCandidates([{ name: '', photoUrl: '', resume: '', vision: '', mission: '' }]);
      setVotingTitle('');
      setVotingStart('');
      setVotingEnd('');
      setRegistrationEnd('');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat voting.');
    }
  };

  const handleRegister = async () => {
    try {
      if (!voterAddress) {
        toast.error('Alamat pemilih harus diisi.');
        return;
      }

      // Panggil fungsi registerVoter dari useEVotingContract
      await registerVoter(1, voterAddress); // Asumsikan votingId = 1

      toast.success('Pemilih berhasil didaftarkan!');
      setVoterAddress('');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mendaftarkan pemilih.');
    }
  };

  if (!isAdminUser) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Hanya admin yang dapat mengakses halaman ini.
            </h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className="flex justify-center items-center min-h-screen"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Buat Voting</h2>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Judul Voting"
              value={votingTitle}
              onChange={(e) => setVotingTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="datetime-local"
              placeholder="Waktu Mulai Voting"
              value={votingStart}
              onChange={(e) => setVotingStart(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="datetime-local"
              placeholder="Waktu Selesai Voting"
              value={votingEnd}
              onChange={(e) => setVotingEnd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="datetime-local"
              placeholder="Waktu Selesai Registrasi"
              value={registrationEnd}
              onChange={(e) => setRegistrationEnd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />

            {candidates.map((candidate, index) => (
              <div key={index} className="space-y-2 border p-4 rounded-md">
                <h3 className="text-lg font-semibold">Kandidat {index + 1}</h3>
                <input
                  type="text"
                  placeholder="Nama Kandidat"
                  value={candidate.name}
                  onChange={(e) => {
                    const newCandidates = [...candidates];
                    newCandidates[index].name = e.target.value;
                    setCandidates(newCandidates);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="URL Foto"
                  value={candidate.photoUrl}
                  onChange={(e) => {
                    const newCandidates = [...candidates];
                    newCandidates[index].photoUrl = e.target.value;
                    setCandidates(newCandidates);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Resume"
                  value={candidate.resume}
                  onChange={(e) => {
                    const newCandidates = [...candidates];
                    newCandidates[index].resume = e.target.value;
                    setCandidates(newCandidates);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <textarea
                  placeholder="Visi"
                  value={candidate.vision}
                  onChange={(e) => {
                    const newCandidates = [...candidates];
                    newCandidates[index].vision = e.target.value;
                    setCandidates(newCandidates);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                />
                <textarea
                  placeholder="Misi"
                  value={candidate.mission}
                  onChange={(e) => {
                    const newCandidates = [...candidates];
                    newCandidates[index].mission = e.target.value;
                    setCandidates(newCandidates);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addCandidateField}
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
            >
              Tambah Kandidat Lain
            </button>

            <button
              onClick={handleCreateVoting}
              className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
            >
              Buat Voting
            </button>
          </form>

          <form className="space-y-4 pt-10" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Alamat Pemilih untuk Didaftarkan"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleRegister}
              className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
            >
              Daftarkan Pemilih
            </button>
          </form>
        </div>
      </div>
    </>
  );
}