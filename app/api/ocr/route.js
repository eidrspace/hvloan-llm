import vision from "@google-cloud/vision";
import path from "path";

// ✅ Path to your Google service account key
const keyPath = path.join(process.cwd(), "google-credentials.json");

// ✅ Initialize Vision client
const client = new vision.ImageAnnotatorClient({ keyFilename: keyPath });

export async function POST(req) {
  try {
    const body = await req.json();
    const { imagePath } = body;

    if (!imagePath) {
      return new Response(JSON.stringify({ success: false, error: "No image path provided" }), { status: 400 });
    }

    // 👁️ Detect text from image
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No text detected" }), { status: 200 });
    }

    // ✅ Extract Aadhaar (12 digits only)
    const fullText = detections[0].description;
    const digits = fullText.replace(/\D/g, "");
    const match = digits.match(/\d{12}/);
    const aadhaar = match ? match[0].replace(/(\d{4})(?=\d)/g, "$1 ").trim() : "";

    return new Response(
      JSON.stringify({
        success: true,
        text: aadhaar || fullText.trim(),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("OCR API Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
