"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";

export default function FoundPage() {
  const [form, setForm] = useState({
    category: "",
    location: "",
    description: "",
  });

  const router = useRouter();
  const [imageBase64, setImageBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Max size is 2MB.",{autoClose:1500,pauseOnHover:false});
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageBase64 }),
      });

      if (!res.ok) throw new Error();

      toast.success("Found item reported. Matching in progress.",{autoClose:1500,pauseOnHover:false});

      setForm({ category: "", location: "", description: "" });
      setImageBase64("");
      setFileName("");

      setTimeout(() => router.push("/"), 1200);
    } catch {
      toast.error("Something went wrong. Please try again.",{autoClose:1500,pauseOnHover:false});
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <section className="px-8 pt-14">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
            Report Found Item
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Share details of an item you found so it can be safely returned.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 p-10"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Category
              </label>
              <input
                required
                value={form.category}
                className="
                  w-full rounded-md text-gray-500 border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                "
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Location Found
              </label>
              <input
                required
                value={form.location}
                className="
                  w-full rounded-md text-gray-500 border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                "
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                className="
                  w-full rounded-md border text-gray-500 border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                "
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* File upload */}
            <div className="md:col-span-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="
                    px-4 py-2 rounded-md border border-gray-300
                    text-sm text-gray-800 hover:bg-gray-100 transition
                  "
                >
                  Upload Image
                </button>

                <span className="text-sm text-gray-500 truncate">
                  {fileName || "No file selected"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="md:col-span-2 flex justify-end pt-6 border-t border-gray-200">
              <button
                disabled={loading}
                className="
                  bg-gray-900 text-white px-8 py-3 rounded-md text-sm font-medium
                  flex items-center gap-2 hover:bg-gray-800 transition
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <ClipLoader size={16} color="#fff" />
                    Submitting…
                  </>
                ) : (
                  "Submit Found Item"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
