"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoanHistoryPage() {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("loanHistory") || "[]");
    setHistory(stored);
  }, []);

  return (
    <div className="app-container">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Loan History</h2>

        {history.length === 0 ? (
          <p>No loan applications yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((loan, idx) => (
              <div
                key={idx}
                className="p-4 rounded shadow border border-gray-200 bg-gray-50"
              >
                <p>
                  <strong>Loan ID:</strong> {loan.id}
                </p>
                <p>
                  <strong>Date:</strong> {loan.date}
                </p>
                <p>
                  <strong>Location:</strong> {loan.location || "N/A"}
                </p>

                <div className="mt-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      loan.status === "approved"
                        ? "bg-green-200 text-green-800"
                        : loan.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-2 rounded mt-3">
                  <div
                    className={`h-2 rounded ${
                      loan.status === "approved"
                        ? "bg-green-500 w-full"
                        : loan.status === "pending"
                        ? "bg-yellow-500 w-2/3"
                        : "bg-red-500 w-1/3"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Home Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/home")}
            className="bg-blue-600 text-white py-2 px-6 rounded shadow hover:bg-blue-700 transition"
          >
            ⬅ Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
