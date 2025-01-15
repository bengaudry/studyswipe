"use client";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "react-feather";

export default function Home() {
  const { push } = useRouter();

  return (
    <>
      <section className="w-full h-[80vh] bg-gradient-to-b from-sky-50 to-sky-100 grid place-content-center">
        <h1 className="text-center text-4xl font-semibold sm:text-5xl md:text-6xl md:font-bold lg:text-7xl">
          Learn your course
          <br />
          by playing it
        </h1>
        <Button
          size="lg"
          onPress={() => push("/decks")}
          className="mt-6 w-fit mx-auto"
          color="primary"
          radius="full"
          endContent={<ArrowRight />}
        >
          Create a flashcard
        </Button>
      </section>
    </>
  );
}
