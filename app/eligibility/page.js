"use client";
import { useState, useEffect } from "react";

export default function EligibilityPage() {
  const [mounted, setMounted] = useState(false);
  const [langChoice, setLangChoice] = useState("english");
  const [income, setIncome] = useState("");
  const [loan, setLoan] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);
  }, []);

  const speakText = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (langChoice === "tamil") {
      const ta = voices.find((v) => v.lang.toLowerCase().includes("ta"));
      if (ta) utterance.voice = ta;
    } else {
      const en = voices.find((v) => v.lang.toLowerCase().includes("en"));
      if (en) utterance.voice = en;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const checkEligibility = () => {
    const inc = parseFloat(income);
    const ln = parseFloat(loan);

    if (!inc || !ln) {
      const msg =
        langChoice === "tamil"
          ? "⚠️ தயவுசெய்து வருமானமும் கடன் தொகையும் உள்ளிடவும்."
          : "⚠️ Please enter both income and loan amount.";
      setResult(msg);
      speakText(msg);
      return;
    }

    // Simple rule (replace with TensorFlow.js model below)
    let msg = "";
    if (ln <= inc * 12) {
      msg =
        langChoice === "tamil"
          ? "✅ நீங்கள் தகுதியானவர், உங்கள் கடன் திருப்பிச் செலுத்தக்கூடியது."
          : "✅ You are eligible, your loan is repayable.";
    } else {
      msg =
        langChoice === "tamil"
          ? "❌ நீங்கள் தகுதியற்றவர், கடன் உங்கள் வருமானத்தை விட அதிகம்."
          : "❌ You are not eligible, loan exceeds your income.";
    }

    setResult(msg);
    speakText(msg);
  };

  if (!mounted) return null;

  return (
    <div className="app-container">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">
          {langChoice === "tamil" ? "கடன் தகுதி சரிபார்ப்பு" : "Loan Eligibility Check"}
        </h2>

        <input
          type="number"
          placeholder={langChoice === "tamil" ? "வருமானம்" : "Income"}
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="number"
          placeholder={langChoice === "tamil" ? "கடன் தொகை" : "Loan Amount"}
          value={loan}
          onChange={(e) => setLoan(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          className="bg-blue-600 text-white py-2 px-4 rounded"
          onClick={checkEligibility}
        >
          {langChoice === "tamil" ? "சரிபார்க்கவும்" : "Check"}
        </button>

        {result && (
          <div className="mt-4 font-bold text-lg">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
