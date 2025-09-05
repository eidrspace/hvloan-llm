import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// ✅ Set credentials from your saved vision-key.json
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), "vision-key.json");

export async function POST(req) {
  try {
    const { filePath } = await req.json();

    // 🔒 Validate
    if (!filePath) {
      return NextResponse.json({ error: "No filePath provided" }, { status: 400 });
    }

    // ✅ If file in public folder → create absolute path
    const absolutePath = path.join(process.cwd(), "public", filePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    // ✅ Init Google Vision
    const client = new vision.ImageAnnotatorClient();

    // OCR the Aadhaar sample
    const [result] = await client.textDetection(absolutePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json({ error: "No text detected" }, { status: 404 });
    }

    // ✅ Extract the full detected text
    const fullText = detections[0].description;

    // Return only numbers (Aadhaar style)
    const digits = fullText.replace(/\D/g, "");
    const match = digits.match(/\d{12}/);
    const aadhaarNum = match ? match[0].replace(/(\d{4})(?=\d)/g, "$1 ").trim() : "";

    return NextResponse.json({
      text: fullText,
      aadhaar: aadhaarNum,
    });
  } catch (err) {
    console.error("OCR API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
