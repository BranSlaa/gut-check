"use client";

import { CATEGORY_BY_ID, CATEGORIES } from "@/data/categories";
import { fmtNum } from "@/lib/food";
import type { Food } from "@/types/food";

type Props = {
	/** Foods currently on the shopping list. */
	items: Food[];
	/** Ids that have been checked off (in the cart). */
	checkedIds: Set<string>;
	onToggleChecked: (id: string) => void;
	onRemove: (id: string) => void;
	onClearChecked: () => void;
	onClearAll: () => void;
	/** Jump back to the explorer to add more foods. */
	onBrowse: () => void;
};

/** Stable category ordering for aisles, with a fallback bucket at the end. */
const CATEGORY_ORDER = new Map(CATEGORIES.map((c, i) => [c.id, i]));

/**
 * Mobile-first shopping list. Outstanding items are grouped by aisle
 * (category) for easy in-store shopping; checking an item off sinks it into a
 * dimmed "In the cart" section at the bottom. Persisted by the shell so it
 * survives reloads on a phone mid-shop.
 */
export default function ShoppingList({
	items,
	checkedIds,
	onToggleChecked,
	onRemove,
	onClearChecked,
	onClearAll,
	onBrowse,
}: Props) {
	const hasItems = items.length > 0;
	const checked = items.filter((f) => checkedIds.has(f.id));
	const remaining = items.filter((f) => !checkedIds.has(f.id));
	const progress =
		items.length === 0
			? 0
			: Math.round((checked.length / items.length) * 100);

	// Group remaining items by aisle, preserving category order.
	const aisles = new Map<string, Food[]>();
	for (const food of remaining) {
		const key = food.category ?? "other";
		const bucket = aisles.get(key) ?? [];
		bucket.push(food);
		aisles.set(key, bucket);
	}
	const sortedAisles = [...aisles.entries()].sort(
		(a, b) =>
			(CATEGORY_ORDER.get(a[0]) ?? 999) -
			(CATEGORY_ORDER.get(b[0]) ?? 999),
	);

	if (!hasItems) {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
				<div className="neon-panel flex flex-col items-center gap-3 px-6 py-20 text-center">
					<span className="font-mono text-4xl text-neon-pink">
						🛒
					</span>
					<h1 className="font-mono text-lg text-ink">
						Your shopping list is empty
					</h1>
					<p className="max-w-sm text-sm text-ink-dim">
						Add foods from your meal plan or the explorer, then open
						this list on your phone to check things off as you shop.
					</p>
					<button
						type="button"
						onClick={onBrowse}
						className="mt-2 rounded-lg border border-neon-pink/50 bg-neon-pink/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-neon-pink shadow-[0_0_18px_-6px_var(--color-neon-pink)] transition-all hover:bg-neon-pink/20"
					>
						← Browse Foods
					</button>
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
			{/* Header + progress */}
			<div className="flex flex-col gap-3">
				<div className="flex items-end justify-between gap-3">
					<div>
						<p className="term-label text-ink-faint">
							Shopping List
						</p>
						<h1 className="mt-1 font-mono text-2xl font-bold text-ink">
							<span className="glow-pink">{remaining.length}</span>{" "}
							to grab
							<span className="ml-2 font-mono text-sm font-normal text-ink-faint">
								{checked.length}/{items.length} done
							</span>
						</h1>
					</div>
					<button
						type="button"
						onClick={onBrowse}
						className="shrink-0 rounded-lg border border-panel-edge px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim transition-colors hover:border-neon-pink/50 hover:text-neon-pink"
					>
						+ Add
					</button>
				</div>

				<div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
					<div
						className="h-full rounded-full bg-neon-green transition-[width] duration-500"
						style={{
							width: `${progress}%`,
							boxShadow:
								"0 0 12px -2px var(--color-neon-green)",
						}}
					/>
				</div>
			</div>

			{/* Outstanding items, grouped by aisle */}
			{remaining.length === 0 ? (
				<div className="neon-panel flex flex-col items-center gap-2 px-6 py-10 text-center">
					<span className="font-mono text-3xl text-neon-green">
						✓
					</span>
					<p className="font-mono text-sm text-ink">
						All done — everything is in the cart!
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-5">
					{sortedAisles.map(([categoryId, foods]) => {
						const category = CATEGORY_BY_ID[categoryId];
						const accent = category?.accent ?? "138 147 184";
						return (
							<section key={categoryId}>
								<h2
									className="term-label mb-2 flex items-center gap-2"
									style={{ color: `rgb(${accent})` }}
								>
									<span
										className="h-2 w-2 rounded-full"
										style={{
											background: `rgb(${accent})`,
											boxShadow: `0 0 8px rgb(${accent})`,
										}}
									/>
									{category?.label ?? "Other"}
									<span className="text-ink-faint">
										· {foods.length}
									</span>
								</h2>
								<ul className="flex flex-col gap-2">
									{foods.map((food) => (
										<ShoppingRow
											key={food.id}
											food={food}
											checked={false}
											onToggleChecked={onToggleChecked}
											onRemove={onRemove}
										/>
									))}
								</ul>
							</section>
						);
					})}
				</div>
			)}

			{/* Checked-off items sink to the bottom */}
			{checked.length > 0 && (
				<section>
					<div className="mb-2 flex items-center justify-between">
						<h2 className="term-label text-ink-faint">
							In the cart · {checked.length}
						</h2>
						<button
							type="button"
							onClick={onClearChecked}
							className="term-label text-ink-faint transition-colors hover:text-neon-pink"
						>
							Clear checked
						</button>
					</div>
					<ul className="flex flex-col gap-2">
						{checked.map((food) => (
							<ShoppingRow
								key={food.id}
								food={food}
								checked
								onToggleChecked={onToggleChecked}
								onRemove={onRemove}
							/>
						))}
					</ul>
				</section>
			)}

			{/* Footer actions */}
			<div className="flex justify-end pt-2">
				<button
					type="button"
					onClick={onClearAll}
					className="rounded-lg border border-panel-edge px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim transition-colors hover:border-avoid/50 hover:text-avoid"
				>
					Clear list
				</button>
			</div>
		</main>
	);
}

function ShoppingRow({
	food,
	checked,
	onToggleChecked,
	onRemove,
}: {
	food: Food;
	checked: boolean;
	onToggleChecked: (id: string) => void;
	onRemove: (id: string) => void;
}) {
	return (
		<li
			className={[
				"group flex items-center gap-3 rounded-xl border px-3 py-3 transition-all",
				checked
					? "border-panel-edge/50 bg-white/1 opacity-55"
					: "border-panel-edge bg-white/2 hover:border-neon-green/40",
			].join(" ")}
		>
			{/* Big tap target: toggle checked */}
			<button
				type="button"
				onClick={() => onToggleChecked(food.id)}
				aria-pressed={checked}
				aria-label={
					checked
						? `Uncheck ${food.name}`
						: `Check off ${food.name}`
				}
				className={[
					"flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-bold transition-all",
					checked
						? "border-neon-green/60 bg-neon-green/15 text-neon-green shadow-[0_0_12px_-4px_var(--color-neon-green)]"
						: "border-ink-faint/40 text-transparent hover:border-neon-green/50",
				].join(" ")}
			>
				✓
			</button>

			{/* Tapping the body also toggles, for an easy phone target. */}
			<button
				type="button"
				onClick={() => onToggleChecked(food.id)}
				className="min-w-0 flex-1 text-left"
			>
				<p
					className={[
						"truncate text-sm",
						checked
							? "text-ink-dim line-through"
							: "text-ink",
					].join(" ")}
				>
					{food.name}
				</p>
				<p className="font-mono text-[11px] text-ink-faint">
					{fmtNum(food.calories, 0)} kcal
					{food.protein != null
						? ` · ${fmtNum(food.protein)}g protein`
						: ""}
				</p>
			</button>

			<button
				type="button"
				aria-label={`Remove ${food.name}`}
				onClick={() => onRemove(food.id)}
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-ink-faint opacity-0 transition-all hover:border-avoid/50 hover:text-avoid group-hover:opacity-100"
			>
				✕
			</button>
		</li>
	);
}
