"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function getConfidence(score) {
  if (score >= 80)
    return { label: "High", color: "bg-green-100 text-green-700" };
  if (score >= 60)
    return { label: "Medium", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Low", color: "bg-red-100 text-red-700" };
}
function pretty(text = "") {
  return text
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function MatchesPage() {
  const HomeIcon = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
    </svg>
  );

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Claim dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [proof, setProof] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    } catch {
      toast.error("Failed to load matches", {
        autoClose: 1500,
        pauseOnHover: false,
      });
    } finally {
      setLoading(false);
    }
  }

  function openClaimDialog(matchId) {
    setActiveMatchId(matchId);
    setProof("");
    setShowDialog(true);
  }

  function closeClaimDialog() {
    setShowDialog(false);
    setActiveMatchId(null);
    setProof("");
  }

  async function submitClaim() {
    if (!proof || proof.trim().length < 5) {
      toast.info("Please provide more details", {
        autoClose: 1500,
        pauseOnHover: false,
      });
      return;
    }

    setClaimLoading(true);

    const res = await fetch("/api/matches/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: activeMatchId,
        proof,
      }),
    });

    if (res.status === 401) {
      toast.info("Please sign in with Google to claim this item", {
        autoClose: 1500,
        pauseOnHover: false,
      });

      setTimeout(() => {
        window.location.assign("/api/google/login");
      }, 2000);

      setClaimLoading(false);
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      toast.error(text || "Claim failed", {
        autoClose: 1500,
        pauseOnHover: false,
      });
      setClaimLoading(false);
      return;
    }

    toast.success("Claim submitted successfully", {
      autoClose: 1500,
      pauseOnHover: false,
    });

    setClaimLoading(false);
    closeClaimDialog();
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">
              Possible Matches
            </h1>
            <p className="text-sm text-gray-600">
              Review matched items and claim if you recognize yours.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/")}
            className="mt-1 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
            aria-label="Go to home"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
        </div>

        {loading && <p className="text-gray-500">Loading matches…</p>}

        {!loading && matches.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
            No matches yet. Check back later.
          </div>
        )}

        <div className="space-y-6">
          {matches.map((m) => {
            const confidence = getConfidence(m.score);
            const isAccepted = m.status === "accepted";

            return (
              <div
                key={m._id}
                className={`rounded-2xl p-5 transition ${
                  isAccepted
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-200 hover:shadow-sm"
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {pretty(m.lostItemId.name)}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Lost at {pretty(m.lostItemId.location)}
                    </p>
                  </div>

                  {isAccepted ? (
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-600 text-white">
                      Claimed
                    </span>
                  ) : (
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${confidence.color}`}
                    >
                      {confidence.label} Confidence
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex gap-5">
                  {m.foundItemId.imageUrl && (
                    <img
                      src={m.foundItemId.imageUrl}
                      alt="Found item"
                      className="w-36 h-36 object-cover rounded-xl border border-gray-200 bg-gray-100"
                    />
                  )}

                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {pretty(m.lostItemId.category)}
                    </p>
                    <p>
                      <span className="font-medium">Found at:</span>{" "}
                      {pretty(m.foundItemId.location)}
                    </p>
                    <p className="text-gray-500">Match score: {m.score}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-5 flex justify-end">
                  {m.status === "pending" ? (
                    <button
                      onClick={() => openClaimDialog(m._id)}
                      className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 transition"
                    >
                      This is mine
                    </button>
                  ) : (
                    <div className="text-sm text-green-700 font-medium">
                      ✓ Item successfully claimed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verify ownership
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Describe a detail only the real owner would know.
            </p>

            <textarea
              rows={3}
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="Sticker, scratch, text inside, brand, etc."
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeClaimDialog}
                className="text-sm px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={submitClaim}
                disabled={claimLoading}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-60"
              >
                {claimLoading ? "Submitting…" : "Submit claim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
