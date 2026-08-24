import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tier = "light" | "medium" | "spicy";

const TIER_STYLES: Record<Tier, string> = {
  light: "bg-emerald-500/15 text-emerald-300",
  medium: "bg-amber-500/15 text-amber-300",
  spicy: "bg-red-500/15 text-red-400",
};

const TIER_LABEL: Record<Tier, string> = {
  light: "🟢 Light",
  medium: "🟡 Medium",
  spicy: "🔴 Spicy",
};

/** How spicy a deck's content is, shown on deck cards. */
export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <Badge variant="secondary" className={cn(TIER_STYLES[tier])}>
      {TIER_LABEL[tier]}
    </Badge>
  );
}
