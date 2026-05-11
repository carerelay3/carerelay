"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type Role = "owner" | "admin" | "member";
type Status = "active" | "invited" | "removed";

export type TeamMemberView = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  status: Status;
  userId?: string | null;
};

type TeamManagementProps = {
  careCircleId: string;
  actorRole: Role;
  members: TeamMemberView[];
  maxFamilyMembers: number;
};

type ApiResult = {
  error?: string;
  code?: string;
};

async function postJson(path: string, body: Record<string, unknown>): Promise<ApiResult> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: json.error || "Request could not be completed.", code: json.code };
  }
  return {};
}

function canManage(actorRole: Role, targetRole: Role) {
  if (actorRole === "owner") return true;
  return actorRole === "admin" && targetRole === "member";
}

export function TeamManagement({ careCircleId, actorRole, members, maxFamilyMembers }: TeamManagementProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeMembers = useMemo(() => members.filter((member) => member.status !== "removed"), [members]);
  const canAdd = actorRole === "owner" || actorRole === "admin";
  const canChangeRoles = actorRole === "owner";

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage(null);
    const result = await postJson("/api/team/add", {
      careCircleId,
      name,
      phone,
      email,
      role: actorRole === "owner" ? role : "member",
    });
    setStatus("idle");
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setName("");
    setPhone("");
    setEmail("");
    setRole("member");
    setMessage({ type: "success", text: "Team member added." });
    router.refresh();
  }

  async function removeMember(member: TeamMemberView) {
    if (!window.confirm(`Remove ${member.name} from this care circle?`)) return;
    setStatus("saving");
    setMessage(null);
    const result = await postJson("/api/team/remove", { careCircleId, memberId: member.id });
    setStatus("idle");
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Team member removed." });
    router.refresh();
  }

  async function changeRole(member: TeamMemberView, nextRole: "admin" | "member") {
    setStatus("saving");
    setMessage(null);
    const result = await postJson("/api/team/role", { careCircleId, memberId: member.id, role: nextRole });
    setStatus("idle");
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Role updated." });
    router.refresh();
  }

  async function transferOwner(member: TeamMemberView) {
    const confirmation = window.prompt(`Type TRANSFER to make ${member.name} the owner.`);
    if (confirmation !== "TRANSFER") return;
    setStatus("saving");
    setMessage(null);
    const result = await postJson("/api/team/transfer-owner", { careCircleId, memberId: member.id, confirmation });
    setStatus("idle");
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Ownership transferred." });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <section className="product-card p-6">
        <div>
          <p className="section-kicker">Members</p>
          <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>
            {activeMembers.length} of {maxFamilyMembers}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Your current plan allows up to {maxFamilyMembers} family member{maxFamilyMembers === 1 ? "" : "s"} in this care circle.
          </p>
        </div>

        {message && (
          <p
            className="mt-5 rounded-2xl p-3 text-sm font-medium"
            style={{
              background: message.type === "success" ? "var(--teal-soft)" : "#fef2f2",
              color: message.type === "success" ? "var(--teal)" : "#b91c1c",
            }}
          >
            {message.text}
          </p>
        )}

        {canAdd ? (
          <form onSubmit={addMember} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </label>
            <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
                placeholder="(555) 123-4567"
              />
            </label>
            <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
                type="email"
              />
            </label>
            {actorRole === "owner" && (
              <label className="block text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as "admin" | "member")}
                  className="mt-2 w-full rounded-2xl border bg-white/80 px-4 py-3"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}
            <button type="submit" disabled={status === "saving"} className="btn btn-sage w-full">
              {status === "saving" ? "Saving..." : "Add person"}
            </button>
          </form>
        ) : (
          <p className="mt-6 rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            You can view this team, but only an owner or admin can manage members.
          </p>
        )}
      </section>

      <section className="product-card overflow-hidden p-0">
        <div className="border-b p-6" style={{ borderColor: "var(--border)" }}>
          <p className="section-kicker">Team</p>
          <h2 className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>Family members</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {members.map((member) => {
            const manageable = member.status !== "removed" && canManage(actorRole, member.role);
            return (
              <div key={member.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold" style={{ color: "var(--text)" }}>{member.name}</h3>
                    <span className="rounded-full px-2 py-1 text-xs font-semibold capitalize" style={{ background: "var(--primary-soft)", color: "var(--text-secondary)" }}>
                      {member.role}
                    </span>
                    <span className="rounded-full px-2 py-1 text-xs font-semibold capitalize" style={{ background: member.status === "removed" ? "#fef2f2" : "var(--teal-soft)", color: member.status === "removed" ? "#b91c1c" : "var(--teal)" }}>
                      {member.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                    {member.email || "No email"}{member.phone ? ` · ${member.phone}` : ""}
                  </p>
                </div>

                {member.status !== "removed" && (
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {canChangeRoles && member.role !== "owner" && (
                      <select
                        value={member.role}
                        onChange={(event) => changeRole(member, event.target.value as "admin" | "member")}
                        disabled={status === "saving"}
                        className="rounded-xl border bg-white px-3 py-2 text-sm"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                    {actorRole === "owner" && member.role !== "owner" && member.userId && (
                      <button type="button" onClick={() => void transferOwner(member)} disabled={status === "saving"} className="btn btn-soft text-sm">
                        Transfer owner
                      </button>
                    )}
                    {manageable && (
                      <button type="button" onClick={() => void removeMember(member)} disabled={status === "saving"} className="btn btn-soft text-sm">
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
