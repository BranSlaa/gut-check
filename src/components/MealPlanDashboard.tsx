"use client";

import CompatibilityIcon from "@/components/CompatibilityIcon";
import StatPill from "@/components/StatPill";
import { DIETS } from "@/data/diets";
import {
	computeDietBreakdowns,
	computeTotals,
	countAllowed,
	fmtNum,
	getCompatibility,
	type DietBreakdown,
} from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	/** Foods that make up the plan (the current selection). */
	foods: Food[];
	/** Jump back to the explorer to add/adjust foods. */
	onBrowse: () => void;
	/** Push every plan item onto the shopping list. */
	onAddAllToShoppingList: () => void;
	/** How many of the plan's foods are already on the shopping list. */
	alreadyOnListCount: number;
};

/**
 * Read-only dashboard summarising the selected foods: macro totals, a per-diet
 * tally of the existing allowed/moderation/avoid ratings, and a per-food
 * compatibility matrix. AI recipe generation is stubbed as a clearly-labelled
 * coming-soon action.
 */
export default function MealPlanDashboard({
	foods,
	onBrowse,
	onAddAllToShoppingList,
	alreadyOnListCount,
}: Props) {
	const totals = computeTotals(foods);
	const dietBreakdowns = computeDietBreakdowns(foods);
	const hasFoods = foods.length > 0;

	if (!hasFoods) {
		return (
			<main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
				<div className="neon-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
					<span className="font-mono text-4xl text-neon-green">
						◇
					</span>
					<h1 className="font-mono text-lg text-ink">
						Your meal plan is empty
					</h1>
					<p className="max-w-sm text-sm text-ink-dim">
						Head back to the explorer and select a few foods. Your
						plan will summarise their macros and diet friendliness
						here.
					</p>
					<button
						type="button"
						onClick={onBrowse}
						className="mt-2 rounded-lg border border-neon-green/50 bg-neon-green/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-neon-green shadow-[0_0_18px_-6px_var(--color-neon-green)] transition-all hover:bg-neon-green/20"
					>
						← Browse Foods
					</button>
				</div>
			</main>
		);
	}

	const allOnList = alreadyOnListCount >= foods.length;

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="term-label text-ink-faint">Meal Plan</p>
					<h1 className="mt-1 font-mono text-2xl font-bold text-ink">
						<span className="glow-green">{foods.length}</span> food
						{foods.length === 1 ? "" : "s"} in your plan
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={onBrowse}
						className="rounded-lg border border-panel-edge px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim transition-colors hover:border-neon-green/50 hover:text-neon-green"
					>
						← Edit Foods
					</button>
					<button
						type="button"
						onClick={onAddAllToShoppingList}
						disabled={allOnList}
						className="rounded-lg border border-neon-pink/50 bg-neon-pink/10 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-neon-pink shadow-[0_0_18px_-8px_var(--color-neon-pink)] transition-all hover:bg-neon-pink/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
					>
						{allOnList
							? "On Shopping List ✓"
							: "+ Add to Shopping List"}
					</button>
				</div>
			</div>

			{/* Macro summary */}
			<section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
				<StatPill label="Items" value={totals.count} tone="pink" />
				<StatPill
					label="Calories"
					value={fmtNum(totals.calories, 0)}
					unit="kcal"
					tone="green"
				/>
				<StatPill
					label="Protein"
					value={fmtNum(totals.protein)}
					unit="g"
					tone="cyan"
				/>
				<StatPill
					label="Carbs"
					value={fmtNum(totals.carbs)}
					unit="g"
					tone="neutral"
				/>
				<StatPill
					label="Fat"
					value={fmtNum(totals.fat)}
					unit="g"
					tone="amber"
				/>
				<StatPill
					label="Fiber"
					value={fmtNum(totals.fiber)}
					unit="g"
					tone="green"
				/>
			</section>
			{totals.withData < totals.count && (
				<p className="-mt-3 text-[11px] text-ink-faint">
					Totals reflect {totals.withData} of {totals.count} items
					with logged nutrition data.
				</p>
			)}

			{/* Diet friendliness — factual tally of existing ratings */}
			<section className="neon-panel p-4">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-y-2">
					<h2 className="term-label text-neon-green">
						Diet Friendliness
					</h2>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint">
						{RATING_SEGMENTS.map((seg) => (
							<span
								key={seg.label}
								className="flex items-center gap-1.5"
							>
								<span
									aria-hidden
									className="h-2 w-2 rounded-sm"
									style={{ background: seg.fill }}
								/>
								{seg.label}
							</span>
						))}
					</div>
				</div>
				<div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
					{dietBreakdowns.map((diet) => (
						<DietBreakdownRow key={diet.key} diet={diet} />
					))}
				</div>
			</section>

			{/* Compatibility matrix */}
			<section className="neon-panel overflow-hidden">
				<div className="flex items-center justify-between border-b border-panel-edge px-4 py-3">
					<h2 className="term-label text-neon-pink">
						Food Compatibility
					</h2>
					<span className="font-mono text-[11px] text-ink-faint">
						✓ allowed · ▲ moderation · ✕ avoid · ? unknown
					</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[640px] text-sm">
						<thead>
							<tr className="bg-white/2">
								<th className="term-label px-4 py-2.5 text-left text-ink-faint">
									Food
								</th>
								{DIETS.map((diet) => (
									<th
										key={diet.key}
										className="term-label px-2 py-2.5 text-center text-ink-faint"
										style={{ color: `rgb(${diet.accent})` }}
									>
										{diet.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{foods.map((food) => (
								<tr
									key={food.id}
									className="border-t border-panel-edge/60 transition-colors hover:bg-white/2"
								>
									<td className="px-4 py-2.5">
										<p className="text-ink">{food.name}</p>
										<p className="font-mono text-[11px] text-ink-faint">
											{countAllowed(food)} allowed ·{" "}
											{fmtNum(food.calories, 0)} kcal
										</p>
									</td>
									{DIETS.map((diet) => (
										<td
											key={diet.key}
											className="px-2 py-2.5 text-center"
										>
											<span className="inline-flex justify-center">
												<CompatibilityIcon
													status={getCompatibility(
														food,
														diet.key,
													)}
													size="sm"
												/>
											</span>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* AI recipes — coming soon */}
			<section className="neon-panel-green neon-panel flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="term-label mb-1 text-neon-green">
						AI Recipes
					</h2>
					<p className="max-w-xl text-sm text-ink-dim">
						Next up: turn these ingredients into delicious,
						diet-aware recipes generated for your gut. Pick your
						foods now — the kitchen opens soon.
					</p>
				</div>
				<button
					type="button"
					disabled
					className="shrink-0 cursor-not-allowed rounded-lg border border-neon-green/30 bg-neon-green/5 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-neon-green/60"
				>
					Generate Recipes · soon
				</button>
			</section>
		</main>
	);
}

/**
 * Shared definition of the four rating buckets, in stack order. Fills are
 * deliberately translucent so the bars read as tinted glass; text colours are
 * a touch brighter for legible inline counts.
 */
const RATING_SEGMENTS: {
	key: keyof Pick<
		DietBreakdown,
		"allowed" | "moderation" | "avoid" | "unknown"
	>;
	label: string;
	fill: string;
	text: string;
}[] = [
	{
		key: "allowed",
		label: "allowed",
		fill: "color-mix(in srgb, var(--color-allowed) 22%, transparent)",
		text: "color-mix(in srgb, var(--color-allowed) 72%, var(--color-ink-faint))",
	},
	{
		key: "moderation",
		label: "moderation",
		fill: "color-mix(in srgb, var(--color-moderation) 22%, transparent)",
		text: "color-mix(in srgb, var(--color-moderation) 72%, var(--color-ink-faint))",
	},
	{
		key: "avoid",
		label: "avoid",
		fill: "color-mix(in srgb, var(--color-avoid) 20%, transparent)",
		text: "color-mix(in srgb, var(--color-avoid) 68%, var(--color-ink-faint))",
	},
	{
		key: "unknown",
		label: "unknown",
		fill: "rgba(148, 163, 184, 0.12)",
		text: "var(--color-ink-faint)",
	},
];

/**
 * One diet lens as a subdued horizontal stacked bar. Segments are translucent
 * tints with their count centred inside; narrow slices get a minimum width so
 * the digit stays readable.
 */
function DietBreakdownRow({ diet }: { diet: DietBreakdown }) {
	const color = `rgb(${diet.accent})`;
	const segments = RATING_SEGMENTS.filter((seg) => diet[seg.key] > 0);
	const summary = RATING_SEGMENTS.map(
		(seg) => `${diet[seg.key]} ${seg.label}`,
	).join(" · ");

	return (
		<div className="flex items-center gap-3">
			<span
				className="w-24 shrink-0 truncate font-mono text-xs font-medium text-ink-dim"
				style={{ color: `color-mix(in srgb, ${color} 55%, var(--color-ink-dim))` }}
				title={diet.label}
			>
				{diet.label}
			</span>
			<div
				className="flex h-4 flex-1 gap-px overflow-hidden rounded-md bg-white/3 ring-1 ring-inset ring-white/4"
				title={`${diet.label}: ${summary}`}
			>
				{diet.total === 0 ? null : (
					segments.map((seg) => {
						const count = diet[seg.key];
						return (
							<div
								key={seg.key}
								className="flex min-w-[1.1rem] items-center justify-center"
								style={{
									flexGrow: count,
									background: seg.fill,
								}}
							>
								<span
									className="font-mono text-[10px] font-medium tabular-nums leading-none"
									style={{ color: seg.text }}
								>
									{count}
								</span>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
