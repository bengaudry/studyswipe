import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Creates a collection in the database */
export const POST = auth(async (req) => {
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
});

export const DELETE = auth(async (req) => {
  const params = req.nextUrl.searchParams;
  try {
    // const id = params.get("id");

    // if (!id) {
    //   return NextResponse.json(
    //     { error: { message: "missing-parameters" } },
    //     { status: 400 }
    //   );
    // }

    // await prisma.collection.delete({ where: { id } });

    // TODO

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while deleting card :\n", err);
    return NextResponse.json(
      { error: { message: "failed-deleting-card-from-db" } },
      { status: 501 }
    );
  }
});
