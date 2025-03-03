import { ConnectButton } from "@rainbow-me/rainbowkit";
import Navbar from "./navbar/page";
import AddCandidates from "./add-candidates/page";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="background-animation text-white flex flex-col items-center justify-center min-h-screen px-4 sm:px-20 py-12 gap-10">
        
        {/* Judul */}
        <div className="flex flex-col items-center">
          <h1 className="text-5xl sm:text-[80px] rotate-[-10deg] font-normal font-[Yellowtail] lowercase text-center">
            e-voting
          </h1>
        </div>

        {/* Deskripsi */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl sm:text-[32px] font-medium font-[Poppins] capitalize">
            Evoting - Cepat, Aman, dan Transparan!
          </h2>
          <p className="text-white/80 text-sm sm:text-base font-medium font-[Poppins] capitalize">
            Solusi Pemilihan Digital yang Efektif dan Terpercaya.
          </p>
        </div>

        {/* Tombol Connect Wallet */}
        <div>
          <ConnectButton />
        </div>
        
      </div>
     </div>
  );
}
