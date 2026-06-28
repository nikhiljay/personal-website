import type { ReactNode } from "react";
import { memo, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sanitizeAssistantText } from "@/app/lib/sanitize-assistant-text";
import { cn } from "@/lib/utils";

type MessageMarkdownProps = {
  children: string;
  className?: string;
};

const messageMarkdownComponents = {
  p: ({ children: content }: { children?: ReactNode }) => (
    <p className="mb-2 last:mb-0">{content}</p>
  ),
  strong: ({ children: content }: { children?: ReactNode }) => (
    <strong className="font-semibold">{content}</strong>
  ),
  ol: ({ children: content }: { children?: ReactNode }) => (
    <ol className="mb-2 list-none space-y-1 last:mb-0 [counter-reset:markdown-ol] [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:tabular-nums [&>li]:before:content-[counter(markdown-ol)'.'] [&>li]:[counter-increment:markdown-ol]">
      {content}
    </ol>
  ),
  ul: ({ children: content }: { children?: ReactNode }) => (
    <ul className="mb-2 list-none space-y-1 last:mb-0 [&>li]:relative [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:content-['•']">
      {content}
    </ul>
  ),
  li: ({ children: content }: { children?: ReactNode }) => (
    <li>{content}</li>
  ),
};

export const MessageMarkdown = memo(function MessageMarkdown({
  children,
  className,
}: MessageMarkdownProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={messageMarkdownComponents}>
        {children}
      </Markdown>
    </div>
  );
});

type AssistantMessageContentProps = {
  text: string;
  className?: string;
};

export const AssistantMessageContent = memo(function AssistantMessageContent({
  text,
  className,
}: AssistantMessageContentProps) {
  const sanitized = useMemo(() => sanitizeAssistantText(text), [text]);

  return <MessageMarkdown className={className}>{sanitized}</MessageMarkdown>;
});
