import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function generateOrderId(): string {
  const ts  = Date.now().toString().slice(-6);
  const rnd = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `CSN-${ts}${rnd}`;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const orderId = generateOrderId();

    // Derive a human-readable location for the admin table
    const pickupFull = [data.pickup_location, data.pickup_city, data.pickup_state].filter(Boolean).join(", ");
    const location =
      data.delivery_method === "Pick Up"
        ? (pickupFull || "Pick Up")
        : (data.delivery_details?.split(/[,\n]/)[0]?.trim() || "Doorstep");

    const supabase = getSupabaseAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_id:             orderId,
        customer_name:        data.name,
        phone_number:         data.phone_number,
        email:                data.email,
        service:              data.service   || "Unspecified",
        category:             data.category  || null,
        delivery_method:      data.delivery_method   || null,
        pickup_state:         data.pickup_state      || null,
        pickup_city:          data.pickup_city       || null,
        pickup_location:      data.pickup_location   || null,
        delivery_details:     data.delivery_details  || null,
        location,
        deadline:             data.deadline          || null,
        express_service:      data.express_service   ?? false,
        print_color:          data.print_color       || null,
        paper_type:           data.paper_type        || null,
        pages:                data.pages             || 1,
        copies:               data.copies            || 1,
        print_layout:         data.print_layout      || null,
        finishing_option:     data.finishing_option  || null,
        specific_instruction: data.specific_instruction || null,
        amount:               data.amount            || 0,
        paystack_ref:         data.paystack_ref      || null,
        status:               "Pending",
      })
      .select("id, order_id")
      .single();

    if (error) throw error;

    return NextResponse.json({ order_id: order.order_id, id: order.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
