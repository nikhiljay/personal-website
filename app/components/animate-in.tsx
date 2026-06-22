import type { CSSProperties, ElementType, ReactNode } from "react";

import "./animate-in.css";

type AnimateInProps = {
  as?: ElementType;
  stagger?: number;
  className?: string;
  children: ReactNode;
};

export function AnimateIn({
  as: Tag = "div",
  stagger = 0,
  className,
  children,
}: AnimateInProps) {
  return (
    <Tag
      data-animate
      className={className}
      style={{ "--stagger": stagger } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
