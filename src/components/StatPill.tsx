type Tone = "pink" | "green" | "amber" | "cyan" | "neutral";

type Props = {
	label: string;
	value: string | number;
	unit?: string;
	tone?: Tone;
	/** Compact variant used inside dense summaries. */
	size?: "sm" | "md";
};

const TONE_CLASSES: Record<Tone, string> = {
	pink: "border-[var(--color-neon-pink)]/40 text-[var(--color-neon-pink)] shadow-[0_0_18px_-8px_rgba(255,45,149,0.8)]",
	green: "border-[var(--color-neon-green)]/40 text-[var(--color-neon-green)] shadow-[0_0_18px_-8px_rgba(57,255,20,0.8)]",
	amber: "border-[var(--color-moderation)]/40 text-[var(--color-moderation)] shadow-[0_0_18px_-8px_rgba(255,196,0,0.8)]",
	cyan: "border-[#38bdff]/40 text-[#7ad4ff] shadow-[0_0_18px_-8px_rgba(56,189,255,0.8)]",
	neutral: "border-[var(--color-ink-faint)]/30 text-[var(--color-ink)]",
};

/**
 * A glowing stat capsule used for summary numbers (totals, scores, etc.).
 */
export default function StatPill({
	label,
	value,
	unit,
	tone = "neutral",
	size = "md",
}: Props) {
	const pad = size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2";
	return (
		<div
			className={`flex flex-col rounded-lg border bg-white/0.015 ${pad} ${TONE_CLASSES[tone]}`}
		>
			<span className="term-label text-ink-dim">{label}</span>
			<span className="mt-0.5 font-mono font-semibold leading-none">
				<span className={size === "sm" ? "text-base" : "text-lg"}>
					{value}
				</span>
				{unit && (
					<span className="ml-1 text-xs text-ink-dim">{unit}</span>
				)}
			</span>
		</div>
	);
}
