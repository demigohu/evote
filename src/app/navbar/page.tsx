"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { claimToken } from "@/utils/ethers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar() {

  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, status } = useAccount() as {
    isConnected: boolean;
    status: "loading" | "unauthenticated" | "authenticated" | "disconnected" | "connected" | "reconnecting" | "connecting";
  }; // status bisa: "loading", "unauthenticated", "authenticated"
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setHydrated(true); // ✅ Pastikan ini jalan setelah hydration selesai
  }, []);

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
  }, [isConnected, hydrated, isInitialized, router]);

    // Jangan render navbar jika di halaman home
    if (pathname === "/") return null;

  return (
    <nav className="fixed top-0 start-0 w-full z-20 h-[85px] px-4 bg-[#c2001a] flex items-center">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Kiri: Logo + Menu */}
      <div className="flex items-center gap-6 flex-grow">
        <h1 className="text-white text-3xl font-normal font-[Yellowtail] lowercase rotate-[-10deg]">
          e-voting
        </h1>

        {/* Menu untuk Desktop */}
        <div className="hidden lg:flex gap-6">
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

      {/* Kanan: Button & Address */}
      <div className="hidden lg:flex items-center gap-3">
        <button onClick={claimToken} className="px-6 py-2 bg-green-600 rounded-full hover:bg-green-700 text-white text-sm font-medium">
          Claim 1 VTK token
        </button>
        <div className="flex items-center rounded-full px-3 py-2 gap-2">
          <ConnectButton chainStatus="none" />
        </div>
      </div>

      {/* Hamburger Menu untuk Mobile */}
      <button
          onClick={() => {
            if (hydrated) setIsOpen(!isOpen);
          }}
        className="lg:hidden text-white focus:outline-none justify-center items-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
          />
        </svg>
      </button>

      {/* Dropdown Menu untuk Mobile */}
      {isOpen && (
        <div className="absolute top-[85px] left-0 w-full bg-[#c2001a] text-white flex flex-col items-center py-4 space-y-4 shadow-lg lg:hidden rounded-b-3xl">
          <Link href="/candidates" className="text-sm font-bold font-[Poppins] capitalize">
            Candidates
          </Link>
          <Link href="/vote" className="text-sm font-medium font-[Poppins] capitalize">
            Vote
          </Link>
          <Link href="/add-candidates" className="text-sm font-medium font-[Poppins] capitalize">
            Add Candidates
          </Link>
          <div className="w-full h-[1px] bg-white my-2"></div>
          <button onClick={claimToken} className="px-6 py-2 bg-green-600 rounded-full hover:bg-green-700 text-white text-sm font-medium">
            Claim 1 VTK token
          </button>
          {/* <div className="flex items-center rounded-full px-3 py-2 gap-2"> */}
            <ConnectButton chainStatus="none" />
          {/* </div> */}
        </div>
      )}
    </nav>
  );
}


