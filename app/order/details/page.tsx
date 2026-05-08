import { Suspense } from "react";
import OrderDetailsContent from "./OrderDetailsContent";

export const dynamic = "force-dynamic";

export default function OrderDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
          <div className="text-gray-400 text-sm animate-pulse">Loading…</div>
        </div>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}
