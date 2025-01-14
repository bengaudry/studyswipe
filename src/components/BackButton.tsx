"use client";
import { cn } from "@nextui-org/react";
import Link from "next/link";
import { ChevronLeft } from "react-feather";
import { useRouter } from "next/navigation";

export function BackButton({
  href,
  className,
  ...props
}: {
  href?: string;
  className?: string;
}) {
  const { prefetch } = useRouter();
  
  return (
    <Link
      href={href ?? ".."}
      onMouseEnter={() => prefetch(href ?? "..")}
      className={cn("text-neutral-400 flex items-center mb-3", className)}
      {...props}
    >
      <ChevronLeft />
      <span> Back</span>
    </Link>
  );
}
