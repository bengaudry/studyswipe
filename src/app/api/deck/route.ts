import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serverError, serverOk } from "@/lib/errorHandling/serverErrors";
import {
  MAX_DECK_DESCRIPTION_LENGTH,
  MAX_DECK_TITLE_LENGTH,
} from "@/lib/constants";

/** Creates a collection in the database */
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || !body.title || !body.collectionId)
      return serverError(
        "invalid-payload",
        "Missing properties: <title> <collectionId>"
      );

    if (typeof body.title !== "string")
      return serverError(
        "invalid-payload",
        "Property <title> must be of type string"
      );

    if (body.title.length > MAX_DECK_TITLE_LENGTH)
      return serverError(
        "invalid-payload",
        `Property <title> exceeds the maximum number of characters (${body.title.length}/${MAX_DECK_TITLE_LENGTH})`
      );

    if (typeof body.description !== "string")
      return serverError(
        "invalid-payload",
        "Property <description> must be of type string"
      );

    if (body.description.length > MAX_DECK_TITLE_LENGTH)
      return serverError(
        "invalid-payload",
        `Property <description> exceeds the maximum number of characters (${body.description.length}/${MAX_DECK_DESCRIPTION_LENGTH})`
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

      if (newtitle.length > MAX_DECK_TITLE_LENGTH)
        return serverError(
          "invalid-payload",
          `Property <newtitle> exceeds the maximum number of characters (${newtitle.length}/${MAX_DECK_TITLE_LENGTH})`
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
