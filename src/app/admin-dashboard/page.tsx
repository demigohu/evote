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

  const { address } = useAccount();
  const { admin, createVoting } = useEVotingContract();
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

      // Validasi timestamp
      if (isNaN(startTimestamp) || isNaN(endTimestamp) || isNaN(regEndTimestamp)) {
        toast.error('Format tanggal tidak valid.');
        return;
      }
      if (endTimestamp <= startTimestamp) {
        toast.error('Waktu selesai harus setelah waktu mulai.');
        return;
      }
      if (regEndTimestamp > startTimestamp) {
        toast.error('Waktu registrasi harus sebelum atau sama dengan waktu mulai voting.');
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
    } catch (err: any) {
      console.error('Error creating voting:', err);
      if (err.message.includes('Hanya admin')) {
        toast.error('Hanya admin yang dapat membuat voting.');
      } else if (err.message.includes('Waktu selesai harus setelah waktu mulai')) {
        toast.error('Waktu selesai harus setelah waktu mulai.');
      } else if (err.message.includes('Waktu registrasi harus sebelum atau sama dengan waktu mulai voting')) {
        toast.error('Waktu registrasi harus sebelum atau sama dengan waktu mulai voting.');
      } else if (err.message.includes('Array data kandidat harus memiliki panjang yang sama')) {
        toast.error('Array data kandidat harus memiliki panjang yang sama.');
      } else if (err.message.includes('Minimal satu kandidat diperlukan')) {
        toast.error('Minimal satu kandidat diperlukan.');
      } else if (err.message.includes('Hanya EVoting yang dapat mengatur voting ID aktif')) {
        toast.error('Kontrak VotingToken tidak mengenali kontrak EVoting ini sebagai pengirim yang sah.');
      } else {
        toast.error('Gagal membuat voting: ' + (err.message || 'Unknown error'));
      }
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
        className="flex justify-center items-center min-h-screen p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Buat Voting</h2>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Judul Voting</label>
              <input
                type="text"
                placeholder="Judul Voting"
                value={votingTitle}
                onChange={(e) => setVotingTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Waktu Mulai Voting</label>
                <input
                  type="datetime-local"
                  value={votingStart}
                  onChange={(e) => setVotingStart(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Waktu Selesai Voting</label>
                <input
                  type="datetime-local"
                  value={votingEnd}
                  onChange={(e) => setVotingEnd(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Waktu Selesai Registrasi</label>
                <input
                  type="datetime-local"
                  value={registrationEnd}
                  onChange={(e) => setRegistrationEnd(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {candidates.map((candidate, index) => (
              <div key={index} className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Kandidat {index + 1}</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700">Nama Kandidat</label>
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
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700">URL Foto</label>
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
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700">Resume</label>
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
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700">Visi</label>
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
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-gray-700">Misi</label>
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
                </div>
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
        </div>
      </div>
    </>
  );
}