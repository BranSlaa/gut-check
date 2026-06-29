import DoshaBadge from "@/components/DoshaBadge";
import { DOSHA_LIST } from "@/data/ayurveda/doshas";
import { getFoodDoshas } from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	food: Food;
	size?: "sm" | "md";
};

/** Row of dosha badges for a food, in Vata → Pitta → Kapha order. */
export default function DoshaBadges({ food, size = "sm" }: Props) {
	const doshas = getFoodDoshas(food);
	if (doshas.length === 0) return null;

	const ordered = DOSHA_LIST.map((d) => d.key).filter((key) =>
		doshas.includes(key),
	);

	return (
		<span className="inline-flex items-center gap-1">
			{ordered.map((dosha) => (
				<DoshaBadge key={dosha} dosha={dosha} size={size} />
			))}
		</span>
	);
}
