import { Image, Alert } from "@nextui-org/react";
import clsx from "clsx";
import Latex from "react-latex-next";

export type FlashcardContentProps = { content: FlashCardContentJSON };

export function FlashcardContent({ content }: FlashcardContentProps) {
  switch (content.type) {
    case "text":
      return (
        <p
          className={`bg-transparent whitespace-normal ${
            content.heading === "title" && "text-2xl font-semibold"
          } ${content.heading === "subtitle" && "text-xl font-medium"}`}
        >
          {content.text || ""}
        </p>
      );
    case "equation":
      return (
        <Latex>${content.equation}$</Latex>
      );
    case "quote":
      return (
        <p
          className={`bg-transparent whitespace-normal px-3 py-1 font-["Imperial_Script",sans-serif] font-medium text-4xl`}
        >
          {"« "}
          {content.content || "Your quote here"}
          {" »"}
        </p>
      );
    case "link":
      let parsedUrl: URL | null;
      try {
        parsedUrl = new URL(content.href);
      } catch (err) {
        return (
          <Alert
            color="warning"
            title="An URL was hidden because it was invalid"
          />
        );
      }
      return (
        <a
          href={content.href}
          target="_blank"
          className="text-blue-600 underline underline-offset-2"
          onClick={(e) => {
            e.preventDefault();
            if (
              confirm(
                "Links are not verified by Studyswipe. Please be sure of what you are doing. Studyswipe will take no responsibility in case of any problem related to this link."
              )
            ) {
              window.open(content.href, "_blank");
            }
          }}
        >
          {parsedUrl.hostname}
        </a>
      );

    default:
      return null; // Extend here for other content types like images or equations.
  }
}

export type FlashcardPreviewProps = {
  isActive: boolean;
  content: FlashCardContentJSON[];
  decktheme: string;
};

export function FlashcardPreview({
  isActive,
  content,
  decktheme,
}: FlashcardPreviewProps) {
  return (
    <div
      className={clsx(
        `absolute inset-0 w-full h-full bg-${decktheme}-500/20 shadow-xl rounded-lg p-6 overflow-y-scroll grid place-content-center gap-2 ${
          isActive
            ? "scale-100 opacity-100 shadow-neutral-500/20"
            : "scale-85 opacity-0 shadow-neutral-500/0"
        } transition-all`
      )}
    >
      {content.map((value, idx) => (
        <FlashcardContent key={idx} content={value} />
      ))}
    </div>
  );
}
