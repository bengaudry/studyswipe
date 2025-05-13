"use client";
import { clsx } from "clsx";
import { Reorder } from "motion/react";
import Latex from "react-latex-next";
import { LatexToolbar } from "./LatexToolbar";
import { Plus, Feather, Link2 } from "react-feather";
import { DeckDataContext } from "./DeckDataProvider";
import {
  Button,
  useDisclosure,
  Input,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Accordion,
  AccordionItem,
} from "@/components/ui";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export function NewCardModalTrigger({
  onOpen,
  isDisabled,
}: {
  onOpen?: () => void;
  isDisabled?: boolean;
}) {
  return (
    <Button
      isDisabled={isDisabled}
      variant="faded"
      className="w-full h-full aspect-square"
      startContent={<Plus />}
      onPress={onOpen}
    >
      Create a card
    </Button>
  );
}

function useTailwindBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("base");

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint("base");
      else if (width < 768) setBreakpoint("sm");
      else if (width < 1024) setBreakpoint("md");
      else if (width < 1280) setBreakpoint("lg");
      else if (width < 1536) setBreakpoint("xl");
      else setBreakpoint("2xl");
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

function ToolSelector({
  onAddElement,
}: {
  onAddElement: (newElement: FlashCardContentJSON) => void;
}) {
  const twBreakpoint = useTailwindBreakpoint();
  const tools: { el: FlashCardContentJSON; representingElement: ReactNode }[] =
    [
      {
        el: {
          type: "text",
          heading: "title",
          text: "",
        },
        representingElement: <span className="text-xl font-bold">H1</span>,
      },
      {
        el: {
          type: "text",
          heading: "subtitle",
          text: "",
        },
        representingElement: <span className="text-lg font-semibold">H2</span>,
      },
      {
        el: {
          type: "text",
          heading: "paragraph",
          text: "",
        },
        representingElement: <span>Text</span>,
      },
      {
        el: { type: "equation", equation: "" },
        representingElement: <Latex>$\sqrt{"{x}"}$</Latex>,
      },
      {
        el: { type: "quote", content: "" },
        representingElement: <Feather />,
      },
      {
        el: { type: "link", href: "" },
        representingElement: <Link2 />,
      },
    ];

  let elPerRow = 6;
  switch (twBreakpoint) {
    case "base":
      elPerRow = 3;
      break;
    default:
      elPerRow = 6;
      break;
  }

  return (
    <div className="flex flex-col gap-y-1 mx-2">
      <div className="grid grid-cols-3 sm:grid-cols-6 mx-auto w-full border rounded-lg">
        {tools.map((tool, idx) => {
          // Get the screen resolution for tailwind (sm, md, ...)
          const hasRightNeighbour = (idx + 1) % elPerRow !== 0;
          const nbElementsOnBottomLine = tools.length % elPerRow || elPerRow;
          const nbElementsWithoutBottomLine =
            tools.length - nbElementsOnBottomLine;
          const hasBottomNeighbour = idx < nbElementsWithoutBottomLine;
          const isTopRight = idx + 1 === elPerRow;
          const isBottomRight = idx === tools.length - 1 && !hasRightNeighbour;
          const isTopLeft = idx === 0;
          const isBottomLeft = idx % elPerRow === 0;

          return (
            <button
              key={tool.el.type}
              className={`flex items-center justify-center p-2 hover:bg-neutral-100/50 dark:hover:bg-neutral-800 active:scale-95 transition-all
              ${hasRightNeighbour ? "border-r-1" : "border-r-0"}
              ${hasBottomNeighbour ? "border-b-1" : "border-b-0"}
              ${isTopLeft ? "rounded-tl-lg" : ""}
              ${isBottomLeft ? "rounded-bl-lg" : ""}
              ${isTopRight ? "rounded-tr-lg" : ""}
              ${isBottomRight ? "rounded-br-lg" : ""}
            `}
              onClick={() => onAddElement(tool.el)}
            >
              {tool.representingElement}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Provide `card` if this if for editing the card */
export function NewCardModal({
  deckid,
  card,
}: {
  deckid: string;
  card?: { data: FlashCard; index: number };
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState<"question" | "answer">("question");
  const [questionContent, setQuestionContent] = useState<
    FlashCardContentJSON[]
  >([]);
  const [answerContent, setAnswerContent] = useState<FlashCardContentJSON[]>(
    []
  );

  const { data: deckData, updateDeckData } = useContext(DeckDataContext);

  useEffect(() => {
    if (card) {
      setQuestionContent(card.data.question);
      setAnswerContent(card.data.answer);
      onOpen();
    }
  }, [card]);

  const createCard = async (cardBody: FlashCard) => {
    const prevCardState = deckData;
    try {
      updateDeckData((prevDeck) => ({
        ...prevDeck,
        cards: [...prevDeck.cards, cardBody],
      }));

      await fetch(`/api/card?deckid=${deckid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardBody),
      });
    } catch (err) {
      if (prevCardState) updateDeckData(prevCardState);
    }
  };

  const editCard = async (cardBody: FlashCard) => {
    if (!card) return;
    const prevDeckState = deckData;

    try {
      updateDeckData((prevDeck) => ({
        ...prevDeck,
        cards: [
          ...prevDeck.cards.slice(0, card.index),
          cardBody,
          ...prevDeck.cards.slice(card.index + 1),
        ],
      }));

      // Edit the card otherwise
      await fetch(`/api/card?deckid=${deckid}&cardindex=${card.index}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardBody),
      });
    } catch (err) {
      if (prevDeckState) updateDeckData(prevDeckState);
    }
  };

  const handleCardChanges = async (onClose: () => void) => {
    setLoading(true);
    try {
      const cardBody = {
        question: questionContent,
        answer: answerContent,
      } as FlashCard;

      // Create a card if we are creating a card
      if (card === undefined) await createCard(cardBody);
      else await editCard(cardBody);
    } finally {
      setLoading(false);
      onClose();
      setAnswerContent([]);
      setQuestionContent([]);
      setCurrent("question");
    }
  };

  const handleAddElement = (newElement: FlashCardContentJSON) => {
    if (current === "question")
      setQuestionContent((prev) => [...prev, newElement]);
    else setAnswerContent((prev) => [...prev, newElement]);
  };

  return (
    <>
      <NewCardModalTrigger onOpen={onOpen} />
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isKeyboardDismissDisabled
        placement="bottom"
        size="5xl"
        classNames={{
          backdrop: !isOpen && "pointer-events-none",
          body: isOpen ? "px-2 sm:px-6" : "pointer-events-none",
          wrapper: `max-w-screen-sm mx-auto ${
            !isOpen && "pointer-events-none"
          }`,
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1 data-[open=false]:pointer-events-none">
                Create a new card
              </DrawerHeader>
              <DrawerBody >
                <ToolSelector onAddElement={handleAddElement} />

                <Accordion variant="splitted" isCompact defaultExpandedKeys={["question"]}>
                  <AccordionItem
                    key="question"
                    title="Question"
                    onPress={() => setCurrent("question")}
                  >
                    <FlashcardPreview
                      content={questionContent}
                      updateContent={setQuestionContent}
                    />
                  </AccordionItem>

                  <AccordionItem
                    key="answer"
                    title="Answer"
                    onPress={() => setCurrent("answer")}
                  >
                    <FlashcardPreview
                      content={answerContent}
                      updateContent={setAnswerContent}
                    />
                  </AccordionItem>
                </Accordion>
              </DrawerBody>
              <DrawerFooter>
                <Button color="primary" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  isDisabled={
                    answerContent.length < 1 || questionContent.length < 1
                  }
                  color="primary"
                  isLoading={loading}
                  onPress={() => handleCardChanges(onClose)}
                >
                  {card ? "Edit card" : "Create card"}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

function FlashcardPreview({
  content,
  updateContent,
}: {
  content: FlashCardContentJSON[];
  updateContent: Dispatch<SetStateAction<FlashCardContentJSON[]>>;
}) {
  return (
    <div
      className={clsx(
        `w-full h-full border rounded-lg mb-3 p-3 flex flex-col gap-2 transition-all`
      )}
    >
      {content.length > 0 ? (
        <Reorder.Group values={content} onReorder={updateContent}>
          {content.map((value, idx) => (
            <Reorder.Item value={value} key={idx} index={idx}>
              <ContentElement
                key={idx}
                content={value}
                onUpdate={(updatedValue) =>
                  updateContent((prev) =>
                    prev.map((item, itemIdx) =>
                      itemIdx === idx ? updatedValue : item
                    )
                  )
                }
                onDelete={() =>
                  updateContent((prev) => {
                    return prev.filter((_, i) => i !== idx);
                  })
                }
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <p className="text-neutral-400 text-center text-sm">No content yet.</p>
      )}
    </div>
  );
}

function ContentElement({
  content,
  onUpdate,
  onDelete,
}: {
  content: FlashCardContentJSON;
  onUpdate: (updatedContent: FlashCardContentJSON) => void;
  onDelete: () => void;
}) {
  const [isFocused, setFocused] = useState(false);

  if (content.type === "image") return null; // TODO

  return (
    <div
      className={`group relative border-2 border-dashed rounded-lg transition-colors ${
        isFocused
          ? "border-black shadow-md"
          : "border-neutral-300 hover:border-neutral-500"
      }`}
    >
      {content.type === "text" && (
        <>
          <button className="block w-full" onClick={() => setFocused(true)}>
            <p
              className={`bg-transparent whitespace-normal px-3 py-1 min-h-4 bg-red-500 block ${
                content.heading === "title" && "text-2xl font-semibold"
              } ${content.heading === "subtitle" && "text-xl font-medium"}`}
            >
              {content.text || "Your text here..."}
            </p>
          </button>
          {isFocused && (
            <textarea
              value={content.text || ""}
              autoFocus
              className={`absolute z-40 top-full left-0 mt-2 rounded-lg w-full h-full overflow-y-scroll whitespace-normal p-2`}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            />
          )}
        </>
      )}

      {content.type === "quote" && (
        <>
          <button onClick={() => setFocused(true)}>
            <p
              className={`bg-transparent whitespace-normal px-3 py-1 font-["Imperial_Script",sans-serif] font-medium text-4xl`}
            >
              {"« "}
              {content.content || "Your quote here"}
              {" »"}
            </p>
          </button>
          {isFocused && (
            <textarea
              value={content.content || ""}
              autoFocus
              className={`absolute z-40 top-full left-0 mt-2 rounded-lg w-full h-full overflow-y-scroll whitespace-normal p-2`}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) =>
                onUpdate({ ...content, content: e.target.value })
              }
            />
          )}
        </>
      )}

      {content.type === "equation" && (
        <>
          <button
            onClick={() => setFocused(true)}
            className="w-full py-2 grid place-content-center"
          >
            <Latex>$ {content.equation || "$Your equation here$"} $</Latex>
          </button>
          {isFocused && (
            <>
              {/* <div className="absolute z-50 bottom-full mb-2 h-fit rounded-lg bg-white p-2 w-fit">
                <LatexToolbar
                  onAddElement={(element) =>
                    onUpdate({
                      ...content,
                      equation: content.equation + element,
                    })
                  }
                />
              </div> */}
              <textarea
                placeholder="Type your equation in LaTex format here. The text can be placed either with \text{...} or with $...$."
                autoFocus
                autoCorrect="false"
                autoComplete="false"
                value={content.equation || ""}
                onBlur={() => setFocused(false)}
                wrap="hard"
                rows={2}
                className={`absolute z-40 top-full mt-2 bg-white rounded-lg w-full h-fit overflow-y-scroll p-2`}
                onChange={(e) =>
                  onUpdate({ ...content, equation: e.target.value })
                }
              />
            </>
          )}
        </>
      )}

      {content.type === "link" && (
        <Input
          label="URL"
          placeholder="https://studyswipe.vercel.app/"
          value={content.href}
          classNames={{ inputWrapper: `bg-transparent focus:bg-white` }}
          className="text-blue-500"
          onChange={(e) => onUpdate({ ...content, href: e.target.value })}
        />
      )}

      {/* Delete element button */}
      <button
        onClick={() => {
          console.log("deleting");
          onDelete();
        }}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 translate-x-1/2 -translate-y-1/2 rounded-full h-5 w-5 bg-red-500"
      >
        <Plus size={15} color="#fff" className="mx-auto rotate-45" />
      </button>
    </div>
  );
}
