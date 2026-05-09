import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { BillingSettings } from "@/components/BillingSettings";

const demoCurrentPeriodEnd = "2026-06-08T00:00:00.000Z";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Settings</h1>
        
        <BillingSettings 
          planId="demo" 
          status="trialing" 
          cancelAtPeriodEnd={false} 
          currentPeriodEnd={demoCurrentPeriodEnd} 
          maxFamilyMembers={3} 
          currentFamilyMembers={1} 
        />
        
      </main>
      <Footer />
    </div>
  );
}
