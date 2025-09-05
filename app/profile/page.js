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

  // Steps
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
  ];

  const steps = langChoice === "tamil" ? stepsTamil : stepsEnglish;
  const currentStep = steps[step] || null;

  // Detect language
  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);
  }, []);

  // Speech
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

  // Voice Recognition
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

  // Hybrid OCR (Vision API first, fallback to Tesseract)
  const handleSampleUpload = async () => {
    try {
      setOcrMessage("🔎 Scanning sample Aadhaar...");
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "/sample_aadhaar.jpeg" }),
      });

      if (!res.ok) throw new Error("Vision API failed");

      const data = await res.json();
      if (data.text) {
        handleOcrResult(data.text);
        return;
      }
      throw new Error("Empty response");
    } catch (err) {
      // 🔄 Fallback to Tesseract
      const { data: { text } } = await Tesseract.recognize("/sample_aadhaar.jpeg", "eng", {
        tessedit_char_whitelist: "0123456789",
      });
      handleOcrResult(text);
    }
  };

  // File Upload (non-Aadhaar)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [currentStep.field]: file?.name });
  };

  // Navigation
  const handleNext = () => {
    if (step < steps.length - 1) {
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
        <h2 className="text-xl font-bold mb-6">
          {langChoice === "tamil" ? "சுயவிவர உருவாக்கம்" : "Profile Creation"}
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

            {/* Aadhaar OCR */}
            {currentStep.type === "file" && currentStep.field === "aadhaar" ? (
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
                {ocrMessage && <p className="text-sm mt-2">{ocrMessage}</p>}
                {formData.aadhaar && (
                  <p className="font-bold text-green-600 mt-2">Aadhaar: {formData.aadhaar}</p>
                )}
              </div>
            ) : currentStep.type === "file" ? (
              <div className="flex flex-col mb-4">
                <input type="file" onChange={handleFileChange} />
              </div>
            ) : null}

            {/* Review step */}
            {currentStep.type === "review" && (
              <div className="mb-4 text-left">
                <form>
                  {Object.entries(formData).map(([k, v]) => (
                    <div key={k} className="mb-2">
                      <label className="font-semibold block">{k}</label>
                      <input
                        type="text"
                        value={v || ""}
                        onChange={(e) => setFormData({ ...formData, [k]: e.target.value })}
                        className="border p-1 w-full rounded"
                      />
                    </div>
                  ))}
                </form>
                <p className="mt-2">{langChoice === "tamil" ? "உறுதிப்படுத்துகிறீர்களா?" : "Do you confirm?"}</p>
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
              {langChoice === "tamil" ? "பயனர் ஐடி உருவாக்கப்பட்டது" : "User ID Created"}
            </h3>
            <p>{userId}</p>
            <button onClick={() => router.push("/studentloan")}>
              {langChoice === "tamil" ? "மாணவர் கடன் விண்ணப்பிக்கவும்" : "Apply Student Loan"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
