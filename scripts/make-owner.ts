import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";

export type MakeOwnerArgs = {
  email: string;
  careCircleId: string;
  platformFounder: boolean;
};

export function parseMakeOwnerArgs(argv: string[]): MakeOwnerArgs {
  const args = new Map<string, string | boolean>();
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, true);
    } else {
      args.set(key, next);
      index += 1;
    }
  }

  const email = args.get("email");
  const careCircleId = args.get("care-circle-id");
  const platformFounder = args.get("platform-founder");

  if (typeof email !== "string" || !email.includes("@")) {
    throw new Error('Missing required --email "founder@email.com"');
  }
  if (typeof careCircleId !== "string" || careCircleId.length < 8) {
    throw new Error('Missing required --care-circle-id "..."');
  }

  return {
    email,
    careCircleId,
    platformFounder: platformFounder === true || platformFounder === "true",
  };
}

type AuthUserRecord = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

type AuthListClient = {
  auth: {
    admin: {
      listUsers: (args: { page: number; perPage: number }) => Promise<{
        data: { users: AuthUserRecord[] };
        error: { message: string } | null;
      }>;
    };
  };
};

async function findUserByEmail(supabase: AuthListClient, email: string) {
  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Could not list auth users: ${error.message}`);
    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

export async function runMakeOwner(argv = process.argv.slice(2)) {
  const parsed = parseMakeOwnerArgs(argv);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const user = await findUserByEmail(supabase, parsed.email);
  if (!user?.id) {
    throw new Error(`No auth user found for ${parsed.email}`);
  }

  const now = new Date().toISOString();
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      ...(parsed.platformFounder ? { platform_role: "founder" } : {}),
      updated_at: now,
    }, { onConflict: "id" });

  if (profileError) throw new Error(`Could not upsert profile: ${profileError.message}`);

  const { error: circleError } = await supabase
    .from("care_circles")
    .update({ owner_id: user.id, updated_at: now })
    .eq("id", parsed.careCircleId);

  if (circleError) throw new Error(`Could not update care circle owner: ${circleError.message}`);

  const { data: existingMember } = await supabase
    .from("family_members")
    .select("id")
    .eq("care_circle_id", parsed.careCircleId)
    .eq("user_id", user.id)
    .maybeSingle();

  const ownerMembership = {
    care_circle_id: parsed.careCircleId,
    user_id: user.id,
    name: user.user_metadata?.full_name || user.email || "Owner",
    email: user.email || null,
    role: "owner",
    status: "active",
    invite_status: "joined",
    permission_level: "admin",
    updated_at: now,
  };

  const { error: memberError } = existingMember?.id
    ? await supabase.from("family_members").update(ownerMembership).eq("id", existingMember.id)
    : await supabase.from("family_members").insert(ownerMembership);

  if (memberError) throw new Error(`Could not update owner membership: ${memberError.message}`);

  console.log("CareRelay owner update complete.");
  console.log(`User: ${user.email || parsed.email}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Care circle ID: ${parsed.careCircleId}`);
  console.log(`Platform founder requested: ${parsed.platformFounder ? "yes" : "no"}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMakeOwner().catch((error) => {
    console.error(error instanceof Error ? error.message : "make-owner failed");
    process.exitCode = 1;
  });
}
