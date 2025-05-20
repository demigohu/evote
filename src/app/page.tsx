"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.push("/votings");
    }
  }, [isConnected, router]);

  return (
    <div className="flex flex-col">
      <div className="background-animation text-white flex flex-col items-center justify-center min-h-screen px-4 sm:px-20 py-12 gap-10">
        
        <div className="flex flex-col items-center">
          <h1 className="text-5xl sm:text-[80px] rotate-[-10deg] font-normal font-[Yellowtail] lowercase text-center">
            e-voting
          </h1>
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl sm:text-[32px] font-medium font-[Poppins] capitalize">
            E-Voting - Cepat, Aman, dan Transparan!
          </h2>
          <p className="text-white/80 text-sm sm:text-base font-medium font-[Poppins] capitalize">
            Solusi Pemilihan Digital yang Efektif dan Terpercaya.
          </p>
        </div>

        <div>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}