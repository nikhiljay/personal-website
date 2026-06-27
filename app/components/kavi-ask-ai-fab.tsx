"use client";

import { MessageCircleIcon } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { useFixedBottomOffset } from "../hooks/use-fixed-bottom-offset";

type KaviAskAiFabProps = {
  onClick: () => void;
  "aria-expanded"?: boolean;
};

export const KaviAskAiFab = forwardRef<HTMLButtonElement, KaviAskAiFabProps>(
  function KaviAskAiFab({ onClick, "aria-expanded": ariaExpanded }, ref) {
    const { isDesktop, mobileBottom } = useFixedBottomOffset();

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={ariaExpanded}
        aria-haspopup="dialog"
        style={isDesktop ? undefined : { bottom: mobileBottom }}
        className={cn(
          "fixed right-4 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border outline-none",
          "transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-fg/20",
          "border-[light-dark(#e8e8e8,#333333)] bg-bg text-fg",
          "shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]",
          "hover:scale-105 hover:border-[light-dark(#d4d4d4,#444444)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.45)]",
          "active:scale-95",
          "aria-expanded:border-[light-dark(#d4d4d4,#444444)]",
          "aria-expanded:shadow-[0_3px_14px_rgba(0,0,0,0.12)] dark:aria-expanded:shadow-[0_3px_14px_rgba(0,0,0,0.4)]",
          "aria-expanded:hover:scale-105",
          "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
          isDesktop && "bottom-6",
        )}
        aria-label="Ask AI about your NYC trip"
      >
        <MessageCircleIcon
          className="size-4 transition-[fill] duration-200"
          fill={ariaExpanded ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    );
  },
);
