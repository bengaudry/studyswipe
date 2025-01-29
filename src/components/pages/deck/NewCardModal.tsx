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

  return (
    <>
      <NewCardModalTrigger onOpen={onOpen} />
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isKeyboardDismissDisabled
        placement="center"
        classNames={{
          backdrop: !isOpen && "pointer-events-none",
          body: isOpen ? "px-2 sm:px-6" : "pointer-events-none",
          wrapper: !isOpen && "pointer-events-none",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 data-[open=false]:pointer-events-none">
                Create a new card
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-between items-center">
                  <Tabs
                    selectedKey={current}
                    // @ts-ignore
                    onSelectionChange={setCurrent}
                  >
                    <Tab title="Question" key="question" />
                    <Tab title="Answer" key="answer" />
                  </Tabs>

                  <div className="flex items-center gap-2">
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
                      onAdd={(newElement) => {
                        if (current === "question") {
                          setQuestionContent((prev) => [...prev, newElement]);
                        } else {
                          setAnswerContent((prev) => [...prev, newElement]);
                        }
                      }}
                      disabled={
                        (current === "question"
                          ? questionContent
                          : answerContent
                        ).length >= 3
                      }
                    />
                  </div>
                </div>

                <div className="relative w-full max-w-80 aspect-square mx-auto">
                  <FlashcardPreview
                    isActive={current === "question"}
                    content={questionContent}
                    updateContent={setQuestionContent}
                    decktheme={decktheme}
                  />

                  <FlashcardPreview
                    isActive={current === "answer"}
                    content={answerContent}
                    updateContent={setAnswerContent}
                    decktheme={decktheme}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
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
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function FlashcardPreview({
  isActive,
  content,
  updateContent,
  decktheme,
}: {
  isActive: boolean;
  content: FlashCardContentJSON[];
  updateContent: Dispatch<SetStateAction<FlashCardContentJSON[]>>;
  decktheme: string;
}) {
  return (
    <div
      className={clsx(
        `absolute w-full h-full bg-${decktheme}-500/20 rounded-lg p-3 overflow-y-scroll flex flex-col gap-2 ${
          isActive
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-85 opacity-0 pointer-events-none"
        } transition-all`
      )}
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
              prev.filter((_, itemIdx) => itemIdx !== idx)
            )
          }
        />
      ))}
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
          <button onClick={() => setFocused(true)}>
            <p
              className={`bg-transparent whitespace-normal px-3 py-1 ${
                content.heading === "title" && "text-2xl font-semibold"
              } ${content.heading === "subtitle" && "text-xl font-medium"}`}
            >
              {content.text || ""}
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
        onClick={onDelete}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 translate-x-1/2 -translate-y-1/2 rounded-full h-5 w-5 bg-red-500"
      >
        <Plus size={15} color="#fff" className="mx-auto rotate-45" />
      </button>
    </div>
  );
}
