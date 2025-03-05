"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { claimToken } from "@/utils/ethers";

export default function Navbar() {
  const pathname = usePathname();
  
    // Jangan render navbar jika di halaman home
    if (pathname === "/") return null;

  const router = useRouter();
  const { isConnected, status } = useAccount() as {
    isConnected: boolean;
    status: "loading" | "unauthenticated" | "authenticated" | "disconnected" | "connected" | "reconnecting" | "connecting";
  }; // status bisa: "loading", "unauthenticated", "authenticated"
  const [isInitialized, setIsInitialized] = useState(false);

  // Tunggu sampai status Wagmi selesai loading sebelum cek isConnected
  useEffect(() => {
    if (status === "loading") return; // Tunggu sampai Wagmi selesai inisialisasi
    setIsInitialized(true);
  }, [status]);

  // Redirect ke home jika wallet disconnect setelah inisialisasi selesai
  useEffect(() => {
    if (isInitialized && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isInitialized, router]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-[85px] px-6 sm:px-16 bg-[#c2001a] flex justify-between items-center w-full">
      {/* Logo & Menu */}
      <div className="flex items-center gap-6">
        <h1 className="text-white text-3xl font-normal font-[Yellowtail] lowercase rotate-[-10deg]">
          e-voting
        </h1>
        {/* Menu (Hidden di Mobile) */}
        <div className="hidden sm:flex gap-6">
          <Link href="/candidates" className="text-white text-sm font-bold font-[Poppins] capitalize">
            Candidates
          </Link>
          <Link href="/vote" className="text-white text-sm font-medium font-[Poppins] capitalize">
            Vote
          </Link>
          <Link href="/add-candidates" className="text-white text-sm font-medium font-[Poppins] capitalize">
            Add Candidates
          </Link>
        </div>
      </div>

      {/* Button & Address */}
      <div className="flex items-center gap-3">
        <button onClick={claimToken} className="px-6 py-2 bg-green-600 rounded-full hover:bg-green-700 text-white text-sm font-medium font-[Poppins] capitalize">
          Claim 1 VTK token
        </button>
        <div className="flex items-center rounded-full px-3 py-2 gap-2 ">
          <ConnectButton />
          
        </div>
      </div>
    </nav>
  );
}
