"use client";
import { Button } from "@nextui-org/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

      <footer className="flex flex-col items-center justify-center gap-6">
        <section className="py-6 border-b-2 w-full flex flex-col items-center">
          <div className="flex flex-row gap-2 items-center mb-2">
            <Image src="/icon-png.png" alt="App icon" width={44} height={44} />
            <span className="font-semibold">Studyswipe</span>
          </div>
          <p className="text-sm">
            {new Date().getFullYear()} - © Ben GAUDRY - All rights reserved
          </p>
        </section>

        <section className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-10 pb-6">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-neutral-400">
              Terms and conditions
            </Link>
            <Link href="/" className="text-neutral-400">
              Privacy policy
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <Link target="_blank" href="https://github.com/bengaudry/studyswipe/issues" className="text-neutral-400">
              Report an issue
            </Link>
            <Link href="mailto:bengaudry@outlook.fr" className="text-neutral-400">
              Submit a suggestion
            </Link>
            <Link target="_blank" href="https://github.com/bengaudry/studyswipe" className="text-neutral-400">
              See on GitHub
            </Link>
          </div>
        </section>
      </footer>
    </>
  );
}
