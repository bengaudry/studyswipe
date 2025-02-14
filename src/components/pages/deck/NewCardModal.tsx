"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
  Image,
  Input,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Accordion,
  AccordionItem,
  ButtonGroup,
} from "@nextui-org/react";
import { clsx } from "clsx";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Plus,
  Image as ImageIcon,
  Type,
  Zap,
  Feather,
  Link2,
} from "react-feather";
import { DeckDataContext } from "./DeckDataProvider";
import Latex from "react-latex-next";
import { LatexToolbar } from "./LatexToolbar";
import { Draggable } from "react-drag-reorder";

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

/** Provide `card` if this if for editing the card */
export function NewCardModal({
  deckid,
  decktheme,
  card,
  onCardChange,
}: {
  deckid: string;
  decktheme: string;
  card?: { data: FlashCard; index: number };
  onCardChange?: (newCard: FlashCard) => void;
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
    if (current === "question") {
      setQuestionContent((prev) => [...prev, newElement]);
    } else {
      setAnswerContent((prev) => [...prev, newElement]);
    }
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
              <DrawerBody>
                <div className="flex justify-between items-center">
                  <Tabs
                    selectedKey={current}
                    // @ts-ignore
                    onSelectionChange={setCurrent}
                  >
                    <Tab title="Question" key="question" />
                    <Tab title="Answer" key="answer" />
                  </Tabs>

                  {/* <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">
                      {
                        (current === "question"
                          ? questionContent
                          : answerContent
                        ).length
                      }
                      /3
                    </span>
                    <AddElementDropdown
                      onAdd={handleAddElement}
                      disabled={
                        (current === "question"
                          ? questionContent
                          : answerContent
                        ).length >= 3
                      }
                    />
                  </div> */}
                </div>

                <div className="flex flex-col gap-y-1">
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      onPress={() =>
                        handleAddElement({
                          type: "text",
                          heading: "title",
                          text: "",
                        })
                      }
                    >
                      <span className="text-xl font-bold">H1</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onPress={() =>
                        handleAddElement({
                          type: "text",
                          heading: "subtitle",
                          text: "",
                        })
                      }
                    >
                      <span className="text-lg font-semibold">H2</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onPress={() =>
                        handleAddElement({
                          type: "text",
                          heading: "paragraph",
                          text: "",
                        })
                      }
                    >
                      <span>Text</span>
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      onPress={() =>
                        handleAddElement({ type: "equation", equation: "" })
                      }
                    >
                      <Latex>$\sqrt{"{x}"}$</Latex>
                    </Button>
                    <Button
                      variant="ghost"
                      onPress={() =>
                        handleAddElement({ type: "quote", content: "" })
                      }
                    >
                      <Feather />
                    </Button>
                    <Button
                      variant="ghost"
                      onPress={() =>
                        handleAddElement({ type: "link", href: "" })
                      }
                    >
                      <Link2 />
                    </Button>
                  </ButtonGroup>
                </div>

                <Accordion defaultExpandedKeys={["question"]}>
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
        <Draggable
          onPosChange={(currentPos, newPos) => {
            updateContent((prevContent) => {
              const newContent = [...prevContent];
              newContent.splice(newPos, 0, newContent.splice(currentPos, 1)[0]);
              return newContent;
            });
          }}
        >
          {content.map((value, idx) => (
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
                updateContent((prev) =>
                  prev.splice(idx, 1)
                )
              }
            />
          ))}
        </Draggable>
      ) : (
        <p className="text-neutral-400 text-center text-sm">No content yet.</p>
      )}
    </div>
  );
}

function AddElementDropdown({
  onAdd,
  disabled,
}: {
  onAdd: (element: FlashCardContentJSON) => void;
  disabled?: boolean;
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color="primary"
          size="sm"
          disabled={disabled}
          isDisabled={disabled}
          startContent={<Plus size={18} />}
        >
          Add element
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="flat" disabledKeys={["image"]}>
        <DropdownItem
          key="title"
          startContent={<Type />}
          onPress={() =>
            onAdd({
              type: "text",
              text: "Click to edit title",
              heading: "title",
            })
          }
        >
          Title
        </DropdownItem>
        <DropdownItem
          key="subtitle"
          startContent={<Type />}
          onPress={() =>
            onAdd({
              type: "text",
              text: "Click to edit subtitle",
              heading: "subtitle",
            })
          }
        >
          Subtitle
        </DropdownItem>
        <DropdownItem
          key="text"
          startContent={<Type />}
          showDivider
          onPress={() =>
            onAdd({
              type: "text",
              text: "Click to edit paragraph",
              heading: "paragraph",
            })
          }
        >
          Text
        </DropdownItem>
        <DropdownItem
          key="equation"
          startContent={<Zap />}
          onPress={() => onAdd({ type: "equation", equation: "" })}
        >
          Equation
        </DropdownItem>
        <DropdownItem
          key="quote"
          startContent={<Feather />}
          onPress={() => onAdd({ type: "quote", content: "" })}
        >
          Quote
        </DropdownItem>
        <DropdownItem
          key="link"
          startContent={<Link2 />}
          onPress={() => onAdd({ type: "link", href: "" })}
        >
          Link (soon)
        </DropdownItem>
        <DropdownItem key="image" startContent={<ImageIcon />}>
          Image (soon)
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
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
            {/* <Image
              src={`https://latex.codecogs.com/svg.image?${content.equation}`}
              width={200}
              height={25}
              className="w-fullrounded-none"
              alt={content.equation || "Equation preview"}
            /> */}
            <Latex>${content.equation || "Your~equation~here"}$</Latex>
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
                placeholder="Type your equation in LaTex format here"
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

      <button
        onClick={() => {
          console.log("deleting")
          onDelete()
        }}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 translate-x-1/2 -translate-y-1/2 rounded-full h-5 w-5 bg-red-500"
      >
        <Plus size={15} color="#fff" className="mx-auto rotate-45" />
      </button>
    </div>
  );
}
