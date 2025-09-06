"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [langChoice, setLangChoice] = useState("english");
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);
    const profile = localStorage.getItem("userId");
    if (profile) setProfileCreated(true);
  }, []);

  // ✅ Voice assistant function (called only when button is clicked)
  const speakMenu = () => {
    const text =
      langChoice === "tamil"
        ? "ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்: சுயவிவரம், கடன் வரலாறு, தகுதி சரிபார்ப்பு அல்லது கடன் உதவியாளர்."
        : "Choose an option: Profile, Loan History, Eligibility, or Loan Assistant.";
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      langChoice === "tamil"
        ? v.lang.toLowerCase().includes("ta")
        : v.lang.toLowerCase().includes("en")
    );
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!mounted) return null;

  const t = {
    english: {
      title: "Main Menu",
      profile: profileCreated ? " View Profile" : " Create Profile",
      history: " Loan History",
      eligibility: " Check Loan Eligibility",
      assistant: " Loan Assistant",
      studentloan: " Apply Student Loan",
    },
    tamil: {
      title: "முதன்மை பட்டியல்",
      profile: profileCreated ? " சுயவிவரம்" : " சுயவிவரத்தை உருவாக்கவும்",
      history: " கடன் வரலாறு",
      eligibility: " தகுதி சரிபார்ப்பு",
      assistant: " கடன் உதவியாளர்",
      studentloan: " மாணவர் கடனுக்கு விண்ணப்பிக்கவும்",
    },
  }[langChoice];

  return (
    <div className="app-container flex items-center justify-center h-screen">
      <div className="card text-center p-8 space-y-4">
        {/* Title with Speaker Button */}
        <h1 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          {t.title}
          <button
            onClick={speakMenu}
            className="ml-2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
            title="Repeat Menu"
          >
            🔊
          </button>
        </h1>

        {/* Buttons */}
        <button
          onClick={() => router.push("/profile")}
          className="bg-blue-600 text-white py-2 px-4 rounded w-full"
        >
          {t.profile}
        </button>
        <button
          onClick={() => router.push("/loanhistory")}
          className="bg-green-600 text-white py-2 px-4 rounded w-full"
        >
          {t.history}
        </button>
        <button
          onClick={() => router.push("/eligibility")}
          className="bg-yellow-600 text-white py-2 px-4 rounded w-full"
        >
          {t.eligibility}
        </button>
        <button
          onClick={() => router.push("/loanassistant")}
          className="bg-purple-600 text-white py-2 px-4 rounded w-full"
        >
          {t.assistant}
        </button>
        <button
          onClick={() => router.push("/studentloan")}
          className="bg-red-600 text-white py-2 px-4 rounded w-full"
        >
          {t.studentloan}
        </button>
      </div>
    </div>
  );
}
