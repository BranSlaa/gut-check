"use client";

import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import StatPill from "@/components/StatPill";
import { computeTotals, fmtNum } from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	selected: Food[];
	onRemove: (id: string) => void;
	onClear: () => void;
	/** Open the meal plan dashboard for the current selection. */
	onViewMealPlan: () => void;
	/** Push the current selection onto the shopping list. */
	onAddToShoppingList: () => void;
	/** Whether the flyout is collapsed (accordion on mobile, rail on desktop). */
	collapsed: boolean;
	onToggleCollapsed: () => void;
};

/**
 * Right-hand flyout listing selected foods, live totals (null-safe), action
 * buttons and a placeholder meal-plan preview. Sticky on desktop.
 */
export default function SelectedFoodsFlyout({
	selected,
	onRemove,
	onClear,
	onViewMealPlan,
	onAddToShoppingList,
	collapsed,
	onToggleCollapsed,
}: Props) {
	const totals = computeTotals(selected);
	const hasSelection = selected.length > 0;

	const badge = (
		<span className="rounded-full bg-neon-pink/15 px-2 py-0.5 font-mono text-[11px] text-neon-pink">
			{totals.count}
		</span>
	);

	return (
		<CollapsibleSidebar
			side="right"
			title="Selected"
			badge={badge}
			expandedWidthClass="lg:w-72"
			panelClassName="neon-panel-pink"
			collapsed={collapsed}
			onToggleCollapsed={onToggleCollapsed}
		>
			<div className="flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-4 pb-3">
					<h2 className="term-label flex items-center gap-2 text-neon-pink">
						Selected
						<span className="rounded-full bg-neon-pink/15 px-2 py-0.5 text-neon-pink">
							{totals.count}
						</span>
					</h2>
					{hasSelection && (
						<button
							type="button"
							onClick={onClear}
							className="term-label text-ink-faint transition-colors hover:text-neon-pink"
						>
							Clear
						</button>
					)}
				</div>

				<div className="neon-rule" />

				{/* Selected list */}
				<div className="px-3 py-3">
					{!hasSelection ? (
						<div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
							<span className="font-mono text-2xl text-ink-faint">
								[ ]
							</span>
							<p className="text-xs text-ink-dim">
								Select foods from the tables to start building a
								plan.
							</p>
						</div>
					) : (
						<ul className="flex flex-col gap-1.5">
							{selected.map((food) => (
								<li
									key={food.id}
									className="group flex items-center gap-2 rounded-lg border border-panel-edge bg-white/2 px-2.5 py-2 transition-colors hover:border-neon-pink/40"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm text-ink">
											{food.name}
										</p>
										<p className="font-mono text-[11px] text-ink-dim">
											{fmtNum(food.calories)} kcal
										</p>
									</div>
									<button
										type="button"
										aria-label={`Remove ${food.name}`}
										onClick={() => onRemove(food.id)}
										className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-ink-faint transition-colors hover:border-avoid/50 hover:text-avoid"
									>
										✕
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Summary totals */}
				<div className="px-3">
					<div className="neon-rule" />
					<div className="grid grid-cols-2 gap-2 py-3">
						<StatPill
							label="Items"
							value={totals.count}
							tone="pink"
							size="sm"
						/>
						<StatPill
							label="Est. Calories"
							value={
								hasSelection ? fmtNum(totals.calories, 0) : "—"
							}
							unit="kcal"
							tone="green"
							size="sm"
						/>
						<StatPill
							label="Est. Protein"
							value={hasSelection ? fmtNum(totals.protein) : "—"}
							unit="g"
							tone="cyan"
							size="sm"
						/>
						<StatPill
							label="Est. Fiber"
							value={hasSelection ? fmtNum(totals.fiber) : "—"}
							unit="g"
							tone="amber"
							size="sm"
						/>
					</div>
					{hasSelection && totals.withData < totals.count && (
						<p className="pb-2 text-[11px] text-ink-faint">
							Totals reflect {totals.withData} of {totals.count}{" "}
							items with nutrition data.
						</p>
					)}
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-2 px-3 pb-3">
					<button
						type="button"
						disabled={!hasSelection}
						onClick={onViewMealPlan}
						className="rounded-lg border border-neon-green/50 bg-neon-green/10 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-neon-green shadow-[0_0_18px_-6px_var(--color-neon-green)] transition-all hover:bg-neon-green/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
					>
						View Meal Plan →
					</button>
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							disabled={!hasSelection}
							onClick={onAddToShoppingList}
							className="rounded-lg border border-panel-edge py-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim transition-colors hover:border-neon-pink/50 hover:text-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
						>
							+ Shopping List
						</button>
						<button
							type="button"
							disabled={!hasSelection}
							onClick={onClear}
							className="rounded-lg border border-panel-edge py-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim transition-colors hover:border-avoid/50 hover:text-avoid disabled:cursor-not-allowed disabled:opacity-40"
						>
							Clear All
						</button>
					</div>
				</div>

				{/* Meal plan preview */}
				<div className="px-3 pb-4">
					<div className="neon-rule mb-3" />
					<h3 className="term-label mb-2 flex items-center justify-between text-ink-faint">
						<span>Meal Plan Preview</span>
						<span className="text-neon-pink">⌕</span>
					</h3>
					<div className="grid grid-cols-2 gap-2">
						{MEAL_SLOTS.map((slot) => (
							<MealSlot key={slot} label={slot} />
						))}
					</div>
				</div>
			</div>
		</CollapsibleSidebar>
	);
}

const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

function MealSlot({ label }: { label: string }) {
	return (
		<div className="rounded-lg border border-dashed border-panel-edge bg-white/1 px-2.5 py-2">
			<p className="term-label mb-1 text-ink-faint">{label}</p>
			<p className="font-mono text-[11px] text-ink-faint/70">empty</p>
		</div>
	);
}
