"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEVotingContract } from "../hooks/useEVotingContract";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Mendapatkan alamat admin dari smart contract
  const { address } = useAccount();
  const { admin } = useEVotingContract();
  const isAdmin =
    address && admin && address.toLowerCase() === admin.toLowerCase();

  return (
    <nav className="fixed top-0 start-0 w-full z-20 h-[85px] px-4 bg-[#c2001a] flex items-center">
      <div className="flex items-center gap-6 flex-grow">
        <Link href={"/"}>
          <h1 className="text-white text-3xl font-normal font-[Yellowtail] lowercase rotate-[-10deg]">
            e-voting
          </h1>
        </Link>

        <div className="hidden lg:flex gap-6">
          <Link
            href="/voting-round"
            className="text-white text-sm font-bold font-[Poppins] capitalize"
          >
            Daftar Voting
          </Link>
          <Link
            href="/result"
            className="text-white text-sm font-bold font-[Poppins] capitalize"
          >
            Hasil Voting
          </Link>
          {/* <Link href="/register" className="text-white text-sm font-medium font-[Poppins] capitalize">
            Registrasi
          </Link> */}
          {isAdmin && (
            <Link
              href="/admin-dashboard"
              className="text-white text-sm font-medium font-[Poppins] capitalize"
            >
              Dashboard Admin
            </Link>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center rounded-full px-3 py-2 gap-2">
          <ConnectButton chainStatus="none" />
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden text-white focus:outline-none justify-center items-center"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[85px] left-0 w-full bg-[#c2001a] text-white flex flex-col items-center py-4 space-y-4 shadow-lg lg:hidden rounded-b-3xl">
          <Link
            href="/voting-round"
            className="text-sm font-bold font-[Poppins] capitalize"
          >
            Daftar Voting
          </Link>
          <Link
            href="/result"
            className="text-sm font-bold font-[Poppins] capitalize"
          >
            Hasil Voting
          </Link>
          {/* <Link href="/register" className="text-sm font-medium font-[Poppins] capitalize">
            Registrasi
          </Link> */}
          {isAdmin && (
            <Link
              href="/admin-dashboard"
              className="text-sm font-medium font-[Poppins] capitalize"
            >
              Dashboard Admin
            </Link>
          )}
          <div className="w-full h-[1px] bg-white my-2"></div>
          <ConnectButton chainStatus="none" />
        </div>
      )}
    </nav>
  );
}
