import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password, name } = parsed.data;

  const supabase = createServiceRoleClient();

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (selectError) {
    console.error("[signup:select]", selectError);
    return NextResponse.json(
      { error: "Could not create account. Try again later." },
      { status: 500 },
    );
  }

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const password_hash = await hash(password, 12);
  const displayName =
    name?.trim() || email.slice(0, email.indexOf("@")) || "User";
  const role: UserRole = "admin";

  const { error } = await supabase.from("users").insert({
    email,
    name: displayName,
    password_hash,
    role,
    is_active: true,
  });

  if (error) {
    console.error("[signup]", error);
    return NextResponse.json(
      { error: "Could not create account. Try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
