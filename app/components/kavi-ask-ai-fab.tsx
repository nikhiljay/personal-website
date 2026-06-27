"use client";

import { MessageCircleIcon } from "lucide-react";
import { forwardRef } from "react";

type KaviAskAiFabProps = {
  onClick: () => void;
  "aria-expanded"?: boolean;
};

export const KaviAskAiFab = forwardRef<HTMLButtonElement, KaviAskAiFabProps>(
  function KaviAskAiFab({ onClick, "aria-expanded": ariaExpanded }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={ariaExpanded}
        aria-haspopup="dialog"
        className="fixed right-6 bottom-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-[light-dark(#e8e8e8,#333333)] bg-bg px-4 py-2.5 text-[13px] text-fg shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80 dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        aria-label="Ask AI about your NYC trip"
      >
        <MessageCircleIcon className="size-4" aria-hidden="true" />
        Ask AI
      </button>
    );
  },
);
