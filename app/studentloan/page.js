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
  const [status, setStatus] = useState("");

  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);
  }, []);

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

  // 🔊 Voice Assistant
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

  useEffect(() => {
    if (mounted && currentStep) speakText(currentStep.label);
  }, [step, currentStep, langChoice, mounted]);

  // 🎙️ Voice Recognition Input
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

  // 🤖 Mock AI/ML Eligibility Scoring
  const runEligibilityModel = (income, loan) => {
    const ratio = loan / (income * 12); // loan vs yearly income
    let result = { status: "rejected", msgEn: "", msgTa: "" };

    if (ratio <= 1) {
      result.status = "approved";
      result.msgEn = "✅ You are eligible because your loan is within your annual income.";
      result.msgTa = "✅ நீங்கள் தகுதியானவர், ஏனெனில் உங்கள் கடன் ஆண்டு வருமானத்திற்குள் உள்ளது.";
    } else if (ratio <= 1.25) {
      result.status = "pending";
      result.msgEn = "⚠️ Your loan is slightly higher than your income. It may require manual review.";
      result.msgTa = "⚠️ உங்கள் கடன் உங்கள் வருமானத்தை விட சற்று அதிகம். இது கையேடு மதிப்பாய்வை தேவைப்படலாம்.";
    } else {
      result.status = "rejected";
      result.msgEn = "❌ You are not eligible because your loan request exceeds your income.";
      result.msgTa = "❌ நீங்கள் தகுதியற்றவர், ஏனெனில் உங்கள் கடன் உங்கள் வருமானத்தை விட அதிகம்.";
    }

    return result;
  };

  // ✅ Eligibility check
  const checkEligibility = () => {
    const income = parseFloat(localStorage.getItem("income") || "0");
    const loan = parseFloat(formData.loanAmount || "0");

    const result = runEligibilityModel(income, loan);

    setEligibility(langChoice === "tamil" ? result.msgTa : result.msgEn);
    setStatus(result.status);

    // Speak the eligibility message
    speakText(langChoice === "tamil" ? result.msgTa : result.msgEn);

    // Save history
    const newLoan = {
      id: "LN" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString(),
      location: "Chennai", // TODO: replace with geolocation API
      status: result.status,
      amount: loan,
    };
    const existing = JSON.parse(localStorage.getItem("loanHistory") || "[]");
    existing.push(newLoan);
    localStorage.setItem("loanHistory", JSON.stringify(existing));
  };

  // Navigation
  const handleNext = () => {
    if (currentStep?.type === "eligibility") {
      checkEligibility();
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
          <>
            <h3 className="mb-4">
              {langChoice === "tamil"
                ? "உங்கள் கடன் கோரிக்கை சமர்ப்பிக்கப்பட்டது"
                : "Loan Request Submitted"}
            </h3>
            <button onClick={() => (window.location.href = "/loanhistory")}>
              {langChoice === "tamil"
                ? "கடன் வரலாற்றைக் காண்க"
                : "View Loan History"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
