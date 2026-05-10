import { NextResponse } from "next/server";
import { inviteMember, addMember } from "@/lib/demo/data";
import { inviteMemberSchema, addMemberSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!appConfig.demoMode) {
    return NextResponse.json({ error: "Live member invites must be sent from care circle setup/settings after authenticated membership is connected." }, { status: 501 });
  }

  // Invite existing member
  const inviteParsed = inviteMemberSchema.safeParse(body);
  if (inviteParsed.success) {
    const snapshot = inviteMember(inviteParsed.data.memberId);
    if (!snapshot) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  }

  // Add new member
  const addParsed = addMemberSchema.safeParse(body);
  if (addParsed.success) {
    const snapshot = addMember(addParsed.data);
    return NextResponse.json({ snapshot });
  }

  return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
}
