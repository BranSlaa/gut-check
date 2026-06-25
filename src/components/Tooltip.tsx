"use client";

import {
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

type Props = {
	content: string;
	children: React.ReactNode;
	/** Where the tooltip appears relative to the trigger. */
	placement?: "top" | "bottom";
	className?: string;
};

const TOOLTIP_MAX_WIDTH = 240;
const TOOLTIP_GAP = 8;

/**
 * Hover/focus tooltip portaled to document.body so it is never clipped by
 * overflow-hidden parents (sidebars, tables, sticky headers).
 */
export default function Tooltip({
	content,
	children,
	placement = "top",
	className = "",
}: Props) {
	const id = useId();
	const triggerRef = useRef<HTMLSpanElement>(null);
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [style, setStyle] = useState<React.CSSProperties>({
		left: 0,
		top: 0,
		visibility: "hidden",
	});

	useEffect(() => setMounted(true), []);

	const updatePosition = useCallback(() => {
		const el = triggerRef.current;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		const anchorY = placement === "top" ? rect.top : rect.bottom;
		const centerX = rect.left + rect.width / 2;

		// Keep the tooltip inside the viewport horizontally.
		const half = TOOLTIP_MAX_WIDTH / 2;
		const minX = TOOLTIP_GAP + half;
		const maxX = window.innerWidth - TOOLTIP_GAP - half;
		const left = Math.min(Math.max(centerX, minX), maxX);

		setStyle({
			left,
			top: anchorY,
			transform:
				placement === "top"
					? `translate(-50%, calc(-100% - ${TOOLTIP_GAP}px))`
					: `translate(-50%, ${TOOLTIP_GAP}px)`,
			visibility: "visible",
		});
	}, [placement]);

	useLayoutEffect(() => {
		if (!open) return;

		updatePosition();

		const reposition = () => updatePosition();
		window.addEventListener("scroll", reposition, true);
		window.addEventListener("resize", reposition);

		return () => {
			window.removeEventListener("scroll", reposition, true);
			window.removeEventListener("resize", reposition);
		};
	}, [open, updatePosition]);

	const show = () => {
		updatePosition();
		setOpen(true);
	};

	const hide = (event: React.FocusEvent | React.MouseEvent) => {
		const next = event.relatedTarget;
		if (next instanceof Node && triggerRef.current?.contains(next)) return;
		setOpen(false);
	};

	const tooltip =
		open && mounted
			? createPortal(
					<div
						role="tooltip"
						id={id}
						style={style}
						className="pointer-events-none fixed z-9999 w-max max-w-[240px] rounded-md border border-panel-edge bg-[#0a0f18]/95 px-2.5 py-2 text-left text-[11px] normal-case leading-snug tracking-normal text-ink-dim shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-sm"
					>
						{content}
					</div>,
					document.body,
				)
			: null;

	return (
		<>
			<span
				ref={triggerRef}
				className={`inline-flex ${className}`}
				onMouseEnter={show}
				onMouseLeave={hide}
				onFocusCapture={show}
				onBlurCapture={hide}
			>
				{children}
			</span>
			{tooltip}
		</>
	);
}
