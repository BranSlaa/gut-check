/** Ayurvedic constitution types — foods may pacify one or more doshas. */
export const DOSHA_KEYS = ["vata", "pitta", "kapha"] as const;

export type Dosha = (typeof DOSHA_KEYS)[number];

/** Pancha-mahabhuta (five great elements). */
export const ELEMENT_KEYS = [
	"ether",
	"air",
	"fire",
	"water",
	"earth",
] as const;

export type Element = (typeof ELEMENT_KEYS)[number];
