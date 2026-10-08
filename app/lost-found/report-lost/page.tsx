"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Send, SearchX, ShieldCheck } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Documents",
  "ID / Card",
  "Keys",
  "Bag",
  "Clothing",
  "Accessories",
  "Books",
  "Other",
];

export default function ReportLostPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("Electronics");
  const [location, setLocation] = React.useState("");
  const [dateOccurred, setDateOccurred] = React.useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [contactPreference, setContactPreference] = React.useState("CAMPUSOS_IN_APP");

  const [submitting, setSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !location || !dateOccurred) {
      setStatusMessage({ type: "error", text: "Please complete all required fields." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LOST",
          title,
          category,
          location,
          dateOccurred,
          description,
          imageUrl: imageUrl || null,
          contactPreference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit lost item report.");
      }

      setStatusMessage({
        type: "success",
        text: "Lost item report submitted. Your report is awaiting moderation by CampusOS Administration.",
      });
      setTimeout(() => {
        router.push("/lost-found/my");
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to submit report." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/lost-found"
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg transition"
            title="Back to Lost & Found"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Report a Lost Item</h1>
            <p className="text-[11px] text-slate-400">CampusOS Community Support</p>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider mb-2">
              Lost Item Report
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Misplaced something on campus?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Provide details about where and when you last saw your belonging.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Black Dell Laptop Charger, Blue Scientific Calculator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date Lost *
                </label>
                <input
                  type="date"
                  required
                  value={dateOccurred}
                  onChange={(e) => setDateOccurred(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Last Seen Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Central Library 2nd Floor, Room 402 Main Academic Bldg, Cafeteria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description & Distinguishing Marks *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe brand, color, stickers, scratches, case type, or unique contents that can verify your ownership..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional Reference Image URL
              </label>
              <input
                type="url"
                placeholder="https://... (Optional link to photo of similar item or serial number receipt)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Zero-Spam Contact Guarantee:</strong> Your email and phone will never be publicly listed.
                When someone finds your item, claims and handovers are managed through CampusOS.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link
                href="/lost-found"
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {submitting ? "Submitting Report..." : "Submit Lost Item Report"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
