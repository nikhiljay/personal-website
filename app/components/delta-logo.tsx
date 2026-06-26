import Image from "next/image";

const DELTA_LOGO_WIDTH = 14;
const DELTA_LOGO_HEIGHT = 11;

export function DeltaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/delta-widget.png"
      alt=""
      aria-hidden
      width={DELTA_LOGO_WIDTH}
      height={DELTA_LOGO_HEIGHT}
      loading="lazy"
      className={`h-[11px] w-auto shrink-0 ${className ?? ""}`}
    />
  );
}
