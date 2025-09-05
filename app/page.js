"use client";
import { useRouter } from "next/navigation";

export default function LanguagePage() {
  const router = useRouter();

  const handleLanguageSelect = (lang) => {
    localStorage.setItem("lang", lang);
    router.push("/home"); // ✅ redirect to /home instead of /profile
  };

  return (
    <div className="app-container">
      <div className="card flex flex-col items-center text-center">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="HVLoan Logo"
          className="max-w-[100px] max-h-[100px] mb-4 object-contain"
        />

        {/* App Name */}
        <h1 className="text-2xl font-bold text-purple-700 mb-2">HVLoan</h1>

        {/* Subtitle */}
        <h2 className="text-lg font-semibold mb-6">Select Your Language</h2>

        {/* Language Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => handleLanguageSelect("english")}
            className="bg-purple-600 text-white py-2 rounded"
          >
            English
          </button>
          <button
            onClick={() => handleLanguageSelect("tamil")}
            className="bg-purple-600 text-white py-2 rounded"
          >
            தமிழ்
          </button>
        </div>
      </div>
    </div>
  );
}
