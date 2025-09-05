"use client";
import { useState, useEffect } from "react";

export default function VoiceAssistant({ steps, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [voices, setVoices] = useState([]);
  const currentStep = steps[stepIndex];

  // Which language user selected
  const langChoice =
    typeof window !== "undefined" && localStorage.getItem("lang") === "tamil"
      ? "ta-IN"
      : "en-IN";

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Pick best voice with fallback
  const getVoice = (lang) => {
    if (!voices.length) return null;

    // Exact match
    let match = voices.find((v) => v.lang === lang);
    if (match) return match;

    // If Tamil missing → fallback to English
    if (lang === "ta-IN") {
      return voices.find((v) => v.lang.startsWith("en")) || voices[0];
    }

    return voices[0];
  };

  // 🔊 Speak current question
  useEffect(() => {
    if (currentStep) {
      const utterance = new SpeechSynthesisUtterance(currentStep.label);
      utterance.lang = langChoice;
      utterance.voice = getVoice(langChoice);
      window.speechSynthesis.cancel(); // stop overlapping speech
      window.speechSynthesis.speak(utterance);
    }
  }, [stepIndex, currentStep, langChoice, voices]);

  // 🎤 Listen for voice input
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = langChoice; // listens in Tamil or English
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const updated = { ...responses, [currentStep.field]: transcript };
      setResponses(updated);

      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        onComplete(updated);

        const done = new SpeechSynthesisUtterance(
          langChoice === "ta-IN"
            ? "உங்கள் சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது"
            : "Your profile has been saved successfully"
        );
        done.lang = langChoice;
        done.voice = getVoice(langChoice);
        window.speechSynthesis.speak(done);
      }
    };
  };

  return (
    <div className="p-4 border rounded bg-white mb-4">
      <h3 className="font-semibold mb-2">{currentStep?.label}</h3>
      <div className="flex space-x-2 justify-center">
        <button onClick={startListening}>🎤 Speak</button>
        <button
          onClick={() => setStepIndex(stepIndex + 1)}
          className="bg-gray-500 hover:bg-gray-600"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
