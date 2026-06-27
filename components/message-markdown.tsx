import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MessageMarkdownProps = {
  children: string;
  className?: string;
};

export function MessageMarkdown({ children, className }: MessageMarkdownProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
        p: ({ children: content }) => (
          <p className="mb-2 last:mb-0">{content}</p>
        ),
        strong: ({ children: content }) => (
          <strong className="font-semibold">{content}</strong>
        ),
        ol: ({ children: content }) => (
          <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">
            {content}
          </ol>
        ),
        ul: ({ children: content }) => (
          <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">
            {content}
          </ul>
        ),
        li: ({ children: content }) => <li>{content}</li>,
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
