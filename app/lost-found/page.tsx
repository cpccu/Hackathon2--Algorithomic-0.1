"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SearchX,
  Search,
  PlusCircle,
  FileText,
  Filter,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Inbox,
} from "lucide-react";
import { ItemCard, LostFoundItemData } from "@/components/lost-found/item-card";
import { ItemDetailModal } from "@/components/lost-found/item-detail-modal";

const CATEGORIES = [
  "ALL",
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

function LostFoundContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");

  const [items, setItems] = React.useState<LostFoundItemData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [selectedItem, setSelectedItem] = React.useState<LostFoundItemData | null>(null);

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`/api/lost-found?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);

        if (highlightId && data.items) {
          const matched = data.items.find((i: LostFoundItemData) => i.id === highlightId);
          if (matched) setSelectedItem(matched);
        }
      }
    } catch (err) {
      console.error("Failed to load Lost & Found items", err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, categoryFilter, statusFilter, highlightId]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SearchX className="w-4 h-4 text-amber-500" />
              Lost & Found
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              City University Student Support & Property Recovery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lost-found/my"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5" />
            My Reports & Claims
          </Link>
          <Link
            href="/lost-found/report-lost"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
          >
            Report Lost
          </Link>
          <Link
            href="/lost-found/report-found"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
          >
            Report Found
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-slate-50 border border-amber-200/60 rounded-3xl p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Campus Property Registry
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Help return what belongs to someone.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Report misplaced personal items or browse recovered items waiting to be reclaimed.
              Every report is verified by CampusOS Administration.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search lost or found items (backpack, umbrella, student ID)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
              {["ALL", "LOST", "FOUND"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    typeFilter === t
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Status Filter Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 font-medium mr-1">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  categoryFilter === cat
                    ? "bg-amber-100 text-amber-900 font-semibold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p className="text-xs text-slate-500">Loading verified campus items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {search.trim() || typeFilter !== "ALL" || categoryFilter !== "ALL"
                ? "No matching items found."
                : "No verified items reported yet."}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Misplaced something or found an item on campus? Help your fellow students by submitting a report.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/lost-found/report-lost"
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-xl transition"
              >
                Report Lost Item
              </Link>
              <Link
                href="/lost-found/report-found"
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-xl transition"
              >
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onSelect={(i) => setSelectedItem(i)} />
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onItemUpdated={fetchItems}
        />
      )}
    </div>
  );
}

export default function LostFoundPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-3" />
          <p className="text-xs text-slate-500">Loading Campus Recovery Hub...</p>
        </div>
      }
    >
      <LostFoundContent />
    </React.Suspense>
  );
}
