"use client";

import { useEffect, useMemo, useState } from "react";

import AnalyticsPanel from "@/components/AnalyticsPanel";
import DietFilterChips from "@/components/DietFilterChips";
import FilterSidebar from "@/components/FilterSidebar";
import FoodExplorer from "@/components/FoodExplorer";
import MealPlanDashboard from "@/components/MealPlanDashboard";
import SelectedFoodsFlyout from "@/components/SelectedFoodsFlyout";
import ShoppingList from "@/components/ShoppingList";
import TopNav, { type AppView } from "@/components/TopNav";
import { FOODS } from "@/data/foods";
import {
	NUTRITION_KEYS,
	NUTRITION_RANGES,
	SORT_OPTIONS,
	filterFoods,
	sortFoods,
	type FoodFilters,
} from "@/lib/food";
import type { CompatibilityKey, NutritionKey, SortKey } from "@/types/food";

type NutritionBounds = { min: number; max: number };

/** Build the default "wide open" nutrition ranges (full min..max per slider). */
function defaultNutritionRange(): Record<NutritionKey, NutritionBounds> {
	return NUTRITION_KEYS.reduce(
		(acc, key) => {
			acc[key] = {
				min: NUTRITION_RANGES[key].min,
				max: NUTRITION_RANGES[key].max,
			};
			return acc;
		},
		{} as Record<NutritionKey, NutritionBounds>,
	);
}

/** localStorage keys for the persisted bits of state (survive phone reloads). */
const STORAGE_KEYS = {
	selected: "gutcheck.selected",
	shopping: "gutcheck.shopping",
	checked: "gutcheck.checked",
} as const;

/** Read a persisted string[] into a Set, tolerating absent/corrupt values. */
function loadSet(key: string): Set<string> {
	if (typeof window === "undefined") return new Set();
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return new Set();
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? new Set(parsed.filter((v): v is string => typeof v === "string"))
			: new Set();
	} catch {
		return new Set();
	}
}

/**
 * Top-level client shell. Owns all interactive state (search, filters, sort,
 * selection) and derives the filtered/sorted food list + selection passed to
 * the presentational pieces.
 */
export default function AppShell() {
	const [search, setSearch] = useState("");
	const [categories, setCategories] = useState<Set<string>>(new Set());
	const [diets, setDiets] = useState<Set<CompatibilityKey>>(new Set());
	const [properties, setProperties] = useState<Set<string>>(new Set());
	const [nutritionRange, setNutritionRange] = useState(defaultNutritionRange);
	const [sort, setSort] = useState<SortKey>("mostCompatible");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	// Which top-level view is showing: explorer, meal plan, or shopping list.
	const [view, setView] = useState<AppView>("explore");

	// Shopping list lives separately from the transient selection and persists.
	const [shoppingIds, setShoppingIds] = useState<Set<string>>(new Set());
	const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

	// Sidebars collapse to a rail on desktop / accordion on mobile. They start
	// open on desktop but auto-collapse on small screens so the food list leads.
	const [filtersCollapsed, setFiltersCollapsed] = useState(false);
	const [selectedCollapsed, setSelectedCollapsed] = useState(false);

	// Hydrate persisted state after mount (avoids SSR/client mismatch).
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setSelectedIds(loadSet(STORAGE_KEYS.selected));
		setShoppingIds(loadSet(STORAGE_KEYS.shopping));
		setCheckedIds(loadSet(STORAGE_KEYS.checked));
		setHydrated(true);
	}, []);

	// Persist each set once we've hydrated (so we never overwrite with empties).
	useEffect(() => {
		if (!hydrated) return;
		window.localStorage.setItem(
			STORAGE_KEYS.selected,
			JSON.stringify([...selectedIds]),
		);
	}, [selectedIds, hydrated]);
	useEffect(() => {
		if (!hydrated) return;
		window.localStorage.setItem(
			STORAGE_KEYS.shopping,
			JSON.stringify([...shoppingIds]),
		);
	}, [shoppingIds, hydrated]);
	useEffect(() => {
		if (!hydrated) return;
		window.localStorage.setItem(
			STORAGE_KEYS.checked,
			JSON.stringify([...checkedIds]),
		);
	}, [checkedIds, hydrated]);

	useEffect(() => {
		if (window.matchMedia("(max-width: 1023px)").matches) {
			setFiltersCollapsed(true);
			setSelectedCollapsed(true);
		}
	}, []);

	/* ----- derived data ----- */
	const filters = useMemo<FoodFilters>(
		() => ({
			search,
			categories,
			diets,
			properties,
			nutrition: nutritionRange,
		}),
		[search, categories, diets, properties, nutritionRange],
	);

	const visibleFoods = useMemo(
		() => sortFoods(filterFoods(FOODS, filters), sort),
		[filters, sort],
	);

	const selectedFoods = useMemo(
		() => FOODS.filter((f) => selectedIds.has(f.id)),
		[selectedIds],
	);

	const shoppingFoods = useMemo(
		() => FOODS.filter((f) => shoppingIds.has(f.id)),
		[shoppingIds],
	);

	// Outstanding (unchecked) shopping items — drives the nav badge.
	const shoppingRemaining = useMemo(
		() => [...shoppingIds].filter((id) => !checkedIds.has(id)).length,
		[shoppingIds, checkedIds],
	);

	const selectedOnList = useMemo(
		() => selectedFoods.filter((f) => shoppingIds.has(f.id)).length,
		[selectedFoods, shoppingIds],
	);

	/* ----- toggle helpers ----- */
	const toggleIn = <T,>(set: Set<T>, value: T): Set<T> => {
		const next = new Set(set);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		return next;
	};

	const resetFilters = () => {
		setSearch("");
		setCategories(new Set());
		setDiets(new Set());
		setProperties(new Set());
		setNutritionRange(defaultNutritionRange());
	};

	/* ----- shopping list actions ----- */
	const addSelectionToShoppingList = () => {
		if (selectedIds.size === 0) return;
		setShoppingIds((prev) => new Set([...prev, ...selectedIds]));
		setView("shopping");
	};

	const removeFromShopping = (id: string) => {
		setShoppingIds((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
		setCheckedIds((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
	};

	const clearChecked = () => {
		// Remove checked items from the list entirely and reset checked state.
		setShoppingIds((prev) => {
			const next = new Set(prev);
			for (const id of checkedIds) next.delete(id);
			return next;
		});
		setCheckedIds(new Set());
	};

	const clearShoppingList = () => {
		setShoppingIds(new Set());
		setCheckedIds(new Set());
	};

	return (
		<div className="min-h-screen">
			<TopNav
				active={view}
				onNavigate={setView}
				shoppingCount={shoppingRemaining}
			/>

			{view === "mealPlan" && (
				<MealPlanDashboard
					foods={selectedFoods}
					onBrowse={() => setView("explore")}
					onAddAllToShoppingList={addSelectionToShoppingList}
					alreadyOnListCount={selectedOnList}
				/>
			)}

			{view === "shopping" && (
				<ShoppingList
					items={shoppingFoods}
					checkedIds={checkedIds}
					onToggleChecked={(id) =>
						setCheckedIds((s) => toggleIn(s, id))
					}
					onRemove={removeFromShopping}
					onClearChecked={clearChecked}
					onClearAll={clearShoppingList}
					onBrowse={() => setView("explore")}
				/>
			)}

			{view === "explore" && (
				<>
			{/* Hero / header: search + diet chips + sort */}
			<div className="border-b border-panel-edge bg-bg-soft/60 px-4 py-4 md:px-6 md:sticky md:top-14 md:z-10 md:backdrop-blur-md">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<div className="relative lg:w-96">
						<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
							⌕
						</span>
						<input
							type="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search foods…"
							className="w-full rounded-lg border border-panel-edge bg-panel/80 py-2.5 pl-9 pr-3 font-mono text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-neon-pink/60 focus:shadow-[0_0_20px_-6px_var(--color-neon-pink)]"
						/>
					</div>

					<div className="flex-1 lg:px-2">
						<DietFilterChips
							active={diets}
							onToggle={(key) =>
								setDiets((s) => toggleIn(s, key))
							}
						/>
					</div>

					<label className="flex items-center gap-2">
						<span className="term-label text-ink-faint">Sort</span>
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortKey)}
							className="rounded-lg border border-panel-edge bg-panel/80 px-3 py-2.5 font-mono text-xs text-ink outline-none transition-colors focus:border-neon-green/60"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.key} value={opt.key}>
									{opt.label}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>

			{/* Main 3-column layout. Sidebars hug the screen edges and stay full
			    height; the centre column reflows as their widths animate. */}
			<div className="flex flex-col lg:flex-row lg:items-stretch">
				{/* Full-height left sidebar */}
				<FilterSidebar
					categories={categories}
					onToggleCategory={(id) =>
						setCategories((s) => toggleIn(s, id))
					}
					healthBenefits={diets}
					onToggleHealthBenefit={(key) =>
						setDiets((s) => toggleIn(s, key))
					}
					properties={properties}
					onToggleProperty={(id) =>
						setProperties((s) => toggleIn(s, id))
					}
					nutritionRange={nutritionRange}
					onNutritionChange={(key, bounds) =>
						setNutritionRange((prev) => ({
							...prev,
							[key]: bounds,
						}))
					}
					onReset={resetFilters}
					collapsed={filtersCollapsed}
					onToggleCollapsed={() => setFiltersCollapsed((c) => !c)}
				/>

				{/* Center column: explorer + analytics */}
				<div className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 md:px-6">
					<div className="flex items-center justify-between">
						<h1 className="font-mono text-sm text-ink-dim">
							<span className="glow-green">
								{visibleFoods.length}
							</span>{" "}
							foods ·{" "}
							<span className="text-ink-faint">
								{FOODS.length} in database
							</span>
						</h1>
						<span className="term-label text-ink-faint">
							Food Explorer
						</span>
					</div>

					<FoodExplorer
						foods={visibleFoods}
						selectedIds={selectedIds}
						onToggleFood={(id) =>
							setSelectedIds((s) => toggleIn(s, id))
						}
					/>

					<AnalyticsPanel
						foods={
							selectedFoods.length > 0
								? selectedFoods
								: visibleFoods
						}
						usingSelection={selectedFoods.length > 0}
					/>
				</div>

				{/* Sticky right flyout */}
				<SelectedFoodsFlyout
					selected={selectedFoods}
					onRemove={(id) => setSelectedIds((s) => toggleIn(s, id))}
					onClear={() => setSelectedIds(new Set())}
					onViewMealPlan={() => setView("mealPlan")}
					onAddToShoppingList={addSelectionToShoppingList}
					collapsed={selectedCollapsed}
					onToggleCollapsed={() => setSelectedCollapsed((c) => !c)}
				/>
			</div>
				</>
			)}
		</div>
	);
}
