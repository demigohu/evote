"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useVotingDetails,
  useAllCandidates,
  useWinner,
} from "../../../hooks/useEVotingContract";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Nonaktifkan SSR untuk Navbar
const Navbar = dynamic(() => import("../../../components/Navbar"), {
  ssr: false,
});

export default function ResultDetail() {
  const { id } = useParams();
  const votingId = Number(id);

  // Ambil data menggunakan custom hooks
  const votingDetails = useVotingDetails(votingId);
  const candidates = useAllCandidates(votingId);
  const winner = useWinner(votingId);

  // Tentukan status loading
  const loading = !votingDetails || !candidates || winner === undefined;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
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
        className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8 pt-[85px]"
        style={{
          backgroundImage: "url('/4.jpg')",
          minHeight: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-4xl mt-20">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
            Hasil Voting ID: {votingId}
          </h1>

          {/* Detail Voting */}
          {votingDetails && (
            <div className="mb-8 text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                {votingDetails.title}
              </h2>
              <p className="text-gray-600">
                Waktu Mulai: {formatDate(votingDetails.votingStart)}
              </p>
              <p className="text-gray-600">
                Waktu Selesai: {formatDate(votingDetails.votingEnd)}
              </p>
              <p className="text-gray-600">
                Total Suara: {votingDetails.totalVotes}
              </p>
            </div>
          )}

          {/* Pemenang */}
          {winner ? (
            <div className="mb-12 text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Pemenang
              </h2>
              <div className="bg-gray-100 p-6 rounded-lg">
                <Image
                  src={winner.photoUrl}
                  alt={winner.name}
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-yellow-500 mb-4"
                  onError={() =>
                    console.error(`Failed to load image for ${winner.name}`)
                  }
                  placeholder="blur"
                  blurDataURL="/placeholder-image.jpg"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {winner.name}
                </h3>
                <p className="text-gray-600">Total Suara: {winner.voteCount}</p>
              </div>
            </div>
          ) : (
            <div className="mb-12 text-center">
              <p className="text-gray-700">
                Belum ada pemenang untuk voting ini. Pastikan voting telah
                selesai.
              </p>
            </div>
          )}

          {/* Statistik Suara Semua Kandidat */}
          {candidates.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                Statistik Suara
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-gray-700 font-semibold">
                        Kandidat
                      </th>
                      <th className="p-3 text-gray-700 font-semibold">
                        Jumlah Suara
                      </th>
                      <th className="p-3 text-gray-700 font-semibold">
                        Persentase
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => {
                      const percentage =
                        votingDetails && votingDetails.totalVotes > 0
                          ? (
                              (candidate.voteCount / votingDetails.totalVotes) *
                              100
                            ).toFixed(2)
                          : "0.00";
                      return (
                        <tr key={candidate.id} className="border-b">
                          <td className="p-3 text-gray-800">
                            {candidate.name}
                          </td>
                          <td className="p-3 text-gray-800">
                            {candidate.voteCount}
                          </td>
                          <td className="p-3 text-gray-800">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
