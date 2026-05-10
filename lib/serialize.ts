// Converts Prisma's camelCase field names to the snake_case the dashboard frontend expects.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeOrder(o: any) {
  return {
    id:                   o.id,
    order_id:             o.orderId,
    customer_name:        o.customerName,
    phone_number:         o.phoneNumber,
    email:                o.email        ?? "",
    service:              o.service,
    category:             o.category     ?? "",
    location:             o.location ||
                          (o.deliveryMethod === "Pick Up"
                            ? [o.pickupCity, o.pickupState].filter(Boolean).join(", ")
                            : o.deliveryDetails || [o.pickupCity, o.pickupState].filter(Boolean).join(", ") || ""),
    delivery_method:      o.deliveryMethod ?? "",
    delivery_details:     o.deliveryDetails ?? "",
    pickup_state:         o.pickupState  ?? "",
    pickup_city:          o.pickupCity   ?? "",
    pickup_location:      o.pickupLocation ?? "",
    deadline:             o.deadline     ?? "",
    amount:               Number(o.amount ?? 0),
    status:               o.status,
    print_color:          o.printColor   ?? "",
    paper_type:           o.paperType    ?? "",
    pages:                o.pages        ?? 1,
    copies:               o.copies       ?? 1,
    express_service:      o.expressService ?? false,
    print_layout:         o.printLayout  ?? "",
    finishing_option:     o.finishingOption ?? "",
    specific_instruction: o.specificInstruction ?? "",
    paystack_ref:         o.paystackRef  ?? "",
    file_url:             o.fileUrl      ?? "",
    document_text:        o.documentText ?? "",
    created_at:           o.createdAt instanceof Date
                            ? o.createdAt.toISOString()
                            : (o.createdAt ?? new Date().toISOString()),
    updated_at:           o.updatedAt instanceof Date
                            ? o.updatedAt.toISOString()
                            : (o.updatedAt ?? o.createdAt ?? new Date().toISOString()),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializePartner(p: any) {
  return {
    id:           p.id,
    full_name:    p.fullName,
    company_name: p.companyName,
    email:        p.email,
    address:      p.address  ?? "",
    status:       p.status,
    created_at:   p.createdAt instanceof Date
                    ? p.createdAt.toISOString()
                    : (p.createdAt ?? new Date().toISOString()),
  };
}
