"use client";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui";
import { ArrowRight, Check, Plus } from "react-feather";

export default function LandingPage() {
  const { push } = useRouter();

  return (
    <>
      <section className="relative w-full h-[80vh] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center rounded-3xl border flex-1 w-full h-full max-w-screen-2xl dotted-bg">
          <h1 className="text-center text-secondary-950 text-4xl font-semibold sm:text-5xl md:text-6xl md:font-bold lg:text-7xl">
            Learn your course
            <br />
            like it is a game
          </h1>
          <p className="mt-4 text-lg max-w-sm text-center mx-auto text-neutral-500 leading-6">
            Turn your courses into flashcards to memoize more easily all the
            topics of it
          </p>
          <Button
            size="lg"
            onPress={() => push("/decks")}
            className="mt-6 w-fit mx-auto"
            color="primary"
            endContent={<ArrowRight />}
          >
            Create a flashcard
          </Button>
        </div>

        <Plus
          className=" absolute top-6 left-6 rotate-[60deg] text-neutral-300 blur-sm"
          size={200}
        />
        <Check
          className="absolute -rotate-12 bottom-6 right-6 text-neutral-300 blur-sm"
          size={200}
        />
      </section>

      <AppFooter />
    </>
  );
}
