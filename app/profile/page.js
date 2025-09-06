"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Tesseract from "tesseract.js";
import OCRInput from "../../components/OCRInput";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [langChoice, setLangChoice] = useState("english");
  const [step, setStep] = useState(0);
  const [ocrMessage, setOcrMessage] = useState("");
  const spokenStep = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    fatherName: "",
    incomeType: "",
    income: "",
    aadhaar: "",
    pan: null,
    bankCard: null,
    collateral: null,
  });

  const [userId, setUserId] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [status, setStatus] = useState("");

  const stepsEnglish = [
    { type: "voice", label: "Say your First Name", field: "firstName" },
    { type: "voice", label: "Say your Father’s Name", field: "fatherName" },
    { type: "voice", label: "Enter your Income Type (monthly or daily)", field: "incomeType" },
    { type: "voice", label: "Enter your Income Amount", field: "income" },
    { type: "file", label: "Upload Aadhaar", field: "aadhaar" },
    { type: "file", label: "Upload PAN", field: "pan" },
    { type: "file", label: "Upload Bank Card", field: "bankCard" },
    { type: "file", label: "Upload Collateral Document", field: "collateral" },
    { type: "review", label: "Review your details", field: "review" },
    { type: "eligibility", label: "Check Eligibility", field: "eligibility" },
  ];

  const stepsTamil = [
    { type: "voice", label: "உங்கள் பெயரை சொல்லுங்கள்", field: "firstName" },
    { type: "voice", label: "உங்கள் தந்தையின் பெயரை சொல்லுங்கள்", field: "fatherName" },
    { type: "voice", label: "வருமான வகையை சொல்லுங்கள் (மாதாந்திரம் அல்லது தினசரி)", field: "incomeType" },
    { type: "voice", label: "உங்கள் வருமானத்தை உள்ளிடவும்", field: "income" },
    { type: "file", label: "ஆதார் அட்டையை பதிவேற்றவும்", field: "aadhaar" },
    { type: "file", label: "பான் அட்டையை பதிவேற்றவும்", field: "pan" },
    { type: "file", label: "வங்கி அட்டையை பதிவேற்றவும்", field: "bankCard" },
    { type: "file", label: "உத்தரவாத ஆவணத்தை பதிவேற்றவும்", field: "collateral" },
    { type: "review", label: "உங்கள் விவரங்களை சரிபார்க்கவும்", field: "review" },
    { type: "eligibility", label: "தகுதி சரிபார்ப்பு", field: "eligibility" },
  ];

  const steps = langChoice === "tamil" ? stepsTamil : stepsEnglish;
  const currentStep = steps[step] || null;

  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);
  }, []);

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
    if (mounted && currentStep && spokenStep.current !== step) {
      speakText(currentStep.label);
      spokenStep.current = step;
    }
  }, [step, currentStep, langChoice, mounted]);

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

  // Aadhaar OCR Result Handler
  const handleOcrResult = (text) => {
    const digits = text.replace(/\D/g, "");
    const match = digits.match(/\d{12}/);
    const aadhaarNum = match ? match[0].replace(/(\d{4})(?=\d)/g, "$1 ").trim() : "";

    if (aadhaarNum) {
      setFormData({ ...formData, aadhaar: aadhaarNum });
      setOcrMessage("✅ Aadhaar number detected successfully");
    } else {
      setFormData({ ...formData, aadhaar: "" });
      setOcrMessage("⚠ Aadhaar number not detected. Please try again.");
    }
  };

  // Hybrid OCR with sample upload
  const handleSampleUpload = async () => {
    try {
      setOcrMessage("🔎 Scanning sample Aadhaar...");
      const { data: { text } } = await Tesseract.recognize("/sample_aadhaar.jpeg", "eng", {
        tessedit_char_whitelist: "0123456789",
      });
      handleOcrResult(text);
    } catch (err) {
      setOcrMessage("⚠ Failed to process sample Aadhaar.");
    }
  };

  // File Upload (non-Aadhaar)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [currentStep.field]: file?.name });
  };

  // ✅ Eligibility Check
  const checkEligibility = () => {
    const income = parseFloat(formData.income || "0");
    if (income >= 10000) {
      setEligibility(
        langChoice === "tamil"
          ? "✅ நீங்கள் தகுதியானவர், ஏனெனில் உங்கள் வருமானம் போதுமானதாகும்."
          : "✅ You are eligible because your income is sufficient."
      );
      setStatus("approved");
    } else if (income > 5000) {
      setEligibility(
        langChoice === "tamil"
          ? "⚠️ உங்கள் வருமானம் குறைவாக உள்ளது, ஆனால் மதிப்பாய்வு செய்யப்படலாம்."
          : "⚠️ Your income is low, but it may go for manual review."
      );
      setStatus("pending");
    } else {
      setEligibility(
        langChoice === "tamil"
          ? "❌ நீங்கள் தகுதியற்றவர், ஏனெனில் உங்கள் வருமானம் போதுமானதாக இல்லை."
          : "❌ You are not eligible because your income is too low."
      );
      setStatus("rejected");
    }
    speakText(eligibility);
  };

  const handleNext = () => {
    if (currentStep?.type === "eligibility") {
      checkEligibility();
    } else if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const newId = "HV" + Math.floor(100000 + Math.random() * 900000);
      setUserId(newId);
      localStorage.setItem("userId", newId);
      localStorage.setItem("income", formData.income);
      setStep(steps.length);
      speakText(
        langChoice === "tamil"
          ? `உங்கள் பயனர் ஐடி ${newId}. இதன் மூலம் நீங்கள் எளிதாக கடனுக்கு விண்ணப்பிக்கலாம்.`
          : `Your User ID is ${newId}. With this you can easily apply for loans.`
      );
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  if (!mounted) return null;

  return (
    <div className="app-container">
      <div className="card">
        {/* Header + Speaker */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {langChoice === "tamil" ? "சுயவிவர உருவாக்கம்" : "Profile Creation"}
          </h2>
          <button
            onClick={() => currentStep && speakText(currentStep.label)}
            className="bg-purple-500 text-white px-3 py-2 rounded-full hover:bg-purple-600"
          >
            🔊
          </button>
        </div>

        {/* Step Instruction */}
        {currentStep && (
          <p className="mb-4 font-semibold text-gray-700">{currentStep.label}</p>
        )}

        {/* Voice Input */}
        {currentStep?.type === "voice" && (
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={formData[currentStep.field]}
              onChange={(e) =>
                setFormData({ ...formData, [currentStep.field]: e.target.value })
              }
            />
            <button
              onClick={() => startListening(currentStep.field)}
              className="ml-2 bg-purple-500 text-white px-3 py-2 rounded-full hover:bg-purple-600"
            >
              🎙️
            </button>
          </div>
        )}

        {/* Aadhaar OCR */}
        {currentStep?.type === "file" && currentStep.field === "aadhaar" && (
          <div className="flex flex-col mb-4">
            <OCRInput
              label={langChoice === "tamil" ? "ஆதார் அட்டையை பதிவேற்றவும்" : "Upload Aadhaar"}
              onResult={handleOcrResult}
            />
            <div className="flex items-center mt-2 space-x-2">
              <button
                onClick={handleSampleUpload}
                className="bg-purple-600 text-white py-2 px-4 rounded"
              >
                📂 Upload Sample Aadhaar
              </button>
              <button
                onClick={() => window.open("/sample_aadhaar.jpeg", "_blank")}
                className="bg-gray-600 text-white py-2 px-4 rounded"
              >
                👁️ View Sample
              </button>
            </div>
            {ocrMessage && <p className="text-sm mt-2 text-gray-600">{ocrMessage}</p>}
            {formData.aadhaar && (
              <p className="font-bold text-green-600 mt-2">Aadhaar: {formData.aadhaar}</p>
            )}
          </div>
        )}

        {/* Other File Uploads */}
        {currentStep?.type === "file" && currentStep.field !== "aadhaar" && (
          <div className="flex flex-col mb-4">
            <input type="file" onChange={handleFileChange} />
          </div>
        )}

        {/* Review Step */}
        {currentStep?.type === "review" && (
          <div className="mb-4 text-left">
            <form className="space-y-3">
              {Object.entries(formData).map(([k, v]) => (
                <div key={k}>
                  <label className="font-semibold block mb-1">{k}</label>
                  <input
                    type="text"
                    value={v || ""}
                    onChange={(e) => setFormData({ ...formData, [k]: e.target.value })}
                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              ))}
            </form>
            <p className="mt-3 text-gray-600">
              {langChoice === "tamil" ? "உறுதிப்படுத்துகிறீர்களா?" : "Do you confirm?"}
            </p>
          </div>
        )}

        {/* Eligibility Step */}
        {currentStep?.type === "eligibility" && eligibility && (
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

        {/* Navigation Buttons */}
        {step < steps.length ? (
          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="bg-purple-500 text-white py-2 px-6 rounded-full hover:bg-purple-600 disabled:opacity-50"
            >
              {langChoice === "tamil" ? "⬅ முந்தையது" : "⬅ Back"}
            </button>
            <button
              onClick={handleNext}
              className="bg-purple-500 text-white py-2 px-6 rounded-full hover:bg-purple-600"
            >
              {langChoice === "tamil" ? "அடுத்து ➡" : "Next ➡"}
            </button>
          </div>
        ) : (
          <div className="text-center mt-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800">
              {langChoice === "tamil" ? "பயனர் ஐடி உருவாக்கப்பட்டது" : "User ID Created"}
            </h3>
            <p className="mb-4 text-lg text-purple-600 font-semibold">{userId}</p>
            <button
              onClick={() => router.push("/home")}
              className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700"
            >
              {langChoice === "tamil" ? "🏠 முகப்பு பக்கத்திற்குச் செல்லவும்" : "🏠 Back to Home"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
