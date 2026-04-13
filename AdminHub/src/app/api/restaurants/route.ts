import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createServiceRoleClient();

  if (!body.owner_email || !body.owner_password || !body.owner_name) {
    return NextResponse.json({ error: "Owner name, email, and password are required" }, { status: 400 });
  }

  const { data: existingUser } = await supabase
    .from("restaurant_users")
    .select("id")
    .eq("email", body.owner_email)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "An account with this owner email already exists" }, { status: 409 });
  }

  const slug =
    body.slug ||
    body.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    "";

  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      name: body.name,
      slug,
      description: body.description || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zip: body.zip || null,
      phone: body.phone || null,
      email: body.email || null,
      logo_url: body.logo_url || null,
      cover_image_url: body.cover_image_url || null,
      timezone: body.timezone || "America/Chicago",
      is_active: true,
      is_open: false,
      stripe_account_id: null,
      stripe_onboarding_complete: false,
      commission_rate: body.commission_rate ?? 0.1,
      has_website_subscription: body.has_website_subscription ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const passwordHash = await hash(body.owner_password, 12);

  const { error: ownerError } = await supabase
    .from("restaurant_users")
    .insert({
      restaurant_id: data.id,
      email: body.owner_email,
      name: body.owner_name,
      password_hash: passwordHash,
      role: "owner",
    });

  if (ownerError) {
    await supabase.from("restaurants").delete().eq("id", data.id);
    return NextResponse.json({ error: `Restaurant created but owner account failed: ${ownerError.message}` }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
