import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** Creates a collection in the database */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);

    if (!body || typeof body !== "object" || !body.title) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid payload. Title is required.",
          },
        },
        { status: 400 }
      );
    }

    console.log("before prisma");

    await prisma.collection.create({
      data: {
        title: body.title,
        ownerId: "ojdpODZIQFJQUPIJDFQHIL",
      },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while adding category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  try {
    const action = params.get("action");
    const id = params.get("id");

    if (!action || !id) {
      return NextResponse.json(
        { error: { message: "Properties action, id are needed" } },
        { status: 400 }
      );
    }

    if (action === "rename") {
      const newtitle = params.get("newtitle");

      if (!newtitle) {
        return NextResponse.json(
          { error: { message: "Property newtitle needed" } },
          { status: 400 }
        );
      }

      await prisma.collection.update({
        where: { id },
        data: { title: newtitle },
      });
    }

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while deleting category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  try {
    const id = params.get("id");

    if (!id) {
      return NextResponse.json(
        { error: { message: "missing-parameters" } },
        { status: 400 }
      );
    }

    await prisma.collection.delete({ where: { id } });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while deleting category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
}
