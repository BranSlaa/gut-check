import type { CompatibilityStatus, Food, HealthBenefitKey } from "@/types/food";

type FoodContext = {
	tags: Set<string>;
	protein: number;
	fiber: number;
	carbs: number;
	fat: number;
	calories: number;
	category: string;
	compat: Food["compatibility"];
};

function ctx(food: Food): FoodContext {
	return {
		tags: new Set(food.tags ?? []),
		protein: food.protein ?? 0,
		fiber: food.fiber ?? 0,
		carbs: food.carbs ?? 0,
		fat: food.fat ?? 0,
		calories: food.calories ?? 0,
		category: food.category ?? "",
		compat: food.compatibility,
	};
}

function has(c: FoodContext, tag: string): boolean {
	return c.tags.has(tag);
}

function scoreToStatus(score: number): CompatibilityStatus {
	if (score >= 2) return "allowed";
	if (score <= -2) return "avoid";
	return "moderation";
}

/** Shared penalties for ultra-processed / gut-unfriendly patterns. */
function processedPenalty(c: FoodContext): number {
	let s = 0;
	if (has(c, "added-sugar")) s -= 2;
	if (has(c, "alcohol")) s -= 3;
	if (has(c, "sugar-alcohol")) s -= 1;
	if (has(c, "refined-grain")) s -= 1;
	if (c.compat?.mediterranean === "avoid") s -= 2;
	if (c.compat?.gutHealthy === "avoid") s -= 2;
	return s;
}

/** Purine / gout signals from food tags and explicit diet ratings. */
function goutPenalty(c: FoodContext): number {
	let s = 0;
	if (has(c, "high-purine")) s -= 3;
	if (has(c, "moderate-purine")) s -= 1;
	if (has(c, "gout-friendly") || has(c, "cherry")) s += 2;
	if (has(c, "low-fat-dairy")) s += 1;
	if (c.compat?.gout === "avoid") s -= 2;
	if (c.compat?.gout === "allowed") s += 1;
	return s;
}

/** Sodium / DASH signals from food tags and explicit diet ratings. */
function dashPenalty(c: FoodContext): number {
	let s = 0;
	if (has(c, "high-sodium")) s -= 3;
	if (has(c, "potassium")) s += 2;
	if (has(c, "low-fat-dairy")) s += 1;
	if (has(c, "whole-grain") || has(c, "high-fiber")) s += 1;
	if (c.compat?.dash === "avoid") s -= 2;
	if (c.compat?.dash === "allowed") s += 1;
	return s;
}

/** Lactose / dairy signals from food tags and explicit diet ratings. */
function lactoseFreePenalty(c: FoodContext): number {
	let s = 0;
	if (has(c, "lactose-free") || has(c, "dairy-free")) s += 2;
	if (has(c, "lactose")) s -= 3;
	if (c.compat?.lactoseFree === "avoid") s -= 2;
	if (c.compat?.lactoseFree === "allowed") s += 1;
	return s;
}

function inferImmune(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (has(c, "antioxidant")) s += 2;
	if (has(c, "vitamin-c")) s += 2;
	if (has(c, "vitamin-e")) s += 1;
	if (has(c, "beta-carotene")) s += 2;
	if (has(c, "probiotic") || has(c, "fermented")) s += 2;
	if (has(c, "prebiotic") || has(c, "high-fiber")) s += 1;
	if (has(c, "anti-inflammatory")) s += 1;
	if (has(c, "zinc")) s += 1;
	if (has(c, "iron")) s += 1;
	if (c.category === "fruits" || c.category === "vegetables") s += 1;
	if (c.category === "herbs") s += 1;
	s += processedPenalty(c);
	s += goutPenalty(c);
	if (has(c, "lactose") && c.compat?.fodmap === "avoid") s -= 1;
	return scoreToStatus(s);
}

function inferEnergy(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (has(c, "whole-grain") || has(c, "beta-glucan")) s += 2;
	if (has(c, "complete-protein")) s += 2;
	if (has(c, "potassium")) s += 1;
	if (has(c, "iron")) s += 1;
	if (c.fiber >= 3) s += 1;
	if (c.protein >= 8) s += 1;
	if (c.category === "grains" && !has(c, "refined-grain")) s += 1;
	if (has(c, "added-sugar")) s -= 3;
	if (has(c, "fruit-juice")) s -= 2;
	if (has(c, "alcohol")) s -= 2;
	if (c.calories >= 400 && c.fiber < 2 && c.protein < 5) s -= 1;
	if (has(c, "dried-fruit") && has(c, "excess-fructose")) s -= 1;
	return scoreToStatus(s);
}

function inferAntiInflammatory(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (has(c, "anti-inflammatory")) s += 3;
	if (has(c, "omega-3")) s += 3;
	if (has(c, "monounsaturated")) s += 2;
	if (has(c, "antioxidant")) s += 1;
	if (has(c, "curcumin")) s += 2;
	if (c.category === "fats" && has(c, "monounsaturated")) s += 2;
	if (c.category === "vegetables" || c.category === "fruits") s += 1;
	if (has(c, "saturated")) s -= 2;
	if (has(c, "red-meat")) s -= 2;
	if (has(c, "added-sugar")) s -= 2;
	if (has(c, "alcohol")) s -= 2;
	if (c.compat?.mediterranean === "avoid") s -= 2;
	s += goutPenalty(c);
	return scoreToStatus(s);
}

function inferBrainHealth(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (has(c, "omega-3")) s += 3;
	if (has(c, "antioxidant")) s += 2;
	if (has(c, "lignans")) s += 1;
	if (c.category === "nuts") s += 2;
	if (c.category === "proteins" && has(c, "omega-3")) s += 2;
	if (c.category === "fruits" && has(c, "antioxidant")) s += 1;
	if (c.protein >= 10) s += 1;
	if (has(c, "added-sugar")) s -= 3;
	if (has(c, "alcohol")) s -= 3;
	if (has(c, "fruit-juice")) s -= 1;
	if (c.compat?.keto === "avoid" && c.carbs >= 60 && !c.fiber) s -= 1;
	return scoreToStatus(s);
}

function inferHeartHealth(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (c.compat?.mediterranean === "allowed") s += 2;
	if (c.compat?.portfolio === "allowed") s += 2;
	if (has(c, "omega-3")) s += 2;
	if (has(c, "monounsaturated")) s += 2;
	if (has(c, "high-fiber")) s += 1;
	if (has(c, "whole-grain")) s += 1;
	if (c.category === "vegetables" || c.category === "fruits") s += 1;
	if (has(c, "saturated")) s -= 2;
	if (has(c, "red-meat")) s -= 2;
	if (c.compat?.portfolio === "avoid") s -= 2;
	if (has(c, "added-sugar")) s -= 1;
	if (has(c, "alcohol")) s -= 1;
	s += goutPenalty(c);
	s += dashPenalty(c);
	return scoreToStatus(s);
}

function inferCholesterol(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (c.compat?.portfolio === "allowed") s += 3;
	if (has(c, "beta-glucan")) s += 2;
	if (has(c, "high-fiber")) s += 2;
	if (has(c, "plant-protein")) s += 2;
	if (has(c, "omega-3")) s += 1;
	if (has(c, "monounsaturated")) s += 1;
	if (c.category === "nuts") s += 1;
	if (c.compat?.portfolio === "avoid") s -= 3;
	if (has(c, "saturated")) s -= 2;
	if (has(c, "red-meat")) s -= 2;
	if (has(c, "lactose") && c.fat >= 20) s -= 1;
	if (c.category === "dairy" && c.fat >= 25) s -= 2;
	return scoreToStatus(s);
}

function inferDigestion(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (has(c, "digestive")) s += 3;
	if (has(c, "probiotic") || has(c, "fermented")) s += 2;
	if (has(c, "prebiotic")) s += 2;
	if (c.compat?.fodmap === "allowed") s += 2;
	if (c.compat?.gutHealthy === "allowed") s += 1;
	if (c.fiber >= 3 && c.fiber <= 15) s += 1;
	if (c.compat?.fodmap === "avoid") s -= 3;
	if (has(c, "lactose")) s -= 2;
	if (has(c, "galactans")) s -= 2;
	if (has(c, "polyols")) s -= 2;
	if (c.fat >= 40) s -= 1;
	if (has(c, "alcohol")) s -= 2;
	s += lactoseFreePenalty(c);
	return scoreToStatus(s);
}

function inferSatiety(c: FoodContext): CompatibilityStatus {
	let s = 0;
	if (has(c, "high-protein")) s += 2;
	if (has(c, "high-fiber")) s += 2;
	if (c.protein >= 12) s += 2;
	if (c.fiber >= 5) s += 2;
	if (c.protein >= 6 && c.fiber >= 2) s += 1;
	if (c.calories > 0 && c.calories <= 100 && c.fiber >= 2) s += 1;
	if (c.category === "vegetables") s += 1;
	if (has(c, "fruit-juice")) s -= 3;
	if (has(c, "added-sugar") && c.protein < 3) s -= 2;
	if (c.calories >= 300 && c.protein < 5 && c.fiber < 2) s -= 2;
	if (has(c, "alcohol")) s -= 1;
	return scoreToStatus(s);
}

const INFERERS: Record<
	HealthBenefitKey,
	(c: FoodContext) => CompatibilityStatus
> = {
	immune: inferImmune,
	energy: inferEnergy,
	antiInflammatory: inferAntiInflammatory,
	brainHealth: inferBrainHealth,
	heartHealth: inferHeartHealth,
	cholesterol: inferCholesterol,
	digestion: inferDigestion,
	satiety: inferSatiety,
};

/**
 * Derive a health-benefit rating from tags, macros, category, and existing
 * diet compatibility. Used when a food has no explicit value for the lens.
 */
export function inferHealthBenefit(
	food: Food,
	key: HealthBenefitKey,
): CompatibilityStatus {
	return INFERERS[key](ctx(food));
}
