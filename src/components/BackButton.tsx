"use client";
import { cn } from "@nextui-org/react";
import Link from "next/link";
import { ChevronLeft } from "react-feather";
import { useRouter } from "next/navigation";

export type BackButtonProps = {
  href?: string;
  className?: string;
  onlyIcon?: boolean;
};

export function BackButton({
  href,
  className,
  onlyIcon,
  ...props
}: BackButtonProps) {
  const { prefetch, back } = useRouter();

  return (
    <Link
      href={href ?? ""}
      onClick={() => {
        if (!href) back();
      }}
      onMouseEnter={() => prefetch(href ?? "..")}
      className={cn("text-neutral-400 flex items-center", className)}
      {...props}
    >
      <ChevronLeft />
      {!onlyIcon && <span> Back</span>}
    </Link>
  );
}
