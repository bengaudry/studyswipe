import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function DiscoverPage() {
  const decks = await prisma.deck.findMany({
    where: { isPublic: true, cards: { isEmpty: false } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <>
      <h1 className="text-3xl font-semibold mb-4">Discover</h1>
      {decks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/play/${deck.id}`}
              className={`aspect-square w-full flex items-end justify-start text-left border border-neutral-200 bg-opacity-10 bg-${deck.theme}-500 rounded-xl p-3 hover:bg-opacity-30 transition-colors`}
            >
              <span className="text-sm leading-4 font-medium">
                {deck.title}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p>No decks were found.</p>
      )}
    </>
  );
}
