import type { CompatibilityStatus } from "@/types/food";

type Props = {
	status: CompatibilityStatus | null | undefined;
	/** When true, show the textual label next to the glyph (used in lists). */
	withLabel?: boolean;
	size?: "sm" | "md";
};

const CONFIG: Record<
	CompatibilityStatus,
	{ glyph: string; label: string; className: string; glow: string }
> = {
	allowed: {
		glyph: "✓",
		label: "Allowed",
		className:
			"text-[var(--color-allowed)] border-[var(--color-allowed)]/40",
		glow: "drop-shadow-[0_0_6px_rgba(57,255,20,0.8)]",
	},
	moderation: {
		glyph: "▲",
		label: "Moderation",
		className:
			"text-[var(--color-moderation)] border-[var(--color-moderation)]/40",
		glow: "drop-shadow-[0_0_6px_rgba(255,196,0,0.8)]",
	},
	avoid: {
		glyph: "✕",
		label: "Avoid",
		className: "text-[var(--color-avoid)] border-[var(--color-avoid)]/40",
		glow: "drop-shadow-[0_0_6px_rgba(255,59,92,0.8)]",
	},
};

/**
 * Renders a single compatibility rating. A null/undefined status is treated as
 * "Unknown" and shown as a dim "?" so incomplete data never breaks the table.
 */
export default function CompatibilityIcon({
	status,
	withLabel = false,
	size = "md",
}: Props) {
	const dim = size === "sm" ? "h-5 w-5 text-xs" : "h-6 w-6 text-sm";

	if (status === null || status === undefined) {
		return (
			<span className="inline-flex items-center gap-1.5" title="Unknown">
				<span
					className={`inline-flex ${dim} items-center justify-center rounded-md border border-ink-faint/30 text-ink-faint`}
				>
					?
				</span>
				{withLabel && (
					<span className="text-xs text-ink-faint">Unknown</span>
				)}
			</span>
		);
	}

	const config = CONFIG[status];

	return (
		<span className="inline-flex items-center gap-1.5" title={config.label}>
			<span
				className={`inline-flex ${dim} items-center justify-center rounded-md border bg-white/2 font-bold ${config.className} ${config.glow}`}
			>
				{config.glyph}
			</span>
			{withLabel && (
				<span className={`text-xs ${config.className.split(" ")[0]}`}>
					{config.label}
				</span>
			)}
		</span>
	);
}
