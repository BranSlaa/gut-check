import type {
	CompatibilityKey,
	DietLensKey,
	HealthBenefitKey,
} from "@/types/food";
import { DIET_LENS_KEYS, HEALTH_BENEFIT_KEYS } from "@/types/food";

export type Lens = {
	key: CompatibilityKey;
	label: string;
	/** Neon accent as an "r g b" triplet for the filter chip. */
	accent: string;
	/** "diet" = named eating pattern; "health" = outcome / benefit lens. */
	group: "diet" | "health";
};

/** Named dietary pattern filters. */
export const DIET_LENSES: Lens[] = [
	{ key: "ibs", label: "IBS Friendly", accent: "255 45 149", group: "diet" },
	{ key: "fodmap", label: "Low FODMAP", accent: "57 255 20", group: "diet" },
	{
		key: "mediterranean",
		label: "Mediterranean",
		accent: "56 189 255",
		group: "diet",
	},
	{
		key: "portfolio",
		label: "Portfolio",
		accent: "189 92 255",
		group: "diet",
	},
	{ key: "keto", label: "Keto", accent: "255 196 0", group: "diet" },
	{
		key: "ayurvedic",
		label: "Ayurvedic",
		accent: "255 142 64",
		group: "diet",
	},
	{
		key: "gutHealthy",
		label: "Gut Healthy",
		accent: "0 230 168",
		group: "diet",
	},
	{
		key: "gerdFriendly",
		label: "GERD Friendly",
		accent: "255 86 86",
		group: "diet",
	},
	{
		key: "gout",
		label: "Gout Friendly",
		accent: "160 120 255",
		group: "diet",
	},
];

/** Health-outcome lenses (inferred from tags & macros unless overridden). */
export const HEALTH_BENEFIT_LENSES: Lens[] = [
	{
		key: "immune",
		label: "Immune Support",
		accent: "120 255 180",
		group: "health",
	},
	{ key: "energy", label: "Energy", accent: "255 220 80", group: "health" },
	{
		key: "antiInflammatory",
		label: "Anti-Inflammatory",
		accent: "255 120 80",
		group: "health",
	},
	{
		key: "brainHealth",
		label: "Brain & Memory",
		accent: "180 140 255",
		group: "health",
	},
	{
		key: "heartHealth",
		label: "Heart Health",
		accent: "255 80 120",
		group: "health",
	},
	{
		key: "cholesterol",
		label: "Cholesterol",
		accent: "100 200 255",
		group: "health",
	},
	{
		key: "digestion",
		label: "Digestion",
		accent: "80 220 160",
		group: "health",
	},
	{
		key: "satiety",
		label: "Satiety",
		accent: "200 180 255",
		group: "health",
	},
];

/** All filterable lenses, in display order. */
export const ALL_LENSES: Lens[] = [...DIET_LENSES, ...HEALTH_BENEFIT_LENSES];

/** @deprecated Use ALL_LENSES — kept for existing imports. */
export const DIETS = ALL_LENSES;

/** Diet columns rendered in explorer tables (subset keeps width manageable). */
export const TABLE_DIET_COLUMNS: { key: DietLensKey; label: string }[] = [
	{ key: "fodmap", label: "FODMAP" },
	{ key: "ibs", label: "IBS" },
	{ key: "mediterranean", label: "Mediterranean" },
	{ key: "portfolio", label: "Portfolio" },
	{ key: "keto", label: "Keto" },
	{ key: "gutHealthy", label: "Gut" },
	{ key: "gout", label: "Gout" },
];

/** Health-benefit columns shown beside diet columns in explorer tables. */
export const TABLE_HEALTH_COLUMNS: { key: HealthBenefitKey; label: string }[] =
	[
		{ key: "immune", label: "Immune" },
		{ key: "energy", label: "Energy" },
		{ key: "antiInflammatory", label: "Inflam." },
		{ key: "brainHealth", label: "Brain" },
		{ key: "heartHealth", label: "Heart" },
		{ key: "cholesterol", label: "Chol." },
		{ key: "digestion", label: "Digest" },
		{ key: "satiety", label: "Satiety" },
	];
