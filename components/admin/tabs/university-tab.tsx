"use client";

import { useState, useEffect } from "react";
import { Landmark, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface UniversityProfile {
  id?: string;
  name: string;
  shortName: string | null;
  code: string | null;
  establishedYear: number | null;
  campusAddress: string | null;
  city: string | null;
  country: string | null;
  websiteUrl: string | null;
  primaryEmail: string | null;
  admissionEmail: string | null;
  primaryPhone: string | null;
  admissionPhone: string | null;
  emergencyPhone: string | null;
  status: string;
  source: string;
}

export function UniversityTab() {
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/university");
      if (res.ok) {
        const data = await res.json();
        setProfile(
          data.profile || {
            name: "City University",
            shortName: "CU",
            code: "CU-BD",
            establishedYear: 2002,
            campusAddress: "Birulia, Savar, Dhaka-1216",
            city: "Dhaka",
            country: "Bangladesh",
            websiteUrl: "https://cityuniversity.edu.bd",
            primaryEmail: "info@cityuniversity.edu.bd",
            admissionEmail: "admission@cityuniversity.edu.bd",
            primaryPhone: "+880-2-9020142",
            admissionPhone: "+880-1819818266",
            emergencyPhone: "+880-1819818267",
            status: "VERIFIED",
            source: "OFFICIAL_CATALOG",
          }
        );
      }
    } catch (err) {
      console.error("Failed to load university profile", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.name) {
      setStatusMessage({ type: "error", text: "University Name is required." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/university", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setProfile(data.profile);
      setStatusMessage({ type: "success", text: "Institutional profile updated successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading institutional profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Profile</h2>
          <p className="text-sm text-slate-500">
            Authoritative university master record for City University, Bangladesh
          </p>
        </div>
        <button
          onClick={fetchProfile}
          className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          title="Reload"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2 text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Landmark className="w-4 h-4 text-indigo-600" />
            General Information
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Primary legal identity and institutional identifiers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">University Name *</label>
            <input
              type="text"
              required
              value={profile?.name || ""}
              onChange={(e) => setProfile({ ...profile!, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Name / Abbr</label>
            <input
              type="text"
              value={profile?.shortName || ""}
              onChange={(e) => setProfile({ ...profile!, shortName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Code</label>
            <input
              type="text"
              value={profile?.code || ""}
              onChange={(e) => setProfile({ ...profile!, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Established Year</label>
            <input
              type="number"
              value={profile?.establishedYear || ""}
              onChange={(e) => setProfile({ ...profile!, establishedYear: Number(e.target.value) || null })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
            <input
              type="url"
              value={profile?.websiteUrl || ""}
              onChange={(e) => setProfile({ ...profile!, websiteUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="border-b border-slate-100 pb-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            Address & Campus Location
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Physical campus grounds and geographic location</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Campus Address</label>
            <input
              type="text"
              value={profile?.campusAddress || ""}
              onChange={(e) => setProfile({ ...profile!, campusAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City / Country</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                value={profile?.city || ""}
                onChange={(e) => setProfile({ ...profile!, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Country"
                value={profile?.country || ""}
                onChange={(e) => setProfile({ ...profile!, country: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 pb-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            Contact Numbers & Email Desks
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Primary communication channels used by Helpdesk and Search</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">General Office Email</label>
            <input
              type="email"
              value={profile?.primaryEmail || ""}
              onChange={(e) => setProfile({ ...profile!, primaryEmail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Desk Email</label>
            <input
              type="email"
              value={profile?.admissionEmail || ""}
              onChange={(e) => setProfile({ ...profile!, admissionEmail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Telephone</label>
            <input
              type="text"
              value={profile?.primaryPhone || ""}
              onChange={(e) => setProfile({ ...profile!, primaryPhone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Hotline</label>
            <input
              type="text"
              value={profile?.admissionPhone || ""}
              onChange={(e) => setProfile({ ...profile!, admissionPhone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Hotline</label>
            <input
              type="text"
              value={profile?.emergencyPhone || ""}
              onChange={(e) => setProfile({ ...profile!, emergencyPhone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Institutional Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
