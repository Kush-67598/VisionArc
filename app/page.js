"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [recentFound, setRecentFound] = useState([]);

  useEffect(() => {
    fetch("/api/found")
      .then((res) => res.json())
      .then((data) => setRecentFound(data))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center px-6 pt-32 pb-24">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-gray-900">
            Lost Something on Campus?
          </h1>

          <p className="text-gray-600 max-w-xl mb-8">
            Report lost items or upload found ones. Match them and collect safely
            inside campus.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/lost"
              className="bg-black text-white px-6 py-3 rounded-md text-sm hover:opacity-90 transition"
            >
              I Lost an Item
            </a>

            <a
              href="/found"
              className="border border-black-100 text-black bg-white px-6 py-3 rounded-md text-sm hover:bg-gray-50 transition"
            >
              I Found an Item
            </a>

            <a
              href="/matches"
              className="flex items-center gap-2 px-6 py-3 rounded-md text-sm border border-green-200 text-gray-700 hover:bg-green-50 transition"
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Matches
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24">
        <h2 className="text-center text-2xl font-semibold mb-12 text-gray-900">
          How It Works
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Report",
              desc: "Submit details of a lost or found item.",
            },
            {
              title: "Match",
              desc: "Found items are matched with lost reports.",
            },
            {
              title: "Collect",
              desc: "Meet and collect safely inside campus.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-white border rounded-2xl px-12 py-8 border border-black shadow-lg hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECENTLY FOUND */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Recently Found Items
          </h2>

          {recentFound.length === 0 && (
            <p className="text-gray-500 text-sm">No items reported yet.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentFound.map((item) => (
              <div
                key={item._id}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="Found item"
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                )}

                <div className="text-sm">
                  <p className="font-medium capitalize text-gray-900">
                    {item.category}
                  </p>
                  <p className="text-gray-500">
                    Found at {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
