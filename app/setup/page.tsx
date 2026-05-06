import { CareCircleSetupForm } from "@/components/CareCircleSetupForm";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function SetupPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Set up your care circle</h1>
      <CareCircleSetupForm />
      <DisclaimerBanner compact />
    </main>
  );
}
