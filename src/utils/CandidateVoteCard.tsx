import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constant";
import { getProvider } from "./ethers";

interface CandidateProps {
  id: number;
  name: string;
  photoUrl: string;
  vision: string;
  mission: string;
  resumeLink: string;
  onVote: (candidateId: number) => void;
}

const CandidateVoteCard: React.FC<CandidateProps> = ({ id, name, photoUrl, vision, mission, resumeLink, onVote }) => {
  const [votes, setVotes] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const candidate = await contract.getCandidate(id);
        setVotes(Number(candidate[6]));
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };
    fetchVotes();
  }, [id]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
      <img src={photoUrl} alt={name} className="w-full h-100 object-cover rounded-xl mb-4" />
      <h2 className="text-lg font-bold text-gray-800">{name}</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mt-2 border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition w-full"
      >
        Detail Candidate
      </button>

      <p className="mt-2 text-gray-700 font-semibold">Total Votes: {votes}</p>

      <button
        onClick={() => onVote(id)}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
      >
        Vote Now
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-3xl relative">
            <h2 className="text-xl font-bold text-center mb-4">{name}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-red-500 p-3 rounded-lg">
                <h3 className="font-bold">Vision</h3>
                <p>{vision}</p>
              </div>
              <div className="border-2 border-red-500 p-3 rounded-lg">
                <h3 className="font-bold">Mission</h3>
                <p>{mission}</p>
              </div>
            </div>
            
            <h3 className="mt-4 font-bold text-center">Resume</h3>
            <iframe
              src={resumeLink}
              className="w-full h-64 border-2 border-red-500 rounded-lg mt-2"
            ></iframe>
            
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg w-full hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateVoteCard;
