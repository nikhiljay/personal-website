"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { REASONING_TEXT_CLASS } from "@/components/reasoning-text";
import { cn } from "@/lib/utils";

import "./reasoning-body.css";

type ReasoningInlineMarkdownProps = {
  children: string;
  isActive?: boolean;
};

function createReasoningMarkdownComponents(isActive: boolean) {
  const blockClass = isActive ? "reasoning-body-active" : "reasoning-body-muted";

  return {
    p: ({ children: content }: { children?: ReactNode }) => (
      <p className={cn("mb-2 last:mb-0", blockClass)}>{content}</p>
    ),
    ul: ({ children: content }: { children?: ReactNode }) => (
      <ul className={cn("mb-2 list-disc pl-4 last:mb-0", blockClass)}>
        {content}
      </ul>
    ),
    ol: ({ children: content }: { children?: ReactNode }) => (
      <ol className={cn("mb-2 list-decimal pl-4 last:mb-0", blockClass)}>
        {content}
      </ol>
    ),
    li: ({ children: content }: { children?: ReactNode }) => (
      <li className="mb-0.5">{content}</li>
    ),
    strong: ({ children: content }: { children?: ReactNode }) => (
      <strong className="font-medium">{content}</strong>
    ),
    code: ({ children: content }: { children?: ReactNode }) => (
      <code className="rounded-sm bg-muted/60 px-1 py-0.5 font-mono text-[0.6875rem]">
        {content}
      </code>
    ),
    em: ({ children: content }: { children?: ReactNode }) => <em>{content}</em>,
  };
}

function ReasoningInlineMarkdown({
  children,
  isActive = false,
}: ReasoningInlineMarkdownProps) {
  const components = useMemo(
    () => createReasoningMarkdownComponents(isActive),
    [isActive],
  );

  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </Markdown>
  );
}

export function ReasoningBody({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const trimmed = text.trim();

  if (!trimmed && isStreaming) {
    return (
      <div className={cn("reasoning-body-muted", REASONING_TEXT_CLASS)}>…</div>
    );
  }

  if (!trimmed) {
    return null;
  }

  return (
    <div className={cn("min-w-0", REASONING_TEXT_CLASS)}>
      <ReasoningInlineMarkdown isActive={isStreaming}>
        {trimmed}
      </ReasoningInlineMarkdown>
    </div>
  );
}
