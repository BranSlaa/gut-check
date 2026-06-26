/**
 * Food categories used to group the explorer tables. Each category carries a
 * neon accent so alternating sections can glow with distinct colours.
 *
 * `accent` is an arbitrary hue exposed as CSS custom properties on the table
 * section, letting Tailwind arbitrary values (e.g. shadow / border) reference
 * a single source of truth per category.
 */
export type FoodCategory = {
	id: string;
	label: string;
	/** Core neon hue for the category, as an rgb triplet string "r g b". */
	accent: string;
	/** Short description shown under the section header. */
	blurb: string;
};

export const CATEGORIES: FoodCategory[] = [
	{
		id: "fruits",
		label: "Fruits",
		accent: "255 45 149", // neon pink
		blurb: "Whole fruits & berries",
	},
	{
		id: "vegetables",
		label: "Vegetables",
		accent: "57 255 20", // neon green
		blurb: "Leafy greens & produce",
	},
	{
		id: "proteins",
		label: "Proteins",
		accent: "255 86 86", // neon red
		blurb: "Animal & plant proteins",
	},
	{
		id: "grains",
		label: "Grains",
		accent: "255 196 0", // amber
		blurb: "Whole grains & cereals",
	},
	{
		id: "dairy",
		label: "Dairy & Alternatives",
		accent: "56 189 255", // cyan
		blurb: "Dairy & cultured alts",
	},
	{
		id: "fats",
		label: "Fats & Oils",
		accent: "255 224 102", // soft yellow
		blurb: "Cooking & finishing fats",
	},
	{
		id: "nuts",
		label: "Nuts & Seeds",
		accent: "255 142 64", // orange
		blurb: "Nuts & seeds",
	},
	{
		id: "herbs",
		label: "Herbs & Spices",
		accent: "0 230 168", // teal
		blurb: "Aromatics & seasonings",
	},
	{
		id: "sweeteners",
		label: "Sweeteners",
		accent: "190 120 255", // violet
		blurb: "Sugars & syrups",
	},
	{
		id: "condiments",
		label: "Condiments & Sauces",
		accent: "120 180 255", // sky blue
		blurb: "Sauces & spreads",
	},
	{
		id: "drinks",
		label: "Drinks",
		accent: "129 140 248", // indigo
		blurb: "Juices, milks & brews",
	},
];

export const CATEGORY_BY_ID: Record<string, FoodCategory> = Object.fromEntries(
	CATEGORIES.map((category) => [category.id, category]),
);
