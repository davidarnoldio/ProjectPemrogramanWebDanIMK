import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dbStore } from "@/lib/store";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("Supabase query fallback:", e);
  }

  return NextResponse.json(dbStore.courses);
}
