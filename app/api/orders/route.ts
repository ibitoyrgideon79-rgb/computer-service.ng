import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

function generateOrderId(): string {
  const d    = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CSN-${d}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const order = await prisma.order.create({
      data: {
        orderId:             generateOrderId(),
        customerName:        String(data.customer_name  || ""),
        phoneNumber:         String(data.phone_number   || ""),
        email:               data.email                 || null,
        service:             data.service               || "Unspecified",
        category:            data.category              || null,
        deliveryMethod:      data.delivery_method       || "Pick Up",
        pickupState:         data.pickup_state          || null,
        pickupCity:          data.pickup_city           || null,
        pickupLocation:      data.pickup_location       || null,
        deliveryDetails:     data.delivery_details      || null,
        deadline:            data.deadline              || null,
        expressService:      data.express_service       ?? false,
        printColor:          data.print_color           || null,
        paperType:           data.paper_type            || null,
        pages:               data.pages                 ? Number(data.pages) : null,
        copies:              data.copies                ? Number(data.copies) : 1,
        printLayout:         data.print_layout          || null,
        finishingOption:     data.finishing_option      || null,
        specificInstruction: data.specific_instruction  || null,
        amount:              new Decimal(data.amount    ?? 0),
        paystackRef:         data.paystack_ref          || null,
        documentText:        data.document_text         || null,
        hardcopyPickupDate:  data.hardcopy_pickup_date  || null,
        hardcopyPickupTime:  data.hardcopy_pickup_time  || null,
        hardcopyState:       data.hardcopy_state        || null,
        hardcopyCity:        data.hardcopy_city         || null,
        hardcopyContactName: data.hardcopy_contact_name || null,
        hardcopyContactPhone: data.hardcopy_contact_phone || null,
        hardcopyDocCount:    data.hardcopy_doc_count    ? Number(data.hardcopy_doc_count) : null,
        hardcopyInstructions: data.hardcopy_instructions || null,
        status:              data.status                || "Pending",
      },
    });

    return NextResponse.json(
      { orderId: order.orderId, id: order.id, status: order.status },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
