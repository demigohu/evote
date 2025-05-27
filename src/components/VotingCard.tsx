import { useState } from 'react';
import Image from 'next/image';

interface VotingCardProps {
  id: number;
  votingId: number;
  name: string;
  photoUrl: string;
  vision: string;
  mission: string;
  resumeLink: string;
  voteCount: number;
  onVote: (candidateId: number) => void;
}

const VotingCard: React.FC<VotingCardProps> = ({ id, name, photoUrl, vision, mission, resumeLink, voteCount, onVote }) => {
  const [showModal, setShowModal] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg flex flex-col items-center">
      <Image
        src={photoUrl}
        alt={name}
        width={400}
        height={400}
        className="w-full h-100 object-cover rounded-xl mb-4"
        onError={() => console.error(`Failed to load image for ${name}`)}
        placeholder="blur"
        blurDataURL="/placeholder-image.jpg" // Ganti dengan URL placeholder yang sesuai
      />
      <h2 className="text-lg font-bold text-gray-800">{name}</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mt-2 border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition w-full"
      >
        Detail Kandidat
      </button>

      <p className="mt-2 text-gray-700 font-semibold">Total Suara: {voteCount}</p>

      <button
        onClick={() => onVote(id)}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
      >
        Vote Sekarang
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-3xl relative max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-center mb-4">{name}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-red-500 p-3 rounded-lg">
                <h3 className="font-bold">Visi</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{vision}</p>
              </div>
              <div className="border-2 border-red-500 p-3 rounded-lg">
                <h3 className="font-bold">Misi</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{mission}</p>
              </div>
            </div>

            <h3 className="mt-4 font-bold text-center">Resume</h3>
            {iframeFailed ? (
              <div className="text-center">
                <p className="text-red-500">Gagal memuat resume di iframe.</p>
                <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  Buka di tab baru
                </a>
              </div>
            ) : (
              <iframe
                src={resumeLink}
                className="w-full h-64 border-2 border-red-500 rounded-lg mt-2"
                onError={() => setIframeFailed(true)}
              />
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg w-full hover:bg-red-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingCard;