import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  ()      => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from("orders")
    .select("status, amount");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = data ?? [];
  const total       = orders.length;
  const pending     = orders.filter((o) => o.status === "Pending").length;
  const inProgress  = orders.filter((o) => o.status === "In Progress").length;
  const inTransit   = orders.filter((o) => o.status === "In Transit").length;
  const completed   = orders.filter((o) => o.status === "Completed").length;
  const delivered   = orders.filter((o) => o.status === "Delivered").length;
  const cancelled   = orders.filter((o) => o.status === "Cancelled").length;
  const revenue     = orders
    .filter((o) => ["Completed", "Delivered"].includes(o.status))
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  return NextResponse.json({
    total, pending, inProgress, inTransit, completed, delivered, cancelled, revenue,
  });
}
