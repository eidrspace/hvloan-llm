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

    // ✅ Voice assistant on mount
    const text =
      lang === "tamil"
        ? "ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்: சுயவிவரம், கடன் வரலாறு, தகுதி சரிபார்ப்பு, கடன் உதவியாளர் அல்லது மாணவர் கடன் விண்ணப்பம்."
        : "Choose an option: Profile, Loan History, Eligibility, Loan Assistant, or Apply Student Loan.";
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      lang === "tamil" ? v.lang.toLowerCase().includes("ta") : v.lang.toLowerCase().includes("en")
    );
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

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
      studentloan: " மாணவர் கடன் விண்ணப்பிக்கவும்",
    },
  }[langChoice];

  return (
    <div className="app-container flex items-center justify-center h-screen">
      <div className="card text-center p-8 space-y-4">
        <h1 className="text-2xl font-bold mb-6">{t.title}</h1>

        <button
  onClick={() =>
    profileCreated ? router.push("/viewprofile") : router.push("/profile")
  }
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

        {/* ✅ New Apply Student Loan button */}
        <button
          onClick={() => router.push("/studentloan")}
          className="bg-pink-600 text-white py-2 px-4 rounded w-full"
        >
          {t.studentloan}
        </button>
      </div>
    </div>
  );
}
