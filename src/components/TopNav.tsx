"use client";

export type AppView = "explore" | "mealPlan" | "shopping";

const NAV_ITEMS: { view: AppView; label: string }[] = [
	{ view: "explore", label: "Explore" },
	{ view: "mealPlan", label: "Meal Plan" },
	{ view: "shopping", label: "Shopping List" },
];

type Props = {
	/** Currently active view (drives the neon highlight). */
	active: AppView;
	onNavigate: (view: AppView) => void;
	/** Count of outstanding (unchecked) shopping-list items for the nav badge. */
	shoppingCount?: number;
};

/**
 * Top navigation bar. Each item switches the active view rendered by the shell.
 */
export default function TopNav({
	active,
	onNavigate,
	shoppingCount = 0,
}: Props) {
	return (
		<header className="sticky top-0 z-40 border-b border-panel-edge bg-bg/85 backdrop-blur-md">
			<div className="flex items-center gap-6 px-4 py-3 md:px-6">
				{/* Logo */}
				<button
					type="button"
					onClick={() => onNavigate("explore")}
					className="flex items-center gap-2.5 text-left"
				>
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neon-pink/50 bg-neon-pink/10 font-mono text-sm font-bold text-neon-pink shadow-[0_0_16px_-4px_var(--color-neon-pink)]">
						GC
					</span>
					<div className="leading-none">
						<span className="font-mono text-lg font-bold tracking-tight">
							<span className="glow-pink">GUT</span>
							<span className="glow-green"> CHECK</span>
						</span>
						<span className="term-label ml-2 hidden text-ink-faint sm:inline">
							food.db
						</span>
					</div>
				</button>

				{/* Primary nav */}
				<nav className="ml-2 hidden items-center gap-1 md:flex">
					{NAV_ITEMS.map((item) => {
						const isActive = item.view === active;
						const showBadge =
							item.view === "shopping" && shoppingCount > 0;
						return (
							<button
								key={item.view}
								type="button"
								onClick={() => onNavigate(item.view)}
								className={[
									"term-label flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
									isActive
										? "text-neon-green shadow-[inset_0_-2px_0_0_var(--color-neon-green)]"
										: "text-ink-dim hover:text-ink",
								].join(" ")}
							>
								{item.label}
								{showBadge && (
									<span className="rounded-full bg-neon-pink/15 px-1.5 py-0.5 font-mono text-[10px] leading-none text-neon-pink">
										{shoppingCount}
									</span>
								)}
							</button>
						);
					})}
				</nav>
			</div>

			{/* Mobile nav: compact pill row so views are reachable on phones. */}
			<nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden">
				{NAV_ITEMS.map((item) => {
					const isActive = item.view === active;
					const showBadge =
						item.view === "shopping" && shoppingCount > 0;
					return (
						<button
							key={item.view}
							type="button"
							onClick={() => onNavigate(item.view)}
							className={[
								"term-label flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors",
								isActive
									? "border-neon-green/50 bg-neon-green/10 text-neon-green"
									: "border-panel-edge text-ink-dim",
							].join(" ")}
						>
							{item.label}
							{showBadge && (
								<span className="rounded-full bg-neon-pink/15 px-1.5 py-0.5 font-mono text-[10px] leading-none text-neon-pink">
									{shoppingCount}
								</span>
							)}
						</button>
					);
				})}
			</nav>
		</header>
	);
}
