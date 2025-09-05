"use client";
import Tesseract from "tesseract.js";
import { useState } from "react";

export default function OCRInput({ label, onResult }) {
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");
      console.log("Full OCR Text:", text);

      // --- Extract Aadhaar details using regex ---
      let aadhaarNumber = text.match(/\d{4}\s\d{4}\s\d{4}/)?.[0] || "Not Found";
      let nameLine = text.split("\n").find(line => /^[A-Za-z ]{3,}$/.test(line));
      let name = nameLine || "Name Not Found";

      const result = {
        rawText: text.trim(),
        aadhaarNumber,
        name
      };

      setExtracted(result);
      onResult(result);  // Pass result to parent formData
    } catch (err) {
      console.error("OCR error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">{label}</label>
      <input type="file" accept="image/*" onChange={handleFile} className="border p-2 rounded" />
      {loading && <p className="text-sm text-gray-500">📷 Scanning Aadhaar...</p>}

      {extracted && (
        <div className="mt-3 p-2 border rounded bg-green-50 text-sm">
          ✅ OCR Successful! <br />
          <strong>Aadhaar:</strong> {extracted.aadhaarNumber} <br />
          <strong>Name:</strong> {extracted.name}
        </div>
      )}
    </div>
  );
}
