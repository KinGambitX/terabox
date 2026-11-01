import type { SVGProps } from "react";

type SiftMascotProps = SVGProps<SVGSVGElement> & {
  size?: number;
  title?: string;
};

type SourceLensLogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

export function SiftMascot({ size = 32, title, className, ...props }: SiftMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title && <title>{title}</title>}
      <path d="M12 5.5h14l8.5 8.5v20.5a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V9.5a4 4 0 0 1 4-4Z" fill="#F5F5F5" />
      <path d="M26 6v8h8" fill="#D4D4D4" />
      <circle cx="16.5" cy="20" r="1.8" fill="#171717" />
      <circle cx="24.5" cy="20" r="1.8" fill="#171717" />
      <path d="M17 25c1.8 2.2 5.2 2.2 7 0" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.5 31h9" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="33.5" cy="31.5" r="7.2" fill="#0A0A0A" stroke="#0284C7" strokeWidth="2.7" />
      <circle cx="33.5" cy="31.5" r="2" fill="#0284C7" />
      <path d="m38.5 36.5 4 4" stroke="#0284C7" strokeWidth="2.7" strokeLinecap="round" />
    </svg>
  );
}

export function SourceLensLogo({
  size = 30,
  showWordmark = true,
  className = "",
}: SourceLensLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-ink ${className}`}>
      <SiftMascot size={size} />
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.035em]">
          SourceLens
        </span>
      )}
    </span>
  );
}
