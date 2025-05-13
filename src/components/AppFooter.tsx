"use client";
import { Link, Image } from "@/components/ui";

export function AppFooter() {
  return (
    <footer className="flex flex-col items-center justify-center gap-6">
      <section className="py-6 border-b-2 w-full flex flex-col items-center">
        <div className="flex flex-row gap-2 items-center mb-2">
          <Image src="/icon-png.png" alt="App icon" width={44} height={44} />
          <span className="font-semibold">Studyswipe</span>
        </div>
        <p className="text-sm">
          {new Date().getFullYear()} - © Ben GAUDRY - All rights reserved
        </p>
      </section>

      <section className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-10 pb-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-neutral-400">
            Terms and conditions
          </Link>
          <Link href="/" className="text-neutral-400">
            Privacy policy
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            target="_blank"
            href="https://github.com/bengaudry/studyswipe/issues"
            className="text-neutral-400"
          >
            Report an issue
          </Link>
          <Link href="mailto:bengaudry@outlook.fr" className="text-neutral-400">
            Submit a suggestion
          </Link>
          <Link
            target="_blank"
            href="https://github.com/bengaudry/studyswipe"
            className="text-neutral-400"
          >
            See on GitHub
          </Link>
        </div>
      </section>
    </footer>
  );
}
