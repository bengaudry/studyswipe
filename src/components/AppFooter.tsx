import { FooterLinks } from "./FooterLinks";
import { AppIcon } from "./AppIcon";

export function AppFooter() {
  return (
    <footer className="flex flex-col items-center justify-center gap-6">
      <section className="py-6 border-b-2 w-full flex flex-col items-center">
        <div className="flex flex-row gap-2 items-center mb-2">
          <AppIcon />
          <span className="font-semibold">Studyswipe</span>
        </div>
        <p className="text-sm">
          {new Date().getFullYear()} - © Ben GAUDRY - All rights reserved
        </p>
      </section>

      <section className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-10 pb-6">
        <FooterLinks />
      </section>
    </footer>
  );
}
