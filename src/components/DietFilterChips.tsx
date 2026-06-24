"use client";

import { DIET_LENSES, HEALTH_BENEFIT_LENSES } from "@/data/diets";
import type { CompatibilityKey } from "@/types/food";

type Props = {
	active: Set<CompatibilityKey>;
	onToggle: (key: CompatibilityKey) => void;
};

function ChipRow({
	lenses,
	active,
	onToggle,
}: {
	lenses: typeof DIET_LENSES;
	active: Set<CompatibilityKey>;
	onToggle: (key: CompatibilityKey) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			{lenses.map((lens) => {
				const isActive = active.has(lens.key);
				return (
					<button
						key={lens.key}
						type="button"
						onClick={() => onToggle(lens.key)}
						aria-pressed={isActive}
						style={
							{
								"--chip": `rgb(${lens.accent})`,
								"--chip-a": `rgba(${lens.accent} / 0.16)`,
								"--chip-b": `rgba(${lens.accent} / 0.5)`,
							} as React.CSSProperties
						}
						className={[
							"term-label rounded-full border px-3 py-1.5 transition-all duration-150",
							isActive
								? "border-chip bg-chip-a text-chip shadow-[0_0_16px_-4px_var(--chip)]"
								: "border-panel-edge text-ink-dim hover:border-chip-b hover:text-chip",
						].join(" ")}
					>
						{lens.label}
					</button>
				);
			})}
		</div>
	);
}

/**
 * Diet pattern and health-benefit filter chips. Active chips light up with
 * their lens accent; inactive chips stay glassy with a hover glow.
 */
export default function DietFilterChips({ active, onToggle }: Props) {
	return (
		<div className="flex flex-col gap-3">
			<div>
				<p className="term-label mb-2 text-[10px] uppercase tracking-wider text-ink-faint">
					Diet patterns
				</p>
				<ChipRow
					lenses={DIET_LENSES}
					active={active}
					onToggle={onToggle}
				/>
			</div>
			<div>
				<p className="term-label mb-2 text-[10px] uppercase tracking-wider text-ink-faint">
					Health benefits
				</p>
				<ChipRow
					lenses={HEALTH_BENEFIT_LENSES}
					active={active}
					onToggle={onToggle}
				/>
			</div>
		</div>
	);
}
