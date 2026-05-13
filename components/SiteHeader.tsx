"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@/app/user-data";
import { SignOutButton } from "@/components/SignOutButton";
import { getSupabaseClient } from "@/lib/supabase/client";

type SiteHeaderProps = {
  user?: User | null;
};

type HeaderUser = Pick<User, "id" | "name" | "email" | "platformRole">;

const loggedOutLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
];

const baseLoggedInLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/account", label: "Account" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
  { href: "/support", label: "Support" },
];

export function SiteHeader({ user = null }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resolvedUser, setResolvedUser] = useState<HeaderUser | null>(user);
  const [authChecked, setAuthChecked] = useState(Boolean(user));
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (user) {
      return;
    }

    let active = true;
    const supabase = getSupabaseClient();
    if (!supabase) {
      queueMicrotask(() => {
        if (active) setAuthChecked(true);
      });
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active) return;
        setResolvedUser(
          data.user
            ? {
                id: data.user.id,
                name: data.user.user_metadata?.full_name || data.user.email,
                email: data.user.email,
              }
            : null,
        );
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setResolvedUser(
        session?.user
          ? {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email,
              email: session.user.email,
            }
          : null,
      );
      setAuthChecked(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [user]);

  const links = resolvedUser
    ? [
        ...baseLoggedInLinks,
        ...(resolvedUser.platformRole === "founder" || resolvedUser.platformRole === "admin"
          ? [{ href: "/admin", label: "Admin" }]
          : []),
      ]
    : authChecked
      ? loggedOutLinks
      : [];

  return (
    <header
      className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]"
      style={{
        background: "rgba(250, 247, 243, 0.94)",
        backdropFilter: "blur(22px) saturate(1.4)",
        borderBottom: "1px solid rgba(23,19,38,0.1)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-8">
        <Link
          href={resolvedUser ? "/dashboard" : "/"}
          className="flex min-w-0 shrink items-center gap-2 text-lg font-bold tracking-tight transition-colors hover:opacity-80 sm:gap-3 sm:text-xl"
          style={{ color: "var(--text)" }}
        >
          {!logoError ? (
            <div className="relative h-8 w-28 max-w-[45vw] sm:h-9 sm:w-36">
              <Image
                src="/brand/logos/circlerelay-logo-horizontal.png"
                alt="CircleRelay"
                fill
                className="object-contain object-left"
                onError={() => setLogoError(true)}
                priority
              />
            </div>
          ) : (
            <span className="flex items-center gap-1 font-extrabold tracking-tight">
              <span style={{ color: "#171326" }}>Circle</span>
              <span style={{ color: "#F23A3A" }}>Relay</span>
            </span>
          )}
        </Link>

        <nav className="hidden min-w-0 items-center justify-end gap-1 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tap-target flex shrink-0 items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-white/70"
              style={{ color: "var(--text-muted)" }}
            >
              {link.label}
            </Link>
          ))}
          {resolvedUser ? <SignOutButton /> : null}
        </nav>

        <button
          type="button"
          className="tap-target inline-flex shrink-0 items-center justify-center rounded-2xl border px-3 text-sm font-bold md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setMenuOpen((open) => !open)}
          style={{ borderColor: "var(--border)", color: "var(--text)", background: "rgba(255,255,255,0.72)" }}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-site-menu" className="border-t px-3 pb-4 md:hidden" style={{ borderColor: "var(--border)" }}>
          <nav className="mx-auto flex max-w-6xl flex-col gap-2 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="tap-target flex w-full items-center rounded-2xl px-4 py-3 text-sm font-semibold"
                onClick={() => setMenuOpen(false)}
                style={{ background: "rgba(255,255,255,0.72)", color: "var(--text)" }}
              >
                {link.label}
              </Link>
            ))}
            {resolvedUser && (
              <SignOutButton className="tap-target flex w-full items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60" />
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
