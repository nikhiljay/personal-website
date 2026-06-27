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
          <ol className="mb-2 list-none space-y-1 last:mb-0 [counter-reset:markdown-ol] [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:tabular-nums [&>li]:before:content-[counter(markdown-ol)'.'] [&>li]:[counter-increment:markdown-ol]">
            {content}
          </ol>
        ),
        ul: ({ children: content }) => (
          <ul className="mb-2 list-none space-y-1 last:mb-0 [&>li]:relative [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:content-['•']">
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
