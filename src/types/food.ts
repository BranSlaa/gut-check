import type { Dosha } from "@/types/ayurveda";

export type CompatibilityStatus = "allowed" | "moderation" | "avoid";

/** Named dietary pattern lenses (FODMAP, keto, etc.). */
export const DIET_LENS_KEYS = [
	"fodmap",
	"ibs",
	"mediterranean",
	"portfolio",
	"dash",
	"keto",
	"ayurvedic",
	"lactoseFree",
	"gutHealthy",
	"gerdFriendly",
	"gout",
] as const;

/** Health-outcome lenses inferred from tags & macros when not explicitly set. */
export const HEALTH_BENEFIT_KEYS = [
	"immune",
	"energy",
	"antiInflammatory",
	"brainHealth",
	"heartHealth",
	"cholesterol",
	"digestion",
	"satiety",
] as const;

/**
 * Every lens the app can rate a food against — diets first, then health
 * benefits. UI tables iterate these in a stable order.
 */
export const COMPATIBILITY_KEYS = [
	...DIET_LENS_KEYS,
	...HEALTH_BENEFIT_KEYS,
] as const;

export type DietLensKey = (typeof DIET_LENS_KEYS)[number];
export type HealthBenefitKey = (typeof HEALTH_BENEFIT_KEYS)[number];
export type CompatibilityKey = (typeof COMPATIBILITY_KEYS)[number];

export type Compatibility = Partial<
	Record<CompatibilityKey, CompatibilityStatus | null>
>;

/**
 * A food record. Almost everything is optional/nullable on purpose: the data
 * set is meant to grow incrementally, so the UI must tolerate missing values
 * without crashing. Missing numbers render as "—", missing compatibility as
 * "Unknown", and aggregations simply skip absent fields.
 *
 * Diet lenses are stored explicitly on each food. Health-benefit lenses are
 * inferred at read time from tags & macros unless overridden on the food.
 */
export type Food = {
	id: string;
	name: string;
	category?: string | null;

	calories?: number | null;
	protein?: number | null;
	carbs?: number | null;
	fat?: number | null;
	fiber?: number | null;

	compatibility?: Compatibility | null;

	/** Dosha(s) this food pacifies (Vata, Pitta, Kapha). */
	doshas?: Dosha[] | null;

	tags?: string[] | null;
};

export type NutritionKey = "calories" | "protein" | "carbs" | "fat" | "fiber";

export type SortKey = "mostCompatible" | "protein" | "fiber" | "lowestCarbs";
