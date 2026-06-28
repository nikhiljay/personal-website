"use client"

import type * as React from "react"
import { useMemo } from "react"

import { cn } from "@/lib/utils"

import "./shimmering-text.css"

interface ShimmeringTextProps {
  /** Text to display with shimmer effect */
  text: string
  /** Animation duration in seconds */
  duration?: number
  /** Delay before starting animation */
  delay?: number
  /** Whether to repeat the animation */
  repeat?: boolean
  /** Custom className */
  className?: string
  /** Shimmer spread multiplier */
  spread?: number
  /** Base text color */
  color?: string
  /** Shimmer highlight color */
  shimmerColor?: string
}

export function ShimmeringText({
  text,
  duration = 1.6,
  delay = 0,
  repeat = true,
  className,
  spread = 2,
  color,
  shimmerColor,
}: ShimmeringTextProps) {
  const dynamicSpread = useMemo(() => text.length * spread, [text, spread])

  return (
    <span
      className={cn(
        "shimmering-text relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--base-color:var(--muted-foreground)] [--shimmer-color:var(--foreground)]",
        "[background-repeat:no-repeat,padding-box]",
        "[--shimmer-bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),var(--shimmer-color),transparent_calc(50%+var(--spread)))]",
        !repeat && "shimmering-text-once",
        className,
      )}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          "--shimmer-duration": `${duration}s`,
          "--shimmer-delay": `${delay}s`,
          ...(color && { "--base-color": color }),
          ...(shimmerColor && { "--shimmer-color": shimmerColor }),
          backgroundImage:
            "var(--shimmer-bg), linear-gradient(var(--base-color), var(--base-color))",
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  )
}
