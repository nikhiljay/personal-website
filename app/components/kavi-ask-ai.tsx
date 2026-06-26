"use client";

import { useState } from "react";

import { KaviAskAiFab } from "./kavi-ask-ai-fab";
import { KaviAskAiSheet } from "./kavi-ask-ai-sheet";

export function KaviAskAi() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <KaviAskAiFab onClick={() => setOpen(true)} />
      <KaviAskAiSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
