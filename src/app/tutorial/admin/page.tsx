'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Navbar from '../../../components/Navbar';
import { useEVotingContract } from '../../../hooks/useEVotingContract';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

export default function AdminTutorial() {
  const { address } = useAccount();
  const { admin } = useEVotingContract();
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Memeriksa apakah pengguna adalah admin
  useEffect(() => {
    if (address && admin) {
      setIsAdminUser(address.toLowerCase() === admin.toLowerCase());
    }
  }, [address, admin]);

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
        className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-4xl m-4 sm:m-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Panduan Penggunaan E-Voting HMIF untuk Admin
          </h1>

          <div className="space-y-8">
            {/* Langkah 1: Login sebagai Admin */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                1. Login sebagai Admin
              </h2>
              <p className="text-gray-600">
                Untuk mengakses fitur admin, Anda harus login menggunakan wallet yang telah ditetapkan sebagai admin di kontrak E-Voting.
              </p>
              <ul className="list-decimal list-inside text-gray-600 mt-2">
                <li>Hubungkan wallet Anda melalui tombol "Connect Wallet" di pojok kanan atas halaman.</li>
                <li>Jika wallet Anda terdaftar sebagai admin, Anda akan dapat mengakses halaman <strong>Admin Dashboard</strong>.</li>
              </ul>
              <div className="mt-4">
                <Image
                  src="/tutorial/admin/step1.jpg"
                  alt="Langkah 1: Login sebagai Admin"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                  placeholder="blur"
                  blurDataURL="/placeholder-image.jpg"
                />
              </div>
            </div>

            {/* Langkah 2: Membuat Voting Baru */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                2. Membuat Voting Baru
              </h2>
              <p className="text-gray-600">
                Admin dapat membuat voting baru melalui halaman Admin Dashboard.
              </p>
              <ul className="list-decimal list-inside text-gray-600 mt-2">
                <li>Klik tombol "Admin Dashboard" di menu navigasi (hanya muncul untuk admin).</li>
                <li>Isi formulir pembuatan voting, termasuk:</li>
                <ul className="list-disc list-inside ml-6">
                  <li>Judul voting.</li>
                  <li>Waktu mulai voting, waktu selesai voting, dan waktu selesai registrasi.</li>
                  <li>Data kandidat (nama, URL foto, resume, visi, dan misi).</li>
                </ul>
                <li>Tambahkan kandidat lain jika diperlukan dengan tombol "Tambah Kandidat Lain".</li>
                <li>Klik tombol "Buat Voting" untuk membuat voting baru.</li>
                <li>Konfirmasi transaksi di wallet Anda untuk menyimpan voting ke blockchain.</li>
              </ul>
              <div className="mt-4">
                <Image
                  src="/tutorial/admin/step2.jpg"
                  alt="Langkah 2: Membuat Voting Baru"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                  placeholder="blur"
                  blurDataURL="/placeholder-image.jpg"
                />
              </div>
            </div>

            {/* Langkah 3: Melihat Hasil Voting */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                3. Melihat Hasil Voting
              </h2>
              <p className="text-gray-600">
                Admin dapat melihat hasil voting setelah voting selesai.
              </p>
              <ul className="list-decimal list-inside text-gray-600 mt-2">
                <li>Kunjungi halaman <strong>Daftar Voting</strong> melalui menu navigasi.</li>
                <li>Pilih voting yang telah selesai (status "Selesai").</li>
                <li>Klik tombol "Lihat Pemenang" untuk melihat kandidat dengan suara terbanyak.</li>
                <li>Alternatifnya, Anda juga dapat mengunjungi halaman <strong>Hasil Voting</strong> untuk melihat semua hasil voting yang telah selesai.</li>
              </ul>
              <div className="mt-4">
                <Image
                  src="/tutorial/admin/step3.jpg"
                  alt="Langkah 3: Melihat Hasil Voting"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                  placeholder="blur"
                  blurDataURL="/placeholder-image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Video Tutorial */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Video Tutorial untuk Admin
            </h2>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Ganti dengan URL embed video tutorial admin
                title="Video Tutorial untuk Admin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}