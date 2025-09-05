"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewProfilePage() {
  const [langChoice, setLangChoice] = useState("english");
  const [formData, setFormData] = useState({
    firstName: "",
    fatherName: "",
    incomeType: "",
    income: "",
    aadhaar: "",
    pan: "",
    bankCard: "",
    collateral: "",
  });
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);

    // ✅ Load profile data if available
    const storedForm = localStorage.getItem("formData");
    if (storedForm) {
      setFormData(JSON.parse(storedForm));
    }

    // ✅ Load userId if exists
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
    }
  }, []);

  const handleChange = (e, field) => {
    const updated = { ...formData, [field]: e.target.value };
    setFormData(updated);
    localStorage.setItem("formData", JSON.stringify(updated)); // ✅ Save instantly
  };

  // 🔊 Speak out all profile fields
  const speakProfile = () => {
    let text = "";

    if (langChoice === "tamil") {
      text += `பயனர் ஐடி: ${userId || "வழங்கப்படவில்லை"}. `;
      text += `பெயர்: ${formData.firstName || "வழங்கப்படவில்லை"}. `;
      text += `தந்தையின் பெயர்: ${formData.fatherName || "வழங்கப்படவில்லை"}. `;
      text += `வருமான வகை: ${formData.incomeType || "வழங்கப்படவில்லை"}. `;
      text += `வருமானம்: ${formData.income || "வழங்கப்படவில்லை"}. `;
      text += `ஆதார்: ${formData.aadhaar || "வழங்கப்படவில்லை"}. `;
      text += `பான்: ${formData.pan || "வழங்கப்படவில்லை"}. `;
      text += `வங்கி அட்டை: ${formData.bankCard || "வழங்கப்படவில்லை"}. `;
      text += `உத்தரவாத ஆவணம்: ${formData.collateral || "வழங்கப்படவில்லை"}. `;
    } else {
      text += `User ID: ${userId || "Not provided"}. `;
      text += `First Name: ${formData.firstName || "Not provided"}. `;
      text += `Father Name: ${formData.fatherName || "Not provided"}. `;
      text += `Income Type: ${formData.incomeType || "Not provided"}. `;
      text += `Income: ${formData.income || "Not provided"}. `;
      text += `Aadhaar: ${formData.aadhaar || "Not provided"}. `;
      text += `PAN: ${formData.pan || "Not provided"}. `;
      text += `Bank Card: ${formData.bankCard || "Not provided"}. `;
      text += `Collateral: ${formData.collateral || "Not provided"}. `;
    }

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

  return (
    <div className="app-container flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-lg">
        {/* Header with Speak Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {langChoice === "tamil" ? "சுயவிவரத்தை பார்க்கவும்" : "View Profile"}
          </h1>
          <button
            onClick={speakProfile}
            className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
          >
            🔊 Speak
          </button>
        </div>

        <form className="text-left space-y-4">
          {/* Show User ID */}
          <div>
            <label className="block font-semibold mb-1">
              {langChoice === "tamil" ? "பயனர் ஐடி" : "User ID"}
            </label>
            <input
              type="text"
              value={userId || ""}
              readOnly
              className="w-full border rounded p-2 bg-gray-100 font-bold"
            />
          </div>

          {/* User details */}
          {Object.entries(formData).map(([k, v]) => (
            <div key={k}>
              <label className="block font-semibold mb-1">{k}</label>
              <input
                type="text"
                value={v || ""}
                onChange={(e) => handleChange(e, k)}
                className="w-full border rounded p-2"
              />
            </div>
          ))}
        </form>

        {/* Back to Home button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/home")}
            className="bg-blue-600 text-white py-2 px-6 rounded shadow hover:bg-blue-700 transition"
          >
            ⬅ {langChoice === "tamil" ? "முகப்புக்கு செல்லவும்" : "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
}
