import { publicEnv } from "@/lib/public-env";

/**
 * Shown only while NEXT_PUBLIC_DEMO_MODE=1 (client-review phase).
 * Set the flag to 0 / remove it for production — nothing else to change.
 */
export function DemoBanner() {
  if (!publicEnv.demoMode) return null;
  return (
    <div className="border-b border-[#e6c98f] bg-[#fdf3e0] text-center">
      <p className="mx-auto max-w-[1200px] px-4 py-2 text-xs font-medium text-[#8a5a00]">
        🔧 وضع عرض تجريبي — كل المنتجات والأسعار وهمية للاختبار فقط وليست بيانات حقيقية.
      </p>
    </div>
  );
}
