"use client";

import type { ReactNode } from "react";

type Props = {
	/** Which screen edge the sidebar hugs. Controls toggle placement + arrows. */
	side: "left" | "right";
	/** Short label shown in the collapsed rail / mobile bar. */
	title: string;
	/** Optional accent (e.g. selected count) shown beside the title collapsed. */
	badge?: ReactNode;
	/** Tailwind width class applied when expanded on desktop, e.g. "lg:w-64". */
	expandedWidthClass: string;
	/** Extra classes for the inner panel (e.g. "neon-panel-pink"). */
	panelClassName?: string;
	collapsed: boolean;
	onToggleCollapsed: () => void;
	children: ReactNode;
};

const ARROWS = {
	left: { collapse: "«", expand: "»" },
	right: { collapse: "»", expand: "«" },
} as const;

/**
 * Shell for the left/right dashboard sidebars. On desktop it is a full-height
 * sticky rail whose width animates between expanded and a thin collapsed rail;
 * the centre column reflows smoothly as the width transitions. On mobile it is
 * an accordion whose body animates open/closed via the grid-rows trick.
 *
 * The open/close button lives on its own line pinned to the outer edge, so it
 * never shifts position when toggled.
 */
export default function CollapsibleSidebar({
	side,
	title,
	badge,
	expandedWidthClass,
	panelClassName = "",
	collapsed,
	onToggleCollapsed,
	children,
}: Props) {
	const arrows = ARROWS[side];

	return (
		<aside
			className={[
				"w-full lg:shrink-0 lg:transition-[width] lg:duration-300 lg:ease-in-out",
				collapsed ? "lg:w-14" : expandedWidthClass,
			].join(" ")}
		>
			<div
				className={[
					"neon-panel relative flex flex-col overflow-hidden",
					side === "left"
						? "lg:rounded-l-none"
						: "lg:rounded-r-none",
					"lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]",
					panelClassName,
				].join(" ")}
			>
				{/* Toggle row: own line, pinned to the outer edge so it never moves. */}
				<div
					className={[
						"flex shrink-0 items-center gap-2 px-3 py-3",
						side === "left" ? "justify-start" : "justify-end",
					].join(" ")}
				>
					{side === "right" && collapsed && (
						<MobileLabel title={title} badge={badge} />
					)}
					<button
						type="button"
						onClick={onToggleCollapsed}
						aria-expanded={!collapsed}
						aria-label={
							collapsed ? `Expand ${title}` : `Collapse ${title}`
						}
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-panel-edge text-ink-dim transition-colors hover:border-neon-pink/50 hover:text-neon-pink"
					>
						<span className="lg:hidden">
							{collapsed ? "▾" : "▴"}
						</span>
						<span className="hidden lg:inline">
							{collapsed ? arrows.expand : arrows.collapse}
						</span>
					</button>
					{side === "left" && collapsed && (
						<MobileLabel title={title} badge={badge} />
					)}
				</div>

				{/* Desktop-only vertical rail label, shown while collapsed. */}
				{collapsed && (
					<div className="pointer-events-none absolute inset-x-0 top-16 hidden flex-col items-center gap-3 lg:flex">
						<span className="term-label text-ink-faint [writing-mode:vertical-rl]">
							{title}
						</span>
						{badge}
					</div>
				)}

				{/* Body. Mobile: animates height via grid-rows. Desktop: fills the
				    remaining height; fades out while the rail width shrinks. */}
				<div
					className={[
						"grid transition-[grid-template-rows,opacity] duration-300 ease-in-out lg:min-h-0 lg:flex-1",
						collapsed
							? "grid-rows-[0fr] opacity-0"
							: "grid-rows-[1fr] opacity-100",
					].join(" ")}
				>
					<div
						className={[
							"min-h-0 overflow-hidden lg:overflow-y-auto",
							collapsed ? "pointer-events-none" : "",
						].join(" ")}
					>
						{children}
					</div>
				</div>
			</div>
		</aside>
	);
}

/** Mobile-only label so the collapsed bar reads as a titled menu. */
function MobileLabel({ title, badge }: { title: string; badge?: ReactNode }) {
	return (
		<span className="term-label flex items-center gap-2 text-neon-pink lg:hidden">
			{title}
			{badge}
		</span>
	);
}
