"use client";

import { useId } from "react";

import { DOSHA_META, ELEMENT_COLORS } from "@/data/ayurveda/doshas";
import type { Dosha } from "@/types/ayurveda";

type Props = {
	dosha: Dosha;
	size?: "sm" | "md";
};

/** Match compatibility icon footprint (h-5 / h-6). */
const SIZE = { sm: 20, md: 24 } as const;

const GLYPH = "#ffffff";
const GLYPH_STROKE = 2;

/**
 * Circular dosha glyph — two elements on a 45° diagonal split.
 * Vata: ether spiral + air waves · Pitta: flame + waves · Kapha: plant + waves.
 */
export default function DoshaIcon({ dosha, size = "sm" }: Props) {
	const px = SIZE[size];
	const meta = DOSHA_META[dosha];
	const [first, second] = meta.elements;
	const uid = useId().replace(/:/g, "");

	return (
		<svg
			width={px}
			height={px}
			viewBox="0 0 24 24"
			className="shrink-0"
			aria-hidden
			shapeRendering="geometricPrecision"
		>
			<defs>
				<clipPath id={`${uid}-circle`}>
					<circle cx="12" cy="12" r="11" />
				</clipPath>
				<clipPath id={`${uid}-ul`}>
					<path d="M0 0 L24 0 L0 24 Z" />
				</clipPath>
				<clipPath id={`${uid}-lr`}>
					<path d="M24 0 L24 24 L0 24 Z" />
				</clipPath>
			</defs>

			<g clipPath={`url(#${uid}-circle)`}>
				<g clipPath={`url(#${uid}-ul)`}>
					<rect width="24" height="24" fill={ELEMENT_COLORS[first]} />
					<ElementGlyph element={first} region="ul" />
				</g>
				<g clipPath={`url(#${uid}-lr)`}>
					<rect width="24" height="24" fill={ELEMENT_COLORS[second]} />
					<ElementGlyph element={second} region="lr" />
				</g>
			</g>

			<circle
				cx="12"
				cy="12"
				r="11"
				fill="none"
				stroke={`rgba(${meta.accent} / 0.65)`}
				strokeWidth="1"
			/>
		</svg>
	);
}

function ElementGlyph({
	element,
	region,
}: {
	element: "ether" | "air" | "fire" | "water" | "earth";
	region: "ul" | "lr";
}) {
	/** Centroid of each diagonal half — glyphs are drawn around these anchors. */
	const anchor = region === "ul" ? "translate(7.5 7.5)" : "translate(16.5 16.5)";

	switch (element) {
		case "ether":
			return (
				<g transform={anchor}>
					<path
						d="M 0 2.5 C 0 -0.5 3 -1 4 1.5 C 5 4 3 5.5 1 4.5 C -1 3.5 0 1 1.5 0.5 C 2.5 0 3.5 0.8 3 2"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			);
		case "air":
			return (
				<g transform={anchor}>
					<path
						d="M -5 0 Q -2.5 -1.8 0 0 Q 2.5 1.8 5 0"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
					<path
						d="M -5 2.8 Q -2.5 1 0 2.8 Q 2.5 4.6 5 2.8"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
					<path
						d="M -5 5.6 Q -2.5 3.8 0 5.6 Q 2.5 7.4 5 5.6"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
				</g>
			);
		case "fire":
			return (
				<g transform={anchor}>
					<path
						d="M 0 -5.5 C 2.8 -1.5 3.2 1.5 2 4 C 1.2 5.5 0 5.8 -1 4 C -2.8 1.5 -2.4 -1.5 0 -5.5 Z"
						fill={GLYPH}
					/>
					<path
						d="M 0 -3 C 1 0 0.8 2 0 3.2 C -0.8 2 -1 0 0 -3 Z"
						fill={ELEMENT_COLORS.fire}
						opacity="0.55"
					/>
				</g>
			);
		case "water":
			return (
				<g transform={anchor}>
					<path
						d="M -5.5 -1 Q -2.5 -2.8 0 -1 Q 2.5 0.8 5.5 -1"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
					<path
						d="M -5.5 2 Q -2.5 0.2 0 2 Q 2.5 3.8 5.5 2"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
					<path
						d="M -5.5 5 Q -2.5 3.2 0 5 Q 2.5 6.8 5.5 5"
						fill="none"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
				</g>
			);
		case "earth":
			return (
				<g transform={anchor}>
					<path
						d="M 0 5.5 L 0 -1"
						stroke={GLYPH}
						strokeWidth={GLYPH_STROKE}
						strokeLinecap="round"
					/>
					<path
						d="M 0 0.5 C -3.5 -1.5 -4.5 2 -1.5 3.5 C 0 4.5 0 0.5 0 0.5 Z"
						fill={GLYPH}
					/>
					<path
						d="M 0 0.5 C 3.5 -1.5 4.5 2 1.5 3.5 C 0 4.5 0 0.5 0 0.5 Z"
						fill={GLYPH}
					/>
				</g>
			);
	}
}
