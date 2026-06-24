"use client";

import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import { CATEGORIES } from "@/data/categories";
import { NUTRITION_KEYS, NUTRITION_RANGES, PROPERTY_OPTIONS } from "@/lib/food";
import type { NutritionKey } from "@/types/food";

type NutritionBounds = { min: number; max: number };

type Props = {
	categories: Set<string>;
	onToggleCategory: (id: string) => void;
	properties: Set<string>;
	onToggleProperty: (id: string) => void;
	/** Active min..max range per nutrient. */
	nutritionRange: Record<NutritionKey, NutritionBounds>;
	onNutritionChange: (key: NutritionKey, bounds: NutritionBounds) => void;
	onReset: () => void;
	/** Whether the sidebar is collapsed (accordion on mobile, rail on desktop). */
	collapsed: boolean;
	onToggleCollapsed: () => void;
};

export default function FilterSidebar({
	categories,
	onToggleCategory,
	properties,
	onToggleProperty,
	nutritionRange,
	onNutritionChange,
	onReset,
	collapsed,
	onToggleCollapsed,
}: Props) {
	return (
		<CollapsibleSidebar
			side="left"
			title="Filters"
			expandedWidthClass="lg:w-64"
			collapsed={collapsed}
			onToggleCollapsed={onToggleCollapsed}
		>
			<div className="px-4 pb-4">
				<div className="flex items-center justify-between">
					<h2 className="term-label flex items-center gap-2 text-neon-pink">
						<span>⛃</span> Filters
					</h2>
					<button
						type="button"
						onClick={onReset}
						className="term-label text-ink-faint transition-colors hover:text-neon-pink"
					>
						Reset All
					</button>
				</div>

				{/* Food properties */}
				<Section title="Food Properties">
					<div className="grid grid-cols-1 gap-0.5">
						{PROPERTY_OPTIONS.map((prop) => {
							const checked = properties.has(prop.id);
							return (
								<label
									key={prop.id}
									className="group flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-white/3"
								>
									<input
										type="checkbox"
										checked={checked}
										onChange={() =>
											onToggleProperty(prop.id)
										}
										className="peer sr-only"
									/>
									<span className="flex h-4 w-4 items-center justify-center rounded border border-panel-edge text-[10px] text-transparent transition-all peer-checked:border-neon-green peer-checked:bg-neon-green/20 peer-checked:text-neon-green peer-checked:shadow-[0_0_10px_-2px_var(--color-neon-green)]">
										✓
									</span>
									<span
										className={`text-sm transition-colors ${
											checked
												? "text-neon-green"
												: "text-ink-dim group-hover:text-ink"
										}`}
									>
										{prop.label}
									</span>
								</label>
							);
						})}
					</div>
				</Section>

				{/* Categories */}
				<Section title="Categories">
					<ul className="flex flex-col gap-0.5">
						{CATEGORIES.map((cat) => {
							const checked = categories.has(cat.id);
							return (
								<li key={cat.id}>
									<label
										className="group flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-white/3"
										style={
											{
												"--accent": `rgb(${cat.accent})`,
											} as React.CSSProperties
										}
									>
										<input
											type="checkbox"
											checked={checked}
											onChange={() =>
												onToggleCategory(cat.id)
											}
											className="peer sr-only"
										/>
										<span className="flex h-4 w-4 items-center justify-center rounded border border-panel-edge text-[10px] text-transparent transition-all peer-checked:border-accent peer-checked:bg-accent/20 peer-checked:text-accent peer-checked:shadow-[0_0_10px_-2px_var(--accent)]">
											✓
										</span>
										<span
											className="h-2.5 w-2.5 rounded-full"
											style={{
												background: `rgb(${cat.accent})`,
												boxShadow: `0 0 8px rgb(${cat.accent} / 0.8)`,
											}}
										/>
										<span
											className={`text-sm transition-colors ${
												checked
													? "text-ink"
													: "text-ink-dim group-hover:text-ink"
											}`}
										>
											{cat.label}
										</span>
									</label>
								</li>
							);
						})}
					</ul>
				</Section>

				{/* Nutrition sliders */}
				<Section title="Nutrition (range)">
					<div className="flex flex-col gap-4">
						{NUTRITION_KEYS.map((key) => (
							<NutritionSlider
								key={key}
								nutritionKey={key}
								value={nutritionRange[key]}
								onChange={(bounds) =>
									onNutritionChange(key, bounds)
								}
							/>
						))}
					</div>
				</Section>
			</div>
		</CollapsibleSidebar>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="mt-5">
			<div className="neon-rule mb-3" />
			<h3 className="term-label mb-2.5 text-ink-faint">{title}</h3>
			{children}
		</section>
	);
}

/** Trim trailing ".0" so slider read-outs stay compact (e.g. 2.5, 10). */
function fmtBound(value: number): string {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * Dual-handle nutrition range slider. Two overlapping native range inputs share
 * a custom rail + neon fill; the green thumb sets the minimum and the pink thumb
 * sets the maximum. Handles are clamped so they cannot cross.
 */
function NutritionSlider({
	nutritionKey,
	value,
	onChange,
}: {
	nutritionKey: NutritionKey;
	value: NutritionBounds;
	onChange: (bounds: NutritionBounds) => void;
}) {
	const range = NUTRITION_RANGES[nutritionKey];
	const { min, max } = value;
	const isFull = min <= range.min && max >= range.max;
	const span = range.max - range.min || 1;
	const minPct = ((min - range.min) / span) * 100;
	const maxPct = ((max - range.min) / span) * 100;

	const setMin = (raw: number) => {
		const clamped = Math.min(Math.max(raw, range.min), max - range.step);
		onChange({ min: clamped, max });
	};
	const setMax = (raw: number) => {
		const clamped = Math.max(Math.min(raw, range.max), min + range.step);
		onChange({ min, max: clamped });
	};

	return (
		<div>
			<div className="mb-1.5 flex items-baseline justify-between">
				<span className="text-xs text-ink-dim">{range.label}</span>
				<span className="font-mono text-xs text-neon-pink">
					{isFull ? "any" : `${fmtBound(min)}–${fmtBound(max)}`}
					<span className="ml-1 text-ink-faint">{range.unit}</span>
				</span>
			</div>
			<div className="dual-range-track relative h-4">
				<span className="dual-range-rail" />
				<span
					className="dual-range-fill"
					style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
				/>
				<input
					type="range"
					className="dual-range dual-range--min"
					min={range.min}
					max={range.max}
					step={range.step}
					value={min}
					onChange={(e) => setMin(Number(e.target.value))}
					aria-label={`Minimum ${range.label}`}
				/>
				<input
					type="range"
					className="dual-range dual-range--max"
					min={range.min}
					max={range.max}
					step={range.step}
					value={max}
					onChange={(e) => setMax(Number(e.target.value))}
					aria-label={`Maximum ${range.label}`}
				/>
			</div>
		</div>
	);
}
