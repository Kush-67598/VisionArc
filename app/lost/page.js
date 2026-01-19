"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const initialForm = {
  name: "",
  category: "",
  location: "",
  dateLost: "",
  color: "",
  description: "",
};

export default function LostPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (loading) return; // 🔒 block double submit

    const cleaned = {
      ...form,
      name: form.name.trim().toLowerCase(),
      category: form.category.trim().toLowerCase(),
      location: form.location.trim().toLowerCase(),
      color: form.color.trim().toLowerCase(),
      description: form.description.trim().toLowerCase(),
    };

    // 🛑 basic validation
    if (!cleaned.name || !cleaned.category || !cleaned.location) {
      toast.error("Please fill all required fields",{autoClose:1500,pauseOnHover:false});
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/lost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });

      if (!res.ok) throw new Error();

      toast.success("Lost item reported successfully",{autoClose:1500,pauseOnHover:false});
      setForm(initialForm);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      toast.error("Something went wrong. Please try again.",{autoClose:1500,pauseOnHover:false});
    } finally {
      setLoading(false); // ✅ always runs
    }
  }

 return (
  <main className="min-h-screen bg-gray-50">
    <ToastContainer position="top-right" autoClose={3000} />

    {/* Header */}
    <section className="px-8 pt-14 ">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
          Report Lost Item
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Add clear details so your item can be matched accurately.
        </p>
      </div>
    </section>

    {/* Form */}
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200">
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 p-10"
        >
          {[
            ["Item Name", "name"],
            ["Category", "category"],
            ["Last Seen Location", "location"],
            ["Color", "color"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                {label}
              </label>
              <input
                required
                value={form[key]}
                className="
                  w-full text-gray-500 rounded-md border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                "
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Date Lost
            </label>
            <input
              type="date"
              required
              value={form.dateLost}
              className="
                w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              "
              onChange={(e) =>
                setForm({ ...form, dateLost: e.target.value })
              }
            />
          </div>

          <div className="hidden md:block" />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              className="
                w-full rounded-md text-gray-500 border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              "
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Footer */}
          <div className="md:col-span-2 flex justify-end pt-6 border-t border-gray-200">
            <button
              disabled={loading}
              className="
                bg-gray-900 text-white px-8 py-3 rounded-md text-sm font-medium
                flex items-center gap-2
                hover:bg-gray-800 transition disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <ClipLoader size={18} color="#fff" />
                  Submitting…
                </>
              ) : (
                "Submit Lost Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>
);


}
