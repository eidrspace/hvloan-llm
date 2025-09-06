"use client";
import { useState, useEffect } from "react";

export default function LoanAssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [langChoice, setLangChoice] = useState("english");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lang = localStorage.getItem("lang") || "english";
    setLangChoice(lang);

    // Initial greeting
    const greeting =
      lang === "tamil"
        ? "வணக்கம், இன்று உங்களுக்கு எப்படித் உதவலாம்?"
        : "Hi, how can I help you today?";
    setMessages([{ role: "assistant", content: greeting }]);
    speakText(greeting, lang);
  }, []);

  // ✅ Voice output
  const speakText = (text, lang) => {
    if (typeof window === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (lang === "tamil") {
      const ta = voices.find((v) => v.lang.toLowerCase().includes("ta"));
      if (ta) utterance.voice = ta;
    } else {
      const en = voices.find((v) => v.lang.toLowerCase().includes("en"));
      if (en) utterance.voice = en;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // ✅ Send query to backend
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/loanassistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, lang: langChoice }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        (langChoice === "tamil"
          ? "மன்னிக்கவும், உங்களுக்கு உதவ முடியவில்லை."
          : "Sorry, I couldn’t process that.");

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speakText(reply, langChoice);
    } catch (err) {
      console.error(err);
    }

    setInput("");
    setLoading(false);
  };

  // ✅ Voice recognition for mic input
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = langChoice === "tamil" ? "ta-IN" : "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setInput(spoken);
    };
  };

  if (!mounted) return null;

  const suggestions =
    langChoice === "tamil"
      ? ["நான் கடனுக்கு தகுதியானவரா?", "எந்த ஆவணங்கள் தேவை?", "என் கடன் வரலாறு என்ன?"]
      : ["Am I eligible for a loan?", "What documents are required?", "Show my loan history"];

  return (
    <div className="app-container flex flex-col h-screen">
      <div className="card flex flex-col flex-grow p-4">
        {/* Header with speaker button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-center flex-1">
            {langChoice === "tamil" ? "கடன் உதவியாளர்" : "Loan Assistant"}
          </h2>
          <button
            onClick={() =>
              speakText(
                langChoice === "tamil"
                  ? "வணக்கம், இன்று உங்களுக்கு எப்படித் உதவலாம்?"
                  : "Hi, how can I help you today?",
                langChoice
              )
            }
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 ml-2"
          >
            🔊
          </button>
        </div>

        {/* Chat Window */}
        <div className="flex-grow overflow-y-auto mb-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg max-w-xs ${
                msg.role === "user"
                  ? "ml-auto bg-purple-200"
                  : "mr-auto bg-gray-200"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input box with mic + send */}
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              langChoice === "tamil"
                ? "உங்கள் கேள்வியை தட்டச்சு செய்யவும்..."
                : "Type your question..."
            }
            className="flex-grow border rounded p-2"
          />
          <button
            onClick={startListening}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
          >
            🎙️
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="ml-2 bg-purple-600 text-white px-4 py-2 rounded"
          >
            {loading ? "..." : langChoice === "tamil" ? "அனுப்பு" : "Send"}
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
