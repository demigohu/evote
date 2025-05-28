'use client';

import Navbar from '../../../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

export default function UserTutorial() {
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
            Panduan Penggunaan E-Voting HMIF untuk User
          </h1>

          <div className="space-y-8">
            {/* Langkah 1: Registrasi untuk Voting */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                1. Registrasi untuk Voting
              </h2>
              <p className="text-gray-600">
                Sebelum dapat memberikan suara, Anda harus terdaftar untuk voting tertentu.
              </p>
              <ul className="list-decimal list-inside text-gray-600 mt-2">
                <li>Hubungkan wallet Anda melalui tombol &quot;Connect Wallet&quot; di pojok kanan atas halaman.</li>
                <li>Kunjungi halaman <strong>Daftar Voting</strong> melalui menu navigasi.</li>
                <li>Pilih voting yang ingin Anda ikuti dan klik tombol &quot;Daftar untuk Vote&quot;.</li>
                <li>Masukkan alamat email Anda yang telah diizinkan oleh admin.</li>
                <li>Klik &quot;Kirim OTP&quot; untuk menerima kode verifikasi melalui email.</li>
                <li>Masukkan kode OTP yang diterima, lalu klik &quot;Verifikasi OTP&quot;.</li>
                <li>Jika verifikasi berhasil, klik &quot;Daftar&quot; untuk mendaftar.</li>
                <li>Konfirmasi transaksi di wallet Anda untuk menyelesaikan registrasi.</li>
                <li>Setelah terdaftar, klik &quot;Klaim Token&quot; untuk mendapatkan token voting (konfirmasi transaksi di wallet).</li>
              </ul>
              <div className="mt-4">
                <Image
                  src="/tutorial/user/step1.jpg"
                  alt="Langkah 1: Registrasi untuk Voting"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                  placeholder="blur"
                  blurDataURL="/placeholder-image.jpg"
                />
              </div>
            </div>

            {/* Langkah 2: Memilih Kandidat */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                2. Memilih Kandidat
              </h2>
              <p className="text-gray-600">
                Setelah terdaftar dan memiliki token, Anda dapat memberikan suara untuk kandidat pilihan Anda.
              </p>
              <ul className="list-decimal list-inside text-gray-600 mt-2">
                <li>Kembali ke halaman <strong>Daftar Voting</strong> dan pilih voting yang Anda ikuti.</li>
                <li>Klik tombol &quot;Lihat Kandidat&quot; untuk melihat daftar kandidat.</li>
                <li>Klik tombol &quot;Detail Kandidat&quot; untuk melihat informasi lengkap kandidat (visi, misi, dan resume).</li>
                <li>Pilih kandidat yang Anda dukung, lalu klik tombol &quot;Vote Sekarang&quot;.</li>
                <li>Konfirmasi transaksi di wallet Anda untuk memberikan suara.</li>
                <li>Tunggu hingga transaksi selesai, dan suara Anda akan tercatat.</li>
              </ul>
              <div className="mt-4">
                <Image
                  src="/tutorial/user/step2.jpg"
                  alt="Langkah 2: Memilih Kandidat"
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
                Setelah voting selesai, Anda dapat melihat hasilnya.
              </p>
              <ul className="list-decimal list-inside text-gray-600 mt-2">
                <li>Kunjungi halaman <strong>Hasil Voting</strong> melalui menu navigasi.</li>
                <li>Lihat daftar voting yang telah selesai dan pemenangnya.</li>
                <li>Alternatifnya, dari halaman <strong>Daftar Voting</strong>, pilih voting yang telah selesai dan klik &quot;Lihat Pemenang&quot;.</li>
              </ul>
              <div className="mt-4">
                <Image
                  src="/tutorial/user/step3.jpg"
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
              Video Tutorial untuk User
            </h2>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Ganti dengan URL embed video tutorial user
                title="Video Tutorial untuk User"
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