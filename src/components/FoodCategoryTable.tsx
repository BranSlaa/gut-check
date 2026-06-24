"use client";

import { useState } from "react";

import CompatibilityIcon from "@/components/CompatibilityIcon";
import type { FoodCategory } from "@/data/categories";
import { TABLE_DIET_COLUMNS, TABLE_HEALTH_COLUMNS } from "@/data/diets";
import { fmtNum, getCompatibility } from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	category: FoodCategory;
	foods: Food[];
	selectedIds: Set<string>;
	onToggleFood: (id: string) => void;
	/** Alternating glow side: even sections glow from the left, odd from right. */
	side: "left" | "right";
};

const NUTRIENT_COLUMNS: {
	key: "calories" | "protein" | "carbs" | "fat" | "fiber";
	label: string;
	sub: string;
}[] = [
	{ key: "calories", label: "Calories", sub: "kcal" },
	{ key: "protein", label: "Protein", sub: "g" },
	{ key: "carbs", label: "Carbs", sub: "g" },
	{ key: "fat", label: "Fat", sub: "g" },
	{ key: "fiber", label: "Fiber", sub: "g" },
];

/**
 * A single glowing "database panel" for one food category. The accent glow
 * enters from the left or right depending on `side`, so stacked sections
 * alternate visually. Tables scroll horizontally on narrow screens.
 */
export default function FoodCategoryTable({
	category,
	foods,
	selectedIds,
	onToggleFood,
	side,
}: Props) {
	const [hoveredCol, setHoveredCol] = useState<string | null>(null);

	if (foods.length === 0) return null;

	const accent = `rgb(${category.accent})`;

	/** Column-hover highlight, mirroring the row hover treatment. */
	const colHighlight = (key: string) =>
		hoveredCol === key ? "bg-black/25" : "";
	const glowGradient =
		side === "left"
			? `linear-gradient(90deg, rgba(${category.accent} / 0.16), transparent 38%)`
			: `linear-gradient(270deg, rgba(${category.accent} / 0.16), transparent 38%)`;

	return (
		<section
			className="neon-panel relative overflow-hidden"
			style={
				{
					"--accent": accent,
					"--accent-rgb": category.accent,
					borderColor: `rgba(${category.accent} / 0.28)`,
				} as React.CSSProperties
			}
		>
			{/* Directional accent glow wash */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{ background: glowGradient }}
			/>
			{/* Bright edge bar on the glow side */}
			<div
				aria-hidden
				className={`pointer-events-none absolute inset-y-0 w-[3px] ${
					side === "left" ? "left-0" : "right-0"
				}`}
				style={{
					background: accent,
					boxShadow: `0 0 18px 1px ${accent}`,
				}}
			/>

			{/* Section header */}
			<div className="relative flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-3">
					<span
						className="h-3 w-3 rounded-full"
						style={{
							background: accent,
							boxShadow: `0 0 10px ${accent}`,
						}}
					/>
					<h3
						className="font-mono text-sm font-bold uppercase tracking-[0.16em]"
						style={{
							color: accent,
							textShadow: `0 0 14px rgba(${category.accent} / 0.6)`,
						}}
					>
						{category.label}
					</h3>
					<span className="term-label rounded-full border border-panel-edge px-2 py-0.5 text-ink-faint">
						{foods.length}
					</span>
				</div>
				<span className="hidden text-xs text-ink-faint sm:block">
					{category.blurb}
				</span>
			</div>

			{/* Table */}
			<div className="relative overflow-x-auto">
				<table
					className="w-full min-w-[1100px] border-collapse text-sm"
					onMouseLeave={() => setHoveredCol(null)}
				>
					<thead>
						<tr className="border-y border-panel-edge text-left">
							<Th
								className={`w-10 pl-4 ${colHighlight("select")}`}
								onMouseEnter={() => setHoveredCol("select")}
							/>
							<Th
								className={`min-w-[150px] ${colHighlight("name")}`}
								onMouseEnter={() => setHoveredCol("name")}
							>
								Food
							</Th>
							{NUTRIENT_COLUMNS.map((col) => (
								<Th
									key={col.key}
									className={`text-right ${colHighlight(col.key)}`}
									onMouseEnter={() => setHoveredCol(col.key)}
								>
									{col.label}
									<span className="ml-1 text-ink-faint normal-case">
										{col.sub}
									</span>
								</Th>
							))}
							{TABLE_DIET_COLUMNS.map((col) => (
								<Th
									key={col.key}
									className={`text-center ${colHighlight(col.key)}`}
									onMouseEnter={() => setHoveredCol(col.key)}
								>
									{col.label}
								</Th>
							))}
							<Th
								className={`w-px px-0 ${colHighlight("_health_div")}`}
								onMouseEnter={() => setHoveredCol("_health_div")}
								aria-hidden
							>
								<span className="block h-4 w-px bg-panel-edge" />
							</Th>
							{TABLE_HEALTH_COLUMNS.map((col) => (
								<Th
									key={col.key}
									className={`text-center text-[#9ad4ff] ${colHighlight(col.key)}`}
									onMouseEnter={() => setHoveredCol(col.key)}
								>
									{col.label}
								</Th>
							))}
						</tr>
					</thead>
					<tbody>
						{foods.map((food) => {
							const selected = selectedIds.has(food.id);
							return (
								<tr
									key={food.id}
									onClick={() => onToggleFood(food.id)}
									className={[
										"group cursor-pointer border-b border-panel-edge/60 transition-colors",
										selected
											? "bg-[rgba(var(--accent-rgb)/0.12)]"
											: "hover:bg-white/25",
									].join(" ")}
									style={
										selected
											? {
													boxShadow: `inset 3px 0 0 0 var(--accent), inset 0 0 22px -14px var(--accent)`,
												}
											: undefined
									}
								>
									{/* Select checkbox */}
									<td
										className={`pl-4 pr-2 transition-colors ${colHighlight("select")}`}
										onMouseEnter={() =>
											setHoveredCol("select")
										}
									>
										<span
											className={[
												"flex h-4 w-4 items-center justify-center rounded border text-[10px] transition-all",
												selected
													? "border-accent bg-accent/25 text-accent shadow-[0_0_10px_-1px_var(--accent)]"
													: "border-panel-edge text-transparent group-hover:border-ink-dim",
											].join(" ")}
										>
											✓
										</span>
									</td>

									{/* Name */}
									<td
										className={`py-2.5 px-1 transition-colors ${colHighlight("name")}`}
										onMouseEnter={() =>
											setHoveredCol("name")
										}
									>
										<span className="font-medium text-ink">
											{food.name}
										</span>
										{food.tags?.includes("fermented") && (
											<span
												className="ml-2 inline-flex items-center rounded-full border border-[#bd5cff]/50 bg-[#bd5cff]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#c98dff]"
												title="Fermented / live-culture food"
											>
												fermented
											</span>
										)}
									</td>

									{/* Nutrients */}
									{NUTRIENT_COLUMNS.map((col) => {
										const value = food[col.key];
										return (
											<td
												key={col.key}
												className={`px-1 text-right font-mono tabular-nums transition-colors ${
													value === null ||
													value === undefined
														? "text-ink-faint"
														: "text-ink-dim"
												} ${colHighlight(col.key)}`}
												onMouseEnter={() =>
													setHoveredCol(col.key)
												}
											>
												{fmtNum(value)}
											</td>
										);
									})}

									{/* Diet compatibility */}
									{TABLE_DIET_COLUMNS.map((col) => (
										<td
											key={col.key}
											className={`py-2.5 px-1 text-center transition-colors ${colHighlight(col.key)}`}
											onMouseEnter={() =>
												setHoveredCol(col.key)
											}
										>
											<span className="inline-flex justify-center">
												<CompatibilityIcon
													status={getCompatibility(
														food,
														col.key,
													)}
													size="sm"
												/>
											</span>
										</td>
									))}
									<td
										className="w-px px-0"
										aria-hidden
									>
										<span className="block h-full w-px bg-panel-edge/60" />
									</td>
									{TABLE_HEALTH_COLUMNS.map((col) => (
										<td
											key={col.key}
											className={`py-2.5 px-1 text-center transition-colors ${colHighlight(col.key)}`}
											onMouseEnter={() =>
												setHoveredCol(col.key)
											}
										>
											<span className="inline-flex justify-center">
												<CompatibilityIcon
													status={getCompatibility(
														food,
														col.key,
													)}
													size="sm"
												/>
											</span>
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}

function Th({
	children,
	className = "",
	onMouseEnter,
}: {
	children?: React.ReactNode;
	className?: string;
	onMouseEnter?: () => void;
}) {
	return (
		<th
			className={`term-label whitespace-nowrap px-2 py-2.5 font-medium text-ink-faint transition-colors ${className}`}
			onMouseEnter={onMouseEnter}
		>
			{children}
		</th>
	);
}
