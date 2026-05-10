import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

const sessionSchema = z.object({
  accessToken: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid session token is required." }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.getUser(parsed.data.accessToken);
  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("sb-access-token", parsed.data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("sb-access-token");
  return response;
}
