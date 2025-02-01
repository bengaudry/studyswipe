"use client";
import { Progress } from "@nextui-org/react";
import { useContext } from "react";
import { PlaygroundContext } from "./PlayerContext";
import { clsx } from "clsx";
import { Deck } from "@prisma/client";

export function CardsPlaygroundProgress({ deck }: { deck: Deck }) {
  const { cards, counterOutOf, counter } = useContext(PlaygroundContext);

  return (
    <Progress
      className="fixed left-0 h-1 -mt-6 w-screen"
      classNames={{ indicator: clsx(`bg-${deck.theme}-500`) }}
      radius="none"
      value={
        counter === counterOutOf
          ? 0
          : (1 - (cards.length - 1) / counterOutOf) * 100
      }
    />
  );
}
