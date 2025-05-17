"use client";
import clsx from "clsx";
import React from "react";
import Latex from "react-latex-next";
import { Checkbox, Image } from "@/components/ui";

export function CardPreview({
  card,
  deckTheme,
  onAskEdit,
  isBeingDeleted,
  isSelected,
  onSelect,
  onUnSelect,
}: {
  card: FlashCard;
  deckTheme: string;
  onAskEdit: () => void;
  isBeingDeleted: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUnSelect: () => void;
}) {
  return (
    <button
      onClick={onAskEdit}
      className={clsx(
        `group relative border-2 aspect-square bg-${deckTheme}-500 bg-opacity-20 dark:bg-opacity-40 transition-all rounded-lg overflow-hidden p-2 sm:p-3 ${
          isBeingDeleted && "opacity-30"
        }`
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
        {card.question?.map((value, idx) => (
          <div key={idx} className="text-sm leading-4 text-center">
            {value.type === "text" && value.text}
            {value.type === "image" && (
              <Image src={value.imgUri} alt={value.alt} />
            )}
            {value.type === "equation" && <Latex>$ {value.equation} $</Latex>}
          </div>
        ))}
      </div>
      <div className="p-3 left-0 top-0 absolute">
        <Checkbox
          radius="full"
          size="lg"
          classNames={{ wrapper: "shadow-xl border-2 border-white" }}
          isSelected={isSelected}
          onValueChange={(v) => {
            if (v) {
              onSelect();
            } else onUnSelect();
          }}
        />
      </div>
      <div className="px-2 absolute left-0 bottom-0 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform w-full bg-gradient-to-b from-black/0 to-black/20 backdrop-blur-md py-1">
        <span className="text-sm text-neutral-400">Click to edit</span>
        {/* <button
          onClick={onAskDelete}
          className="rounded-xl p-2 hover:bg-neutral-100/70 dark:hover:bg-neutral-900 active:scale-90 transition-all"
        >
          <Trash size={22} />
        </button>
        <button
          onClick={onAskEdit}
          className="rounded-xl p-2 hover:bg-neutral-100/70 dark:hover:bg-neutral-900 active:scale-90 transition-all"
        >
          <Edit2 size={22} />
        </button> */}
      </div>
    </button>
  );
}
