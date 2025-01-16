import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** Creates a collection in the database */
export const POST = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const deckid = params.get("deckid");

    if (!deckid)
      return NextResponse.json(
        { error: { message: "Deck id missing " } },
        { status: 400 }
      );

    const body = await req.json();
    console.log(body);

    if (!body || typeof body !== "object" || !body.question || !body.answer) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid payload. Card is not in the correct format.",
          },
        },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.findFirst({
      where: {
        id: deckid,
      },
    });

    if (!deck)
      return NextResponse.json(
        { error: { message: "Deck does not exist" } },
        { status: 400 }
      );

    const cards = deck.cards as FlashCard[];
    cards.push(body);

    await prisma.deck.update({
      where: { id: deckid },
      data: { ...deck, cards },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while adding category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const deckid = params.get("deckid");
    const cardindex = params.get("cardindex");

    if (!deckid || !cardindex) {
      return NextResponse.json(
        { error: { message: "Paramz deckid, cardindex are missing" } },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || !body.question || !body.answer) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid payload. Card is not in the correct format.",
          },
        },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.findFirst({
      where: {
        id: deckid,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: { message: "Deck does not exist" } },
        { status: 400 }
      );
    }

    const newCards: FlashCard[] = (deck.cards as FlashCard[]).map(
      (card, idx) => {
        if (idx === parseInt(cardindex)) {
          return { question: body.question, answer: body.answer };
        }
        return card;
      }
    );

    await prisma.deck.update({
      where: { id: deck.id },
      data: { ...deck, cards: newCards },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while adding category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-changing-card-data" } },
      { status: 501 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const deckid = params.get("deckid");
    const cardindex = params.get("cardindex");

    if (!deckid || !cardindex) {
      return NextResponse.json(
        { error: { message: "Paramz deckid, cardindex are missing" } },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.findFirst({
      where: {
        id: deckid,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: { message: "Deck does not exist" } },
        { status: 400 }
      );
    }

    console.log("Deck cards :", deck.cards);
    const newCards = (deck.cards as FlashCard[])
    newCards.splice(parseInt(cardindex), 1);
    console.log("New cards :", newCards);

    await prisma.deck.update({
      where: { id: deck.id },
      data: { ...deck, cards: newCards },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while deleting card :\n", err);
    return NextResponse.json(
      { error: { message: "failed-deleting-card-from-db" } },
      { status: 501 }
    );
  }
};
