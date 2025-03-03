"use client"; // Jika di Next.js App Router

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="h-[85px] px-6 sm:px-16 bg-[#c2001a] flex justify-between items-center w-full">
      {/* Logo & Menu */}
      <div className="flex items-center gap-6">
        <h1 className="text-white text-3xl font-normal font-[Yellowtail] lowercase">
          e-voting
        </h1>
        {/* Menu (Hidden di Mobile) */}
        <div className="hidden sm:flex gap-6">
          <a href="/candidates" className="text-white text-sm font-bold font-[Poppins] capitalize">
            Candidates
          </a>
          <a href="/vote" className="text-white text-sm font-medium font-[Poppins] capitalize">
            Vote
          </a>
          <a href="/add-candidates" className="text-white text-sm font-medium font-[Poppins] capitalize">
            Add Candidates
          </a>
        </div>
      </div>

      {/* Button & Address */}
      <div className="flex items-center gap-3">
        <button className="px-6 py-2 bg-green-600 rounded-full text-white text-sm font-medium font-[Poppins] capitalize">
          Claim 1 VTK token
        </button>
        <div className="flex items-center bg-black/20 rounded-full px-3 py-2 gap-2">
          <ConnectButton />
          
        </div>
      </div>
    </nav>
  );
}
