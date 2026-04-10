import { NextResponse } from "next/server";
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
  return NextResponse.json(data, { status: 201 });
}
