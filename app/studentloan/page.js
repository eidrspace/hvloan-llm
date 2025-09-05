"use client";
import { useState, useEffect } from "react";

export default function StudentLoanPage() {
  const [mounted, setMounted] = useState(false);
  const [langChoice, setLangChoice] = useState("english");
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    studentName: "",
    loanAmount: "",
  });

  const [eligibility, setEligibility] = useState("");
  const [status, setStatus] = useState(""); // approved, pending, rejected

  // ✅ Detect language on mount
  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);
  }, []);

  // Steps
  const stepsEnglish = [
    { type: "voice", label: "Enter the Student Name", field: "studentName" },
    { type: "voice", label: "Enter the Loan Amount", field: "loanAmount" },
    { type: "review", label: "Review your details", field: "review" },
    { type: "eligibility", label: "Checking eligibility...", field: "eligibility" },
  ];

  const stepsTamil = [
    { type: "voice", label: "மாணவரின் பெயரை உள்ளிடவும்", field: "studentName" },
    { type: "voice", label: "கடன் தொகையை உள்ளிடவும்", field: "loanAmount" },
    { type: "review", label: "உங்கள் விவரங்களை சரிபார்க்கவும்", field: "review" },
    { type: "eligibility", label: "தகுதியை சரிபார்க்கிறது...", field: "eligibility" },
  ];

  const steps = langChoice === "tamil" ? stepsTamil : stepsEnglish;
  const currentStep = steps[step] || null;

  // ✅ Voice Assistant
  const speakText = (text) => {
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

  useEffect(() => {
    if (mounted && currentStep) speakText(currentStep.label);
  }, [step, currentStep, langChoice, mounted]);

  // ✅ Voice Recognition Input
  const startListening = (field) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = langChoice === "tamil" ? "ta-IN" : "en-IN";
    recognition.start();
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setFormData({ ...formData, [field]: spokenText });
    };
  };

  // ✅ Eligibility check
  const checkEligibility = () => {
    const income = parseFloat(localStorage.getItem("income") || "0");
    const loan = parseFloat(formData.loanAmount || "0");

    // ✅ Save loan amount to localStorage for Loan Assistant
    localStorage.setItem("loanAmount", formData.loanAmount);

    if (loan <= income * 12) {
      setEligibility(
        langChoice === "tamil"
          ? "✅ நீங்கள் தகுதியானவர், ஏனெனில் உங்கள் கடன் திருப்பிச் செலுத்தக்கூடியது."
          : "✅ You are eligible because your loan request is repayable."
      );
      setStatus("approved");
      speakText(eligibility);
    } else if (loan <= income * 15) {
      setEligibility(
        langChoice === "tamil"
          ? "⚠️ உங்கள் கடன் கோரிக்கை உங்கள் வருமானத்தை விட அதிகம், ஆனால் மதிப்பாய்வு செய்யப்படலாம்."
          : "⚠️ Your loan request is higher than your income, but may go for manual review."
      );
      setStatus("pending");
      speakText(eligibility);
    } else {
      setEligibility(
        langChoice === "tamil"
          ? "❌ நீங்கள் தகுதியற்றவர், ஏனெனில் உங்கள் கடன் கோரிக்கை உங்கள் வருமானத்தை விட அதிகம்."
          : "❌ You are not eligible because your loan request exceeds your income."
      );
      setStatus("rejected");
      speakText(eligibility);
    }
  };

  // ✅ Navigation
  const handleNext = () => {
    if (currentStep?.type === "eligibility") {
      checkEligibility();
      // Save history
      const newLoan = {
        id: "LN" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        location: "Chennai", // TODO: replace with geolocation API
        status,
      };
      const existing = JSON.parse(localStorage.getItem("loanHistory") || "[]");
      existing.push(newLoan);
      localStorage.setItem("loanHistory", JSON.stringify(existing));
    }
    setStep((s) => Math.min(s + 1, steps.length));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  if (!mounted) return null;

  return (
    <div className="app-container">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">
          {langChoice === "tamil" ? "மாணவர் கடன் விண்ணப்பம்" : "Student Loan Application"}
        </h2>

        {step < steps.length ? (
          <>
            <p className="mb-4 font-semibold flex items-center">
              {currentStep.label}
              <button onClick={() => speakText(currentStep.label)} className="ml-2">🔊</button>
            </p>

            {currentStep.type === "voice" && (
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  value={formData[currentStep.field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [currentStep.field]: e.target.value })
                  }
                />
                <button onClick={() => startListening(currentStep.field)} className="ml-2">🎙️</button>
              </div>
            )}

            {currentStep.type === "review" && (
              <div className="text-left">
                <ul className="mb-4">
                  {Object.entries(formData).map(([k, v]) => (
                    <li key={k} className="mb-2">
                      <strong>{k}:</strong>{" "}
                      <input
                        type="text"
                        value={v || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, [k]: e.target.value })
                        }
                        className="border p-1 ml-2"
                      />
                    </li>
                  ))}
                </ul>
                <p>{langChoice === "tamil" ? "உறுதிப்படுத்துகிறீர்களா?" : "Do you confirm?"}</p>
              </div>
            )}

            {currentStep.type === "eligibility" && eligibility && (
              <div
                className={`p-3 mt-4 rounded font-bold ${
                  status === "approved"
                    ? "bg-green-200 text-green-800"
                    : status === "pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {eligibility}
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button onClick={handleBack} disabled={step === 0}>
                {langChoice === "tamil" ? "⬅ முந்தையது" : "⬅ Back"}
              </button>
              <button onClick={handleNext}>
                {langChoice === "tamil" ? "அடுத்து ➡" : "Next ➡"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="mb-4">
              {langChoice === "tamil"
                ? "உங்கள் கடன் கோரிக்கை சமர்ப்பிக்கப்பட்டது"
                : "Loan Request Submitted"}
            </h3>
            <button onClick={() => (window.location.href = "/loanhistory")} className="bg-blue-600 text-white px-4 py-2 rounded">
              {langChoice === "tamil"
                ? "கடன் வரலாற்றைக் காண்க"
                : "View Loan History"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
