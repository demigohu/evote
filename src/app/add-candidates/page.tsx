"use client";
import Navbar from "../navbar/page";
import { useState } from "react";
import { getContractWithSigner } from "@/utils/ethers";

export default function AddCandidates() {
  const [candidates, setCandidates] = useState({ name: "", photoUrl: "", resume: "", vision: "", mission: "" });
  const [voterAddress, setVoterAddress] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");


  async function handleAddCandidates() {
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.addCandidate(
        candidates.name,
        candidates.photoUrl,
        candidates.resume,
        candidates.vision,
        candidates.mission
      );
      await tx.wait();
      setSuccess("Candidate added successfully!");
      setCandidates({ name: "", photoUrl: "", resume: "", vision: "", mission: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to add candidate.");
    }
  }

  async function handleRegister() {
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.registerVoter(voterAddress);
      await tx.wait();
      setSuccess("Voter registered successfully!");
      setVoterAddress("");
    } catch (err) {
      console.error(err);
      setError("Failed to register voter.");
    }
  }


  return (
    <>
    <Navbar />
    <div className="flex justify-center items-center min-h-screen " style={{ backgroundImage: "url('/4.jpg')", minHeight: "100vh", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Add Candidates</h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Candidate Name" value={candidates.name} onChange={(e) => setCandidates({ ...candidates, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
          <input type="text" placeholder="Photo Url" value={candidates.photoUrl} onChange={(e) => setCandidates({ ...candidates, photoUrl: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
          <input type="text" placeholder="Resume" value={candidates.resume} onChange={(e) => setCandidates({ ...candidates, resume: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
          <textarea
            placeholder="Vision"
            value={candidates.vision}
            onChange={(e) => setCandidates({ ...candidates, vision: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md h-24"
          />
          <textarea
            placeholder="Mission"
            value={candidates.mission}
            onChange={(e) => setCandidates({ ...candidates, mission: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md h-24"
          />

          <button onClick={handleAddCandidates} className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">Submit</button>
        </form>

        <form className="space-y-4 pt-10" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Register" value={voterAddress} onChange={(e) => setVoterAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />

          <button onClick={handleRegister} className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600">Submit</button>
        </form>

      </div>
    </div>
    </>
  );
}