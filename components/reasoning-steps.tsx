"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { REASONING_TEXT_CLASS } from "@/components/reasoning-text";
import { cn } from "@/lib/utils";

import "./reasoning-body.css";

type ReasoningInlineMarkdownProps = {
  children: string;
};

function ReasoningInlineMarkdown({ children }: ReasoningInlineMarkdownProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children: content }) => <>{content}</>,
        strong: ({ children: content }) => (
          <strong className="font-medium">{content}</strong>
        ),
        code: ({ children: content }) => (
          <code
            className="rounded-sm bg-muted/60 px-1 py-0.5 font-mono text-[0.6875rem]"
          >
            {content}
          </code>
        ),
        em: ({ children: content }) => <em>{content}</em>,
      }}
    >
      {children}
    </Markdown>
  );
}

function splitReasoningParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
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
      <p className={cn("reasoning-body-muted", REASONING_TEXT_CLASS)}>…</p>
    );
  }

  if (!trimmed) {
    return null;
  }

  const paragraphs = splitReasoningParagraphs(trimmed);
  const blocks =
    paragraphs.length > 0 ? paragraphs : [trimmed];

  return (
    <div className={cn("min-w-0", REASONING_TEXT_CLASS)}>
      {blocks.map((paragraph, index) => {
        const isActive = isStreaming && index === blocks.length - 1;

        return (
          <p
            key={paragraph.slice(0, 64)}
            className={cn(
              "mb-2 last:mb-0",
              isActive ? "reasoning-body-active" : "reasoning-body-muted",
            )}
          >
            <ReasoningInlineMarkdown>{paragraph}</ReasoningInlineMarkdown>
          </p>
        );
      })}
    </div>
  );
}
