import CompatibilityIcon from "@/components/CompatibilityIcon";
import DoshaColumnCell from "@/components/DoshaColumnCell";
import type { ExplorerDietColumn } from "@/data/diets";
import { getCompatibility } from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	column: ExplorerDietColumn;
	food: Food;
	size?: "sm" | "md";
};

export default function ExplorerDietCell({ column, food, size = "sm" }: Props) {
	if (column.type === "dosha") {
		return <DoshaColumnCell food={food} dosha={column.key} size={size} />;
	}

	return (
		<CompatibilityIcon
			status={getCompatibility(food, column.key)}
			size={size}
		/>
	);
}
