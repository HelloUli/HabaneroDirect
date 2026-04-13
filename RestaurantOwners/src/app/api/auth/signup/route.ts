import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, restaurantId } = body;

    if (!email || !password || !name || !restaurantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from("restaurant_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", restaurantId)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { error } = await supabase.from("restaurant_users").insert({
      email,
      name,
      password_hash: passwordHash,
      restaurant_id: restaurantId,
      role: "staff" as const,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
