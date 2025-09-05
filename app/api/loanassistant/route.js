import * as tf from "@tensorflow/tfjs";
import { NextResponse } from "next/server";

/**
 * Simple AI/ML model for loan eligibility
 * Input: [income, loanAmount]
 * Output: 1 = approved, 0 = rejected
 */
async function trainModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, activation: "relu", inputShape: [2] }));
  model.add(tf.layers.dense({ units: 4, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({ optimizer: "adam", loss: "binaryCrossentropy", metrics: ["accuracy"] });

  // Dummy training data
  const xs = tf.tensor2d([
    [10000, 50000],  // income 10k, loan 50k → eligible
    [15000, 100000], // income 15k, loan 100k → eligible
    [2000, 80000],   // income 2k, loan 80k → not eligible
    [5000, 20000],   // income 5k, loan 20k → eligible
    [4000, 90000],   // income 4k, loan 90k → not eligible
  ]);
  const ys = tf.tensor2d([[1], [1], [0], [1], [0]]); // labels

  await model.fit(xs, ys, { epochs: 50, verbose: 0 });

  return model;
}

let cachedModel = null;

export async function POST(req) {
  try {
    const body = await req.json();
    const { income, loanAmount, lang = "english" } = body;

    if (!income || !loanAmount) {
      return NextResponse.json(
        { reply: "Please provide both income and loan amount." },
        { status: 400 }
      );
    }

    // Train model once and reuse
    if (!cachedModel) {
      cachedModel = await trainModel();
    }

    const input = tf.tensor2d([[parseFloat(income), parseFloat(loanAmount)]]);
    const prediction = cachedModel.predict(input);
    const result = (await prediction.data())[0];

    let reply;
    if (result > 0.6) {
      reply =
        lang === "tamil"
          ? "✅ நீங்கள் தகுதியானவர், ஏனெனில் உங்கள் வருமானத்தின் அடிப்படையில் உங்கள் கடன் திருப்பிச் செலுத்தக்கூடியது."
          : "✅ You are eligible because your loan is reasonable compared to your income.";
    } else {
      reply =
        lang === "tamil"
          ? "❌ நீங்கள் தகுதியற்றவர், ஏனெனில் உங்கள் வருமானத்தை விட கடன் தொகை மிகவும் அதிகமாக உள்ளது."
          : "❌ You are not eligible because your loan amount is too high compared to your income.";
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("LoanAssistant API error:", err);
    return NextResponse.json(
      { reply: "⚠ Sorry, something went wrong in eligibility check." },
      { status: 500 }
    );
  }
}
