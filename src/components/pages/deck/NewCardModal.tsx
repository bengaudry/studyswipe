"use client";
import {
  Button,
  cn,
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
} from "@nextui-org/react";
import { clsx } from "clsx";
import { Dispatch, SetStateAction, useState } from "react";
import { Plus, Type, Image, Zap } from "react-feather";

export function NewCardModal({
  deckid,
  decktheme,
}: {
  deckid: string;
  decktheme: string;
}) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [loading, setLoading] = useState(false);

  const [questionContent, setQuestionContent] = useState<
    FlashCardContentJSON[]
  >([]);
  const [answerContent, setAnswerContent] = useState<FlashCardContentJSON[]>(
    []
  );
  const [current, setCurrent] = useState<"question" | "answer">("question");

  const handleCreateCard = async () => {
    setLoading(true);
    try {
      await fetch(`/api/card?deckid=${deckid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionContent,
          answer: answerContent,
        }),
      });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="faded"
        className="w-full h-full aspect-square"
        startContent={<Plus />}
        onPress={onOpen}
      >
        Create a card
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        classNames={{ body: cn("px-2 sm:px-6") }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
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
                  color="primary"
                  isLoading={loading}
                  onPress={handleCreateCard}
                >
                  Create card
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
        `absolute w-full h-full bg-${decktheme}-500/20 rounded-lg p-6 overflow-y-scroll ${
          isActive ? "scale-100 opacity-100" : "scale-85 opacity-0"
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
      <DropdownMenu variant="flat" disabledKeys={["image", "equation"]}>
        <DropdownItem
          key="title"
          startContent={<Type />}
          onPress={() =>
            onAdd({
              type: "text",
              text: "This is a title",
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
              text: "This is a subtitle",
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
              text: "This is a paragraph",
              heading: "paragraph",
            })
          }
        >
          Text
        </DropdownItem>
        <DropdownItem key="image" startContent={<Image />}>
          Image (soon)
        </DropdownItem>
        <DropdownItem key="equation" startContent={<Zap />}>
          Equation (soon)
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
  if (content.type === "text") {
    return (
      <div className="group relative">
        <textarea
          value={content.text || ""}
          className={`bg-transparent w-full overflow-hidden text-nowrap border-transparent border-dashed border-2 rounded-md p-2 focus:border-black outline-none ${
            content.heading === "title" && "text-2xl font-semibold"
          } ${content.heading === "subtitle" && "text-xl font-medium"}`}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        />
        <button
          onClick={onDelete}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 translate-x-1/2 -translate-y-1/2 rounded-full h-5 w-5 bg-red-500"
        >
          <Plus size={15} color="#fff" className="mx-auto rotate-45" />
        </button>
      </div>
    );
  }
  return null; // Extend here for other content types like images or equations.
}
