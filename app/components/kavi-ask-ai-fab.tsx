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
        className="fixed right-4 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-[light-dark(#e8e8e8,#333333)] bg-bg text-fg shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        aria-label="Ask AI about your NYC trip"
      >
        <MessageCircleIcon className="size-4" aria-hidden="true" />
      </button>
    );
  },
);
