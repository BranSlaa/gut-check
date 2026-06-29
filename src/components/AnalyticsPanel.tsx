"use client";

import { useState } from "react";

import DoshaIcon from "@/components/DoshaIcon";
import ExplorerDietCell from "@/components/ExplorerDietCell";
import CompatibilityIcon from "@/components/CompatibilityIcon";
import {
	EXPLORER_DIET_COLUMNS,
	TABLE_HEALTH_COLUMNS,
} from "@/data/diets";
import type { ExplorerDietColumn } from "@/data/diets";
import { computeTotals, getCompatibility } from "@/lib/food";
import type { CompatibilityKey, Food } from "@/types/food";

type Props = {
	/** Foods to analyse — selection if any, otherwise the visible result set. */
	foods: Food[];
	usingSelection: boolean;
};

const TABS = [
	"Overview",
	"Nutrition Comparison",
	"Diet Compatibility",
	"Health Benefits",
	"Micronutrients",
	"Visual Matrix",
] as const;

type Tab = (typeof TABS)[number];

/**
 * Bottom analytics dock. Tabs switch between placeholder visualisations; each
 * panel is structured so real charts can be dropped in later. Numbers shown
 * are derived live from the supplied foods (null-safe).
 */
export default function AnalyticsPanel({ foods, usingSelection }: Props) {
	const [tab, setTab] = useState<Tab>("Overview");
	const totals = computeTotals(foods);

	return (
		<section className="neon-panel overflow-hidden">
			{/* Tab bar */}
			<div className="flex flex-wrap items-center gap-1 border-b border-panel-edge px-2 py-2">
				{TABS.map((t) => {
					const active = t === tab;
					return (
						<button
							key={t}
							type="button"
							onClick={() => setTab(t)}
							className={[
								"term-label rounded-md px-3 py-2 transition-colors",
								active
									? "bg-neon-pink/10 text-neon-pink shadow-[inset_0_-2px_0_0_var(--color-neon-pink)]"
									: "text-ink-dim hover:text-ink",
							].join(" ")}
						>
							{t}
						</button>
					);
				})}
				<span className="ml-auto hidden px-2 font-mono text-[11px] text-ink-faint sm:block">
					{usingSelection ? "scope: selection" : "scope: results"} ·{" "}
					{foods.length} foods
				</span>
			</div>

			{/* Panels */}
			<div className="p-4">
				{tab === "Overview" && (
					<OverviewPanel foods={foods} macroTotals={totals} />
				)}
				{tab === "Nutrition Comparison" && (
					<ChartPlaceholder
						title="Nutrition Comparison"
						note="Bar comparison of protein, carbs, fat & fiber per food."
					>
						<MacroBreakdown foods={foods} />
					</ChartPlaceholder>
				)}
				{tab === "Diet Compatibility" && (
					<CompatibilityMatrix
						foods={foods}
						columns={EXPLORER_DIET_COLUMNS}
						title="Diet Compatibility Matrix"
					/>
				)}
				{tab === "Health Benefits" && (
					<CompatibilityMatrix
						foods={foods}
						columns={TABLE_HEALTH_COLUMNS}
						title="Health Benefit Matrix"
						accent="health"
					/>
				)}
				{tab === "Micronutrients" && (
					<ChartPlaceholder
						title="Micronutrient Density"
						note="Heatmap of vitamin & mineral coverage (placeholder)."
					>
						<RadarPlaceholder label="Micronutrient Radar" />
					</ChartPlaceholder>
				)}
				{tab === "Visual Matrix" && (
					<ChartPlaceholder
						title="Visual Matrix"
						note="Scatter / matrix view of foods by macros & fiber (placeholder)."
					>
						<RadarPlaceholder label="Matrix View" />
					</ChartPlaceholder>
				)}
			</div>
		</section>
	);
}

/* --------------------------- Overview --------------------------------- */

function OverviewPanel({
	foods,
	macroTotals,
}: {
	foods: Food[];
	macroTotals: ReturnType<typeof computeTotals>;
}) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<Panel title="Nutrition Radar">
				<RadarPlaceholder label="Radar" />
			</Panel>

			<Panel title="Macronutrient Breakdown">
				<MacroBreakdown foods={foods} />
			</Panel>

			<Panel title="Food Insight" accent="green">
				<p className="text-xs leading-relaxed text-ink-dim">
					{buildInsight(foods, macroTotals)}
				</p>
			</Panel>
		</div>
	);
}

function buildInsight(
	foods: Food[],
	macroTotals: ReturnType<typeof computeTotals>,
): string {
	if (foods.length === 0) {
		return "No foods in scope yet. Select foods or relax filters to see insights.";
	}
	const highFiber = foods.filter((f) => (f.fiber ?? 0) >= 5).length;
	const fermented = foods.filter((f) => f.tags?.includes("fermented")).length;
	const parts: string[] = [];
	if (macroTotals.withData > 0) {
		const avgProtein = macroTotals.protein / macroTotals.withData;
		parts.push(`Average protein is ${avgProtein.toFixed(1)}g per food.`);
	}
	if (highFiber > 0) {
		parts.push(
			`${highFiber} high-fiber pick${highFiber > 1 ? "s" : ""} support digestion.`,
		);
	}
	if (fermented > 0) {
		parts.push(
			`${fermented} fermented food${fermented > 1 ? "s" : ""} add live cultures.`,
		);
	}
	if (parts.length === 0) {
		parts.push("This selection is light on logged nutrition data.");
	}
	return parts.join(" ");
}

/* --------------------------- Diet matrix ------------------------------ */

function CompatibilityMatrix({
	foods,
	columns,
	title,
	accent = "default",
}: {
	foods: Food[];
	columns:
		| ExplorerDietColumn[]
		| { key: CompatibilityKey; label: string }[];
	title: string;
	accent?: "default" | "health";
}) {
	const sample = foods.slice(0, 8);
	const headerClass =
		accent === "health"
			? "term-label px-2 py-2 text-center text-[#9ad4ff]"
			: "term-label px-2 py-2 text-center text-ink-faint";

	const colKey = (
		col:
			| ExplorerDietColumn
			| { key: CompatibilityKey; label: string },
	) =>
		"type" in col
			? col.type === "dosha"
				? `dosha-${col.key}`
				: col.key
			: col.key;

	return (
		<Panel title={title}>
			{sample.length === 0 ? (
				<EmptyNote />
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[720px] text-sm">
						<thead>
							<tr>
								<th className="term-label py-2 pr-3 text-left text-ink-faint">
									Food
								</th>
								{columns.map((col) => (
									<th
										key={colKey(col)}
										className={headerClass}
									>
										{"type" in col && col.type === "dosha" ? (
											<span className="inline-flex flex-col items-center gap-0.5">
												<DoshaIcon
													dosha={col.key}
													size="sm"
												/>
												<span className="text-[9px] normal-case tracking-normal">
													{col.label}
												</span>
											</span>
										) : (
											col.label
										)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{sample.map((food) => (
								<tr
									key={food.id}
									className="border-t border-panel-edge/60"
								>
									<td className="py-2 pr-3 text-ink">
										{food.name}
									</td>
									{columns.map((col) => (
										<td
											key={colKey(col)}
											className="px-2 py-2 text-center"
										>
											<span className="inline-flex justify-center">
												{"type" in col ? (
													<ExplorerDietCell
														column={col}
														food={food}
														size="sm"
													/>
												) : (
													<CompatibilityIcon
														status={getCompatibility(
															food,
															col.key,
														)}
														size="sm"
													/>
												)}
											</span>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Panel>
	);
}

/* --------------------------- Sub-charts ------------------------------- */

function MacroBreakdown({ foods }: { foods: Food[] }) {
	const sample = foods.slice(0, 6);
	if (sample.length === 0) return <EmptyNote />;

	return (
		<div className="flex h-44 items-end justify-around gap-2">
			{sample.map((food) => {
				const protein = food.protein ?? 0;
				const carbs = food.carbs ?? 0;
				const fat = food.fat ?? 0;
				const fiber = food.fiber ?? 0;
				const max = Math.max(protein + carbs + fat + fiber, 1);
				const seg = (v: number, color: string) => (
					<span
						className="block w-full"
						style={{
							height: `${(v / max) * 100}%`,
							background: color,
						}}
					/>
				);
				return (
					<div
						key={food.id}
						className="flex h-full flex-1 flex-col items-center gap-1"
					>
						<div className="flex h-full w-7 flex-col-reverse overflow-hidden rounded-sm border border-panel-edge">
							{seg(protein, "var(--color-neon-pink)")}
							{seg(carbs, "var(--color-neon-green)")}
							{seg(fat, "var(--color-moderation)")}
							{seg(fiber, "#38bdff")}
						</div>
						<span className="max-w-14 truncate font-mono text-[10px] text-ink-faint">
							{food.name.split(" ")[0]}
						</span>
					</div>
				);
			})}
			<Legend />
		</div>
	);
}

function Legend() {
	const items: [string, string][] = [
		["Protein", "var(--color-neon-pink)"],
		["Carbs", "var(--color-neon-green)"],
		["Fat", "var(--color-moderation)"],
		["Fiber", "#38bdff"],
	];
	return (
		<div className="ml-2 flex flex-col gap-1 self-center">
			{items.map(([label, color]) => (
				<span
					key={label}
					className="flex items-center gap-1.5 font-mono text-[10px] text-ink-dim"
				>
					<span
						className="h-2 w-2 rounded-sm"
						style={{ background: color }}
					/>
					{label}
				</span>
			))}
		</div>
	);
}

function RadarPlaceholder({ label }: { label: string }) {
	return (
		<div className="relative flex h-44 items-center justify-center">
			{[1, 2, 3].map((r) => (
				<span
					key={r}
					className="absolute rounded-full border border-panel-edge"
					style={{ height: `${r * 42}px`, width: `${r * 42}px` }}
				/>
			))}
			<svg viewBox="0 0 100 100" className="absolute h-32 w-32">
				<polygon
					points="50,12 84,34 72,80 28,80 16,34"
					fill="rgba(255,45,149,0.12)"
					stroke="var(--color-neon-pink)"
					strokeWidth="1"
				/>
			</svg>
			<span className="absolute bottom-0 font-mono text-[10px] text-ink-faint">
				{label} · placeholder
			</span>
		</div>
	);
}

/* --------------------------- Primitives ------------------------------- */

function Panel({
	title,
	children,
	accent = "pink",
}: {
	title: string;
	children: React.ReactNode;
	accent?: "pink" | "green";
}) {
	const color =
		accent === "green"
			? "var(--color-neon-green)"
			: "var(--color-neon-pink)";
	return (
		<div className="rounded-lg border border-panel-edge bg-white/0.012 p-3">
			<h4 className="term-label mb-3" style={{ color }}>
				{title}
			</h4>
			{children}
		</div>
	);
}

function ChartPlaceholder({
	title,
	note,
	children,
}: {
	title: string;
	note: string;
	children: React.ReactNode;
}) {
	return (
		<Panel title={title}>
			<p className="mb-3 font-mono text-[11px] text-ink-faint">{note}</p>
			{children}
		</Panel>
	);
}

function EmptyNote() {
	return (
		<p className="py-8 text-center font-mono text-xs text-ink-faint">
			No data in scope.
		</p>
	);
}
