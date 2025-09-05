"use client";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [mounted, setMounted] = useState(false);
  const [langChoice, setLangChoice] = useState("english");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setMounted(true);

    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);

    const id = localStorage.getItem("userId") || "";
    setUserId(id);

    // 🎙️ Voice success message
    const message =
      lang === "tamil"
        ? "உங்கள் பயனர் ஐடி வெற்றிகரமாக உருவாக்கப்பட்டது. இதைப் பயன்படுத்தி எளிதாக கடனுக்கு விண்ணப்பிக்கலாம்."
        : "Your user ID is created successfully. Use this to apply loan easily.";

    const utterance = new SpeechSynthesisUtterance(message);
    let voices = window.speechSynthesis.getVoices();

    if (lang === "tamil") {
      const tamilVoice = voices.find((v) => v.lang.toLowerCase().includes("ta"));
      if (tamilVoice) utterance.voice = tamilVoice;
    } else {
      const englishVoice = voices.find((v) => v.lang.toLowerCase().includes("en"));
      if (englishVoice) utterance.voice = englishVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  if (!mounted) return null; // ✅ prevents hydration mismatch

  return (
    <div className="app-container">
      <div className="card text-center">
        <h2 className="text-xl font-bold mb-4">
          {langChoice === "tamil" ? "🎉 சுயவிவரம் உருவாக்கப்பட்டது!" : "🎉 Profile Created!"}
        </h2>
        <p className="text-lg mb-4">
          {langChoice === "tamil" ? "உங்கள் பயனர் ஐடி:" : "Your User ID:"}
        </p>
        <p className="text-2xl font-mono font-bold text-purple-700">{userId}</p>
        <button
          className="mt-6"
          onClick={() => (window.location.href = "/studentloan")}
        >
          {langChoice === "tamil" ? "கடன் விண்ணப்பத்திற்கு செல்லவும்" : "Proceed to Student Loan"}
        </button>
      </div>
    </div>
  );
}
