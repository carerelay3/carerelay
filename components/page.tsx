"use client";
import { useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { trackEvent } from "@/lib/analytics/track";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function SignUpPage() {
  useEffect(() => { trackEvent("signup_started"); }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 py-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm w-full">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Create an Account</h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 font-medium">
            Demo Mode Fallback Active. Supabase authentication is not fully wired for production yet. Click below to proceed to setup.
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/setup'; }}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" placeholder="you@example.com" className="w-full p-3 border border-slate-300 rounded-xl outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-300 rounded-xl outline-none" required />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
              Start Setup (Demo Mode)
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link href="/sign-in" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400 space-x-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>

        <div className="mt-12">
          <DisclaimerBanner compact />
        </div>
      </main>
    </div>
  );
}