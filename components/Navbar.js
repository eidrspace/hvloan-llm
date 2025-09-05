"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [status, setStatus] = useState("Online");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateStatus = () => {
      if (!navigator.onLine) {
        setStatus("Offline - progress saved");
      } else if (navigator.connection) {
        setStatus(
          navigator.connection.downlink < 1
            ? "Online - Poor Network"
            : "Online - Stable"
        );
      } else {
        setStatus("Online");
      }
    };
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 shadow">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="HVLoan" width={40} height={40} />
          <h1 className="font-bold text-xl">HVLoan</h1>
        </div>
        <span className="text-sm">{status}</span>
      </div>
    </nav>
  );
}
