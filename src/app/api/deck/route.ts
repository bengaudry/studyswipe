import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serverError, serverOk } from "@/lib/errorHandling/serverErrors";

/** Creates a collection in the database */
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || !body.title || !body.collectionId)
      return serverError(
        "invalid-payload",
        "Missing properties: <title> <collectionId>"
      );

    const collection = await prisma.collection.findUnique({
      where: { id: body.collectionId },
    });

    if (collection === null) return serverError("invalid-collectionid");

    const session = await auth();
    if (session?.user?.id !== collection.ownerId)
      return serverError("unauthorized");

    await prisma.deck.create({
      data: {
        title: body.title,
        description: body.description,
        theme: body.theme ?? "neutral",
        collectionId: collection.id,
        ownerId: collection.ownerId,
      },
    });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};

export const PATCH = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const id = params.get("id");
    if (!id)
      return serverError("missing-parameters", "Parameter missing: <id>");

    const action = params.get("action");
    if (!action)
      return serverError("missing-parameters", "Parameter missing: <action>");

    const prevDeckValue = await prisma.deck.findUnique({ where: { id } });
    if (prevDeckValue === null) return serverError("invalid-deckid");

    const session = await auth();
    if (session?.user?.id !== prevDeckValue.ownerId)
      return serverError("unauthorized");

    if (action === "rename") {
      const newtitle = params.get("newtitle");

      if (!newtitle)
        return serverError(
          "missing-parameters",
          "Parameter missing: <newtitle>"
        );

      await prisma.deck.update({
        where: { id },
        data: { title: newtitle },
      });

      return serverOk();
    }

    if (action === "toggle-visibility") {
      await prisma.deck.update({
        where: { id },
        data: { isPublic: !prevDeckValue.isPublic },
      });

      return serverOk();
    }

    return serverError("invalid-patch-action");
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};

export const DELETE = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const id = params.get("id");
    if (!id)
      return serverError("missing-parameters", "Parameter missing: <id>");

    const prevDeck = await prisma.deck.findFirst({ where: { id } });
    if (prevDeck === null) return serverError("invalid-deckid");

    const session = await auth();
    if (session?.user?.id !== prevDeck.ownerId)
      return serverError("unauthorized");

    await prisma.deck.delete({ where: { id } });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};
