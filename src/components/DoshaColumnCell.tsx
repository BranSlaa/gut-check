import DoshaBadge from "@/components/DoshaBadge";
import { getFoodDoshas } from "@/lib/food";
import type { Dosha } from "@/types/ayurveda";
import type { Food } from "@/types/food";

type Props = {
	food: Food;
	dosha: Dosha;
	size?: "sm" | "md";
};

/** Single dosha column — icon when pacifying, empty marker when not. */
export default function DoshaColumnCell({ food, dosha, size = "sm" }: Props) {
	const active = getFoodDoshas(food).includes(dosha);

	if (!active) {
		return (
			<span
				className="inline-flex h-5 w-5 items-center justify-center font-mono text-sm text-ink-faint/25"
				aria-hidden
			>
				·
			</span>
		);
	}

	return <DoshaBadge dosha={dosha} size={size} />;
}
