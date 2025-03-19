import { useState } from "react";

interface CandidateProps {
  name: string;
  photoUrl: string;
  vision: string;
  mission: string;
  resumeLink: string; // Link ke IPFS
}

const CandidateCard: React.FC<CandidateProps> = ({ name, photoUrl, vision, mission, resumeLink }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg flex flex-col">
      <img src={photoUrl} alt={name} className="w-full h-100 object-cover rounded-xl mb-4" />
      <h2 className="text-lg font-bold text-gray-800 text-center">{name}</h2>

      <div className="text-left mt-3 flex-grow">
        <h3 className="font-semibold text-gray-700">Vision:</h3>
        <p style={{ whiteSpace: "pre-line" }} className="text-sm text-gray-600 block max-h-[100px]">{vision}</p>

        <h3 className="font-semibold text-gray-700 mt-2">Mission:</h3>
        <p style={{ whiteSpace: "pre-line" }} className="text-sm text-gray-600 block max-h-[100px] overflow-y-auto scrollbar-hidden">{mission}</p>
      </div>

      {/* Tombol untuk membuka modal */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
      >
        Lihat Resume
      </button>

      {/* Modal dengan iframe untuk menampilkan resume */}
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center p-4 bg-black/50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl relative">
            {/* Tombol close */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-2 right-3 text-gray-600 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
            
            <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">Resume</h2>

            {/* Iframe untuk menampilkan file dari IPFS */}
            <iframe 
              src={resumeLink} 
              className="w-full h-[600px] border rounded-lg"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
