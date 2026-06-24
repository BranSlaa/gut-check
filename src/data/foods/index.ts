import type { Food } from "@/types/food";
import { FRUITS } from "./fruits";
import { VEGETABLES } from "./vegetables";
import { PROTEINS } from "./proteins";
import { GRAINS } from "./grains";
import { DAIRY } from "./dairy";
import { FATS } from "./fats";
import { NUTS } from "./nuts";
import { HERBS } from "./herbs";
import { SWEETENERS } from "./sweeteners";
import { CONDIMENTS } from "./condiments";
import { DRINKS } from "./drinks";
export {
	FRUITS,
	VEGETABLES,
	PROTEINS,
	GRAINS,
	DAIRY,
	FATS,
	NUTS,
	HERBS,
	SWEETENERS,
	CONDIMENTS,
	DRINKS,
};

/**
 * Local seed data, split across one file per category so individual files stay
 * manageable as the data set grows. This intentionally models an INCOMPLETE
 * data set:
 *
 *  - Some foods omit whole blocks (no `compatibility`).
 *  - Some foods leave individual nutrients or diet ratings null/undefined.
 *  - A couple of records are deliberately sparse (e.g. only a name + category).
 *
 * The UI must render all of these gracefully — missing numbers show as "—",
 * missing compatibility shows as "Unknown", and totals skip null values.
 *
 * Order here mirrors `CATEGORIES` so the explorer sections appear in the
 * expected sequence.
 */
export const FOODS: Food[] = [
	...FRUITS,
	...VEGETABLES,
	...PROTEINS,
	...GRAINS,
	...DAIRY,
	...FATS,
	...NUTS,
	...HERBS,
	...SWEETENERS,
	...CONDIMENTS,
	...DRINKS,
];
