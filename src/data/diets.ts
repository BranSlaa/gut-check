import type {
	CompatibilityKey,
	DietLensKey,
	HealthBenefitKey,
} from "@/types/food";
import { DIET_LENS_KEYS, HEALTH_BENEFIT_KEYS } from "@/types/food";

export type Lens = {
	key: CompatibilityKey;
	label: string;
	/** Short explainer shown in filter chips and table-header tooltips. */
	description: string;
	/** Neon accent as an "r g b" triplet for the filter chip. */
	accent: string;
	/** "diet" = named eating pattern; "health" = outcome / benefit lens. */
	group: "diet" | "health";
};

/** Named dietary pattern filters. */
export const DIET_LENSES: Lens[] = [
	{
		key: "ibs",
		label: "IBS Friendly",
		description:
			"Gentle on sensitive digestion — lower fermentable carbs, moderate fat, and fewer common IBS triggers.",
		accent: "255 45 149",
		group: "diet",
	},
	{
		key: "fodmap",
		label: "Low FODMAP",
		description:
			"Limits fermentable carbs (FODMAPs) that can cause bloating, gas, and pain in IBS.",
		accent: "57 255 20",
		group: "diet",
	},
	{
		key: "mediterranean",
		label: "Mediterranean",
		description:
			"Olive oil, fish, legumes, vegetables, and whole grains; limited processed meat and added sugar.",
		accent: "56 189 255",
		group: "diet",
	},
	{
		key: "portfolio",
		label: "Portfolio",
		description:
			"Cholesterol-lowering pattern — plant sterols, soy protein, nuts, viscous fibre, and less saturated fat.",
		accent: "189 92 255",
		group: "diet",
	},
	{
		key: "dash",
		label: "DASH",
		description:
			"Blood-pressure-friendly eating — fruits, vegetables, whole grains, lean protein, and low-fat dairy; limited sodium, red meat, and sweets.",
		accent: "72 200 255",
		group: "diet",
	},
	{
		key: "keto",
		label: "Keto",
		description:
			"Very low carbohydrate, higher fat eating aimed at ketosis — limits grains, sugars, and starchy produce.",
		accent: "255 196 0",
		group: "diet",
	},
	{
		key: "ayurvedic",
		label: "Ayurvedic",
		description:
			"Whole-food balance aligned with Ayurvedic principles — digestibility, freshness, and moderate processing.",
		accent: "255 142 64",
		group: "diet",
	},
	{
		key: "lactoseFree",
		label: "Lactose Free",
		description:
			"Low-lactose and dairy-free choices — limits milk, soft cheeses, and ice cream; aged cheese and ghee in moderation.",
		accent: "200 220 255",
		group: "diet",
	},
	{
		key: "gutHealthy",
		label: "Gut Healthy",
		description:
			"Supports the microbiome — fibre, fermented foods, and fewer ultra-processed ingredients.",
		accent: "0 230 168",
		group: "diet",
	},
	{
		key: "gerdFriendly",
		label: "GERD Friendly",
		description:
			"Minimizes reflux triggers — lower acid, moderate fat, and limited alcohol, spice, and irritants.",
		accent: "255 86 86",
		group: "diet",
	},
	{
		key: "gout",
		label: "Gout Friendly",
		description:
			"Low purine choices — limits organ meats, certain seafood, beer, and excess fructose.",
		accent: "160 120 255",
		group: "diet",
	},
];

/** Health-outcome lenses (inferred from tags & macros unless overridden). */
export const HEALTH_BENEFIT_LENSES: Lens[] = [
	{
		key: "immune",
		label: "Immune Support",
		description:
			"Antioxidants, vitamin C, zinc, fermented foods, and colourful produce for immune support.",
		accent: "120 255 180",
		group: "health",
	},
	{
		key: "energy",
		label: "Energy",
		description:
			"Steady fuel from whole grains, protein, and micronutrients — avoids sugar crashes.",
		accent: "255 220 80",
		group: "health",
	},
	{
		key: "antiInflammatory",
		label: "Anti-Inflammatory",
		description:
			"Omega-3s, antioxidants, and plant-forward patterns; limited processed and red meat.",
		accent: "255 120 80",
		group: "health",
	},
	{
		key: "brainHealth",
		label: "Brain & Memory",
		description:
			"Omega-3 fats, antioxidants, and stable blood sugar for cognitive support.",
		accent: "180 140 255",
		group: "health",
	},
	{
		key: "heartHealth",
		label: "Heart Health",
		description:
			"Healthy fats, fibre, and Mediterranean-style patterns; limited saturated fat.",
		accent: "255 80 120",
		group: "health",
	},
	{
		key: "cholesterol",
		label: "Cholesterol",
		description:
			"Fibre, plant protein, beta-glucan, and portfolio-friendly foods for cholesterol support.",
		accent: "100 200 255",
		group: "health",
	},
	{
		key: "digestion",
		label: "Digestion",
		description:
			"FODMAP-friendly, fermented, and prebiotic foods that support comfortable digestion.",
		accent: "80 220 160",
		group: "health",
	},
	{
		key: "satiety",
		label: "Satiety",
		description:
			"High protein and fibre for lasting fullness; limits empty calories and juice.",
		accent: "200 180 255",
		group: "health",
	},
];

/** All filterable lenses, in display order. */
export const ALL_LENSES: Lens[] = [...DIET_LENSES, ...HEALTH_BENEFIT_LENSES];

/** @deprecated Use ALL_LENSES — kept for existing imports. */
export const DIETS = ALL_LENSES;

/** Lookup lens metadata (label, description, accent) by compatibility key. */
export const LENS_BY_KEY: Record<CompatibilityKey, Lens> = Object.fromEntries(
	ALL_LENSES.map((lens) => [lens.key, lens]),
) as Record<CompatibilityKey, Lens>;

/** Diet columns rendered in explorer tables (subset keeps width manageable). */
export const TABLE_DIET_COLUMNS: { key: DietLensKey; label: string }[] = [
	{ key: "fodmap", label: "FODMAP" },
	{ key: "ibs", label: "IBS" },
	{ key: "mediterranean", label: "Mediterranean" },
	{ key: "portfolio", label: "Portfolio" },
	{ key: "dash", label: "DASH" },
	{ key: "lactoseFree", label: "Lactose" },
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
