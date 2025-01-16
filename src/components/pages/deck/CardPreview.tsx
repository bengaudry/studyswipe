"use client";
import clsx from "clsx";
import React from "react";
import { Image } from "@nextui-org/react";
import { Edit2, Trash } from "react-feather";

export const CardPreview = React.forwardRef<
  HTMLDivElement,
  {
    card: FlashCard;
    deckTheme: string;
    onAskEdit: () => void;
    onAskDelete: () => void;
  }
>(({ card, deckTheme, onAskEdit, onAskDelete }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        `group relative border-2 aspect-square border-neutral-200 bg-${deckTheme}-500/20 transition-colors rounded-lg overflow-hidden p-2 sm:p-4 cursor-default`
      )}
    >
      <div className=" grid place-content-center w-full h-full">
        {card.question.map((value) => {
          if (value.type === "text") return value.text;
          if (value.type === "image")
            return <Image src={value.imgUri} alt={value.alt} />;
        })}
      </div>
      <div className="absolute left-0 bottom-0 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform w-full bg-gradient-to-b from-black/0 to-black/30 py-2">
        <button
          onClick={onAskDelete}
          className="rounded-full p-2 hover:bg-neutral-200/50"
        >
          <Trash />
        </button>
        <button
          onClick={onAskEdit}
          className="rounded-full p-2 hover:bg-neutral-200/50"
        >
          <Edit2 />
        </button>
      </div>
    </div>
  );
});
