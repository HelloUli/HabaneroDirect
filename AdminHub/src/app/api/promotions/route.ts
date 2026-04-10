import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("promotions")
    .insert({
      code: body.code?.toUpperCase(),
      description: body.description || null,
      type: body.type || "percentage",
      value: body.value ?? 0,
      min_subtotal: body.min_subtotal || null,
      max_discount: body.max_discount || null,
      starts_at: body.starts_at || null,
      expires_at: body.expires_at || null,
      usage_limit: body.usage_limit || null,
      usage_count: 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
