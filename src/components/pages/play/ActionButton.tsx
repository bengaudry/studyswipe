import clsx from "clsx";
import { JSX } from "react";

export type ActionButtonProps = {
  color: string;
  onClick: () => void;
  Icon: JSX.Element;
  position?: "left" | "right";
  disabled?: boolean;
};

/** The "fingers" at the bottom of the screen */
export function ActionButton({
  color,
  onClick,
  Icon,
  position = "left",
  disabled,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute flex items-start h-80 w-28 -bottom-32 ${
        position === "left" ? "left-2 rotate-12" : "right-2 -rotate-12"
      } ${
        disabled
          ? "scale-85 grayscale cursor-default"
          : "md:hover:-translate-y-6 active:scale-95"
      } rounded-t-full border-2 border-dashed border-neutral-300 transition-all shadow-xl`}
    >
      <div
        className={clsx(
          `w-full aspect-square bg-${color}-100 rounded-full grid place-content-center`
        )}
      >
        {Icon}
      </div>
    </button>
  );
}
