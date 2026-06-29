import type { Dosha, Element } from "@/types/ayurveda";

export type DoshaMeta = {
	key: Dosha;
	label: string;
	/** The two elements that compose this dosha. */
	elements: [Element, Element];
	/** Neon accent as an "r g b" triplet. */
	accent: string;
	/** Short tooltip shown on the dosha badge. */
	tooltip: string;
};

/** Fill colours for elemental halves in dosha icons. */
export const ELEMENT_COLORS: Record<Element, string> = {
	ether: "#9b82d4",
	air: "#4a7fb8",
	fire: "#e8752a",
	water: "#4cb8c9",
	earth: "#6db56d",
};

/** Display metadata for Vata, Pitta, and Kapha. */
export const DOSHA_META: Record<Dosha, DoshaMeta> = {
	vata: {
		key: "vata",
		label: "Vata",
		elements: ["ether", "air"],
		accent: "180 160 255",
		tooltip:
			"Vata (Ether & Air) — cool, dry, light. This food is pacifying for Vata constitutions.",
	},
	pitta: {
		key: "pitta",
		label: "Pitta",
		elements: ["fire", "water"],
		accent: "255 120 64",
		tooltip:
			"Pitta (Fire & Water) — hot, sharp, light. This food is pacifying for Pitta constitutions.",
	},
	kapha: {
		key: "kapha",
		label: "Kapha",
		elements: ["earth", "water"],
		accent: "100 200 140",
		tooltip:
			"Kapha (Earth & Water) — heavy, oily, cool. This food is pacifying for Kapha constitutions.",
	},
};

export const DOSHA_LIST: DoshaMeta[] = Object.values(DOSHA_META);
