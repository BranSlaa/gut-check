"use client";

import FoodCategoryTable from "@/components/FoodCategoryTable";
import { CATEGORIES } from "@/data/categories";
import type { Food } from "@/types/food";

type Props = {
	foods: Food[];
	selectedIds: Set<string>;
	onToggleFood: (id: string) => void;
};

/**
 * Groups the (already filtered + sorted) foods by category and renders one
 * glowing table per non-empty category. Sections alternate their glow side
 * (left / right) for the requested visual rhythm.
 */
export default function FoodExplorer({
	foods,
	selectedIds,
	onToggleFood,
}: Props) {
	// Preserve the incoming sort order within each category bucket.
	const byCategory = new Map<string, Food[]>();
	for (const food of foods) {
		const key = food.category ?? "uncategorized";
		const bucket = byCategory.get(key) ?? [];
		bucket.push(food);
		byCategory.set(key, bucket);
	}

	const populated = CATEGORIES.filter(
		(cat) => (byCategory.get(cat.id)?.length ?? 0) > 0,
	);

	if (foods.length === 0) {
		return (
			<div className="neon-panel flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
				<span className="font-mono text-3xl text-neon-pink">∅</span>
				<p className="font-mono text-sm text-ink">
					No foods match the current filters
				</p>
				<p className="text-xs text-ink-dim">
					Try clearing a diet chip, a category, or widening a
					nutrition range.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-5">
			{populated.map((category, index) => (
				<FoodCategoryTable
					key={category.id}
					category={category}
					foods={byCategory.get(category.id) ?? []}
					selectedIds={selectedIds}
					onToggleFood={onToggleFood}
					side={index % 2 === 0 ? "left" : "right"}
				/>
			))}
		</div>
	);
}
