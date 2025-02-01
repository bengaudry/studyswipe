"use client";
import { Progress } from "@nextui-org/react";
import { useContext } from "react";
import { PlaygroundContext } from "./PlayerContext";
import { clsx } from "clsx";
import { Deck } from "@prisma/client";

export function CardsPlaygroundProgress({ deck }: { deck: Deck }) {
  const { cards, counterOutOf } = useContext(PlaygroundContext);

  return (
    <Progress
      className="h-1 -mx-6 -mt-6 w-screen"
      classNames={{ indicator: clsx(`bg-${deck.theme}-500`) }}
      radius="none"
      value={(1- (cards.length - 1) / counterOutOf)*100}
    />
  );
}
