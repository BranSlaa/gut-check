import CompatibilityIcon from "@/components/CompatibilityIcon";
import DoshaBadges from "@/components/DoshaBadges";
import { getCompatibility } from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	food: Food;
	size?: "sm" | "md";
};

/**
 * Ayurvedic compatibility rating plus dosha elemental badges.
 */
export default function AyurvedicCell({ food, size = "sm" }: Props) {
	return (
		<span className="inline-flex items-center justify-center gap-1">
			<CompatibilityIcon
				status={getCompatibility(food, "ayurvedic")}
				size={size}
			/>
			<DoshaBadges food={food} size={size} />
		</span>
	);
}
