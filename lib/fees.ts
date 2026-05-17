/**
 * Single source of truth for all pricing.
 * Imported by both client pages and server API routes so amounts
 * are always computed the same way on both sides.
 */

export const PRINT_RATES: Record<string, Record<string, number>> = {
  "Black & white": { A4: 300, A3: 500, "Custom type": 300, Passport: 300 },
  Coloured:        { A4: 500, A3: 1200, "Custom type": 500, Passport: 750 },
};

export const FINISHING_COSTS: Record<string, number> = {
  None: 0, Stapled: 200, "Spiral Binding": 500, "Hardcover Binding": 2000,
};

/** Service fee charged per order, by service type. */
export const SERVICE_FEES: Record<string, number> = {
  Printing:                    2000,
  Photocopy:                   1500,
  Binding:                     1500,
  Scanning:                    1500,
  Lamination:                   700,
  Typing:                      2000,
  "Document Conversion":       2000,
  "Graphic/Logo Design":       3000,
  "Business Card / ID Card":   2000,
  "Application Services":      2000,
  "Technical Support":         3000,
  "Hardcopy / Computer Pickup": 3000,
  Other:                       2000,
};

export const DEFAULT_SERVICE_FEE = 2000;

/** Base delivery fees. Schedule Delivery is per-stop. */
export const DELIVERY_FEES: Record<string, number> = {
  "Express Delivery":   3000,
  "Standard Delivery":  2000,
  "Economy Delivery":   1000,
  "Schedule Delivery":  5000,
  "Special Submission":    0,
  "Hardcopy Pickup":       0, // pickup fee handled separately
};

export const HARDCOPY_PICKUP_FEE = 3000;
export const LAMINATION_FEE      = 700;
export const EXPRESS_SURCHARGE   = 0.5; // 50 % on top of print cost

/** Returns the service fee for a given service name. */
export function getServiceFee(service: string | null | undefined): number {
  if (!service) return DEFAULT_SERVICE_FEE;
  return SERVICE_FEES[service] ?? DEFAULT_SERVICE_FEE;
}

/** Returns the delivery fee. Schedule Delivery multiplied by number of stops. */
export function getDeliveryFee(
  method: string | null | undefined,
  stops = 1,
): number {
  if (!method) return 0;
  if (method === "Schedule Delivery") {
    return DELIVERY_FEES["Schedule Delivery"] * Math.max(stops, 1);
  }
  return DELIVERY_FEES[method] ?? 0;
}
