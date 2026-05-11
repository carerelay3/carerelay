"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Circle = {
  id: string;
  name: string;
};

type CareCircleSwitcherProps = {
  circles: Circle[];
  selectedCareCircleId?: string;
};

export function CareCircleSwitcher({ circles, selectedCareCircleId }: CareCircleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (circles.length <= 1) return null;

  function switchCircle(careCircleId: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("careCircleId", careCircleId);
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  return (
    <label className="flex w-full min-w-0 flex-col gap-2 text-xs font-semibold uppercase tracking-wider sm:w-auto" style={{ color: "var(--text-subtle)" }}>
      Care circle switcher
      <select
        value={selectedCareCircleId || ""}
        onChange={(event) => switchCircle(event.target.value)}
        className="min-h-12 w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm font-semibold normal-case tracking-normal sm:w-auto"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
        aria-label="Selected care circle"
      >
        {circles.map((circle) => (
          <option key={circle.id} value={circle.id}>
            {circle.name}
          </option>
        ))}
      </select>
    </label>
  );
}
