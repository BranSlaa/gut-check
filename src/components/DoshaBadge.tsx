import DoshaIcon from "@/components/DoshaIcon";
import Tooltip from "@/components/Tooltip";
import { DOSHA_META } from "@/data/ayurveda/doshas";
import type { Dosha } from "@/types/ayurveda";

type Props = {
	dosha: Dosha;
	size?: "sm" | "md";
};

/** Dosha badge — split-circle elemental icon with tooltip. */
export default function DoshaBadge({ dosha, size = "sm" }: Props) {
	const meta = DOSHA_META[dosha];

	return (
		<Tooltip content={meta.tooltip} placement="top">
			<span
				className="inline-flex items-center"
				aria-label={`${meta.label} dosha — ${meta.tooltip}`}
			>
				<DoshaIcon dosha={dosha} size={size} />
			</span>
		</Tooltip>
	);
}
