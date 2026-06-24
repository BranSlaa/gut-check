import { ALL_LENSES } from "@/data/diets";
import { inferHealthBenefit } from "@/lib/healthBenefits";
import { COMPATIBILITY_KEYS, HEALTH_BENEFIT_KEYS } from "@/types/food";
import type {
	CompatibilityKey,
	CompatibilityStatus,
	Food,
	HealthBenefitKey,
	NutritionKey,
	SortKey,
} from "@/types/food";

const HEALTH_BENEFIT_SET = new Set<string>(HEALTH_BENEFIT_KEYS);

function isHealthBenefitKey(key: CompatibilityKey): key is HealthBenefitKey {
	return HEALTH_BENEFIT_SET.has(key);
}

/** Format a possibly-missing numeric nutrient. Missing values render as "—". */
export function fmtNum(value: number | null | undefined, digits = 1): string {
	if (value === null || value === undefined || Number.isNaN(value))
		return "—";
	// Drop trailing ".0" for whole numbers so the table stays compact.
	const rounded = Number(value.toFixed(digits));
	return Number.isInteger(rounded)
		? String(rounded)
		: rounded.toFixed(digits);
}

/** Read a nutrient off a food, tolerating undefined fields. */
export function getNutrient(food: Food, key: NutritionKey): number | null {
	const value = food[key];
	return value ?? null;
}

/** Read a single compatibility rating, returning null when unknown. */
export function getCompatibility(
	food: Food,
	key: CompatibilityKey,
): CompatibilityStatus | null {
	const explicit = food.compatibility?.[key];
	if (explicit === "allowed" || explicit === "moderation" || explicit === "avoid") {
		return explicit;
	}
	if (isHealthBenefitKey(key)) {
		return inferHealthBenefit(food, key);
	}
	return null;
}

/**
 * Count how many of a food's known lenses rate as "allowed". Used by the
 * "Most Diet Compatible" sort. Health benefits are inferred when absent.
 */
export function countAllowed(food: Food): number {
	return COMPATIBILITY_KEYS.reduce((acc, key) => {
		return acc + (getCompatibility(food, key) === "allowed" ? 1 : 0);
	}, 0);
}

/**
 * Null-safe sort. Foods missing the active sort value always sink to the
 * bottom, regardless of direction, and ties fall back to original order.
 */
export function sortFoods(foods: Food[], sort: SortKey): Food[] {
	const withIndex = foods.map((food, index) => ({ food, index }));

	const nullableCompare = (
		a: number | null,
		b: number | null,
		direction: "asc" | "desc",
	): number => {
		// Unknowns always sink to the bottom.
		if (a === null && b === null) return 0;
		if (a === null) return 1;
		if (b === null) return -1;
		return direction === "asc" ? a - b : b - a;
	};

	const getter: (food: Food) => number | null = (() => {
		switch (sort) {
			case "protein":
				return (f) => getNutrient(f, "protein");
			case "fiber":
				return (f) => getNutrient(f, "fiber");
			case "lowestCarbs":
				return (f) => getNutrient(f, "carbs");
			case "mostCompatible":
			default:
				return (f) => countAllowed(f);
		}
	})();

	const direction: "asc" | "desc" = sort === "lowestCarbs" ? "asc" : "desc";

	return withIndex
		.sort((a, b) => {
			const primary = nullableCompare(
				getter(a.food),
				getter(b.food),
				direction,
			);
			if (primary !== 0) return primary;
			// Stable fallback: original order, then name.
			if (a.index !== b.index) return a.index - b.index;
			return a.food.name.localeCompare(b.food.name);
		})
		.map((entry) => entry.food);
}

export type FoodFilters = {
	search: string;
	categories: Set<string>;
	diets: Set<CompatibilityKey>;
	properties: Set<string>;
	nutrition: Record<NutritionKey, { min: number; max: number }>;
};

/**
 * Apply search, category, diet, property and nutrition-range filters.
 *
 * Null-handling rules:
 *  - A food passes a diet filter if that lens is "allowed" OR "moderation".
 *    Unknown ratings do NOT pass an active diet filter (we can't claim a food
 *    is compatible when we have no data).
 *  - Nutrition sliders only constrain foods that actually have that value;
 *    foods missing the nutrient are not excluded by the range.
 */
export function filterFoods(foods: Food[], filters: FoodFilters): Food[] {
	const query = filters.search.trim().toLowerCase();

	return foods.filter((food) => {
		if (query && !food.name.toLowerCase().includes(query)) {
			const tagMatch = food.tags?.some((t) =>
				t.toLowerCase().includes(query),
			);
			if (!tagMatch) return false;
		}

		if (filters.categories.size > 0) {
			if (!food.category || !filters.categories.has(food.category))
				return false;
		}

		for (const diet of filters.diets) {
			const rating = getCompatibility(food, diet);
			if (rating !== "allowed" && rating !== "moderation") return false;
		}

		for (const property of filters.properties) {
			if (!matchesProperty(food, property)) return false;
		}

		for (const key of NUTRITION_KEYS) {
			const value = getNutrient(food, key);
			if (value === null) continue; // missing data never excludes
			const range = filters.nutrition[key];
			if (value < range.min || value > range.max) return false;
		}

		return true;
	});
}

export const NUTRITION_KEYS: NutritionKey[] = [
	"calories",
	"protein",
	"carbs",
	"fat",
	"fiber",
];

/** Food property checkboxes derive from tags plus a couple of macro thresholds. */
export function matchesProperty(food: Food, property: string): boolean {
	const hasTag = (tag: string) => food.tags?.includes(tag) ?? false;
	switch (property) {
		case "high-fiber":
			return hasTag("high-fiber") || (food.fiber ?? 0) >= 5;
		case "low-carb":
			return hasTag("low-carb") || (food.carbs ?? Infinity) <= 10;
		case "high-protein":
			return hasTag("high-protein") || (food.protein ?? 0) >= 12;
		case "gluten-free":
			return hasTag("gluten-free");
		case "dairy-free":
			return food.category !== "dairy" || hasTag("dairy-free");
		case "fermented":
			return hasTag("fermented");
		case "raw-friendly":
			return hasTag("raw-friendly");
		case "low-acid":
			return (
				hasTag("low-acid") ||
				food.compatibility?.gerdFriendly === "allowed"
			);
		default:
			return true;
	}
}

export type SelectionTotals = {
	count: number;
	calories: number;
	protein: number;
	fiber: number;
	carbs: number;
	fat: number;
	/** How many selected foods contributed at least one known nutrient. */
	withData: number;
};

/** Aggregate selected foods, ignoring null/undefined nutrient values. */
export function computeTotals(foods: Food[]): SelectionTotals {
	const totals: SelectionTotals = {
		count: foods.length,
		calories: 0,
		protein: 0,
		fiber: 0,
		carbs: 0,
		fat: 0,
		withData: 0,
	};

	for (const food of foods) {
		let contributed = false;
		for (const key of NUTRITION_KEYS) {
			const value = getNutrient(food, key);
			if (value !== null) {
				totals[key] += value;
				contributed = true;
			}
		}
		if (contributed) totals.withData += 1;
	}

	return totals;
}

/**
 * A factual tally of how a set of foods rates against a single diet lens. No
 * invented scoring — just counts of the existing allowed/moderation/avoid
 * ratings, plus how many foods we have no data for.
 */
export type DietBreakdown = {
	key: CompatibilityKey;
	label: string;
	/** Neon accent as an "r g b" triplet, mirrored from the diet definition. */
	accent: string;
	allowed: number;
	moderation: number;
	avoid: number;
	unknown: number;
	total: number;
};

/** Tally each lens across the given foods, in canonical order. */
export function computeDietBreakdowns(foods: Food[]): DietBreakdown[] {
	return ALL_LENSES.map((lens) => {
		let allowed = 0;
		let moderation = 0;
		let avoid = 0;
		let unknown = 0;

		for (const food of foods) {
			const rating = getCompatibility(food, lens.key);
			if (rating === "allowed") allowed += 1;
			else if (rating === "moderation") moderation += 1;
			else if (rating === "avoid") avoid += 1;
			else unknown += 1;
		}

		return {
			key: lens.key,
			label: lens.label,
			accent: lens.accent,
			allowed,
			moderation,
			avoid,
			unknown,
			total: foods.length,
		};
	});
}

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
	{ key: "mostCompatible", label: "Most Compatible" },
	{ key: "protein", label: "Protein" },
	{ key: "fiber", label: "Fiber" },
	{ key: "lowestCarbs", label: "Lowest Carbs" },
];

export const PROPERTY_OPTIONS: { id: string; label: string }[] = [
	{ id: "high-fiber", label: "High Fiber" },
	{ id: "low-carb", label: "Low Carb" },
	{ id: "high-protein", label: "High Protein" },
	{ id: "gluten-free", label: "Gluten Free" },
	{ id: "dairy-free", label: "Dairy Free" },
	{ id: "fermented", label: "Fermented" },
	{ id: "raw-friendly", label: "Raw Friendly" },
	{ id: "low-acid", label: "Low Acid" },
];

/** Sensible slider ceilings for each nutrient. */
export const NUTRITION_RANGES: Record<
	NutritionKey,
	{ min: number; max: number; step: number; unit: string; label: string }
> = {
	calories: { min: 0, max: 900, step: 10, unit: "kcal", label: "Calories" },
	protein: { min: 0, max: 40, step: 1, unit: "g", label: "Protein" },
	carbs: { min: 0, max: 100, step: 1, unit: "g", label: "Carbs" },
	fat: { min: 0, max: 100, step: 1, unit: "g", label: "Fat" },
	fiber: { min: 0, max: 80, step: 1, unit: "g", label: "Fiber" },
};
