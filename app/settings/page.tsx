"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Settings</h1>

      <div className="glass">
        <div className="border-b p-5 sm:p-6" style={{ borderColor: 'var(--glass-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Care Circle Settings</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your care circle preferences and family access
          </p>
        </div>
        <div className="p-5 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Care circle name</label>
            <input
              defaultValue="Linda's Care Circle"
              className="input-glass mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Recipient display name</label>
            <input
              defaultValue="Linda Matthews"
              className="input-glass mt-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Shared CareRelay number</label>
            <input
              defaultValue="+1 (555) 123-0000"
              disabled
              className="input-glass mt-1 w-full"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-subtle)' }}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>Contact support to change your shared number.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Daily summary time</label>
              <input
                type="time"
                defaultValue="18:00"
                className="input-glass mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>Timezone</label>
              <select className="input-glass mt-1 w-full">
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>America/Denver</option>
                <option>America/Los_Angeles</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-sage"
          >
            {saved ? "Saved" : "Save settings"}
          </button>
        </div>
      </div>

      <div className="glass">
        <div className="border-b p-5 sm:p-6" style={{ borderColor: 'var(--glass-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Notification Preferences</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Choose what you want to be notified about</p>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          {[
            { label: "Concern flags", desc: "When a message contains words that may need family attention" },
            { label: "Task assignments", desc: "When someone is assigned a task or a task is completed" },
            { label: "Appointment reminders", desc: "Upcoming appointments and transportation confirmations" },
            { label: "Supply updates", desc: "When supplies are added, purchased, or delivered" },
          ].map((item) => (
            <label key={item.label} className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
              <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4" style={{ accentColor: 'var(--sage)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            </label>
          ))}
          <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
            In demo mode, notifications are preview-only. Connect Twilio for SMS notifications or configure email for real alerts.
          </p>
        </div>
      </div>

      <div className="glass">
        <div className="border-b p-5 sm:p-6" style={{ borderColor: 'var(--glass-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Data Export</h2>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Export your care circle timeline as a family coordination record. This is not a medical record.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard"
              className="btn btn-soft text-sm"
            >
              Go to Dashboard Export
            </a>
          </div>
        </div>
      </div>

      <div className="glass" style={{ border: '1px solid rgba(196,107,107,0.2)' }}>
        <div className="border-b p-5 sm:p-6" style={{ borderColor: 'rgba(196,107,107,0.15)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--error)' }}>Danger Zone</h2>
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Deleting your care circle will remove all messages, tasks, appointments, and settings. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this care circle? This action cannot be undone.")) {
                window.alert("Demo mode: care circle deletion is simulated. In production, this would permanently delete all data.");
              }
            }}
            className="btn text-sm text-white"
            style={{ background: 'var(--error)' }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete care circle
          </button>
        </div>
      </div>

      <DisclaimerBanner />
    </main>
  );
}
