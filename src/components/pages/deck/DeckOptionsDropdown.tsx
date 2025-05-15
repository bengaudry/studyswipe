"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { Deck } from "@prisma/client";
import { validateFlashCardArray } from "@/lib/cardObject";
import { MAX_DECK_TITLE_LENGTH } from "@/lib/constants";
import { DeckDataContext } from "./DeckDataProvider";
import {
  Button,
  Input,
  Textarea,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui";
import { MoreVertical, Edit2, Trash, EyeOff, Eye, Circle } from "react-feather";

const geminiResponseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.ARRAY,
        maxItems: "5",
        minItems: "1",
        items: {
          anyOf: [
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["text"],
                },
                heading: {
                  type: Type.STRING,
                  enum: ["title", "subtitle", "paragraph"],
                },
                text: {
                  type: Type.STRING,
                },
              },
              required: ["type", "heading", "text"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["image"],
                },
                alt: {
                  type: Type.STRING,
                },
                imgUri: {
                  type: Type.STRING,
                },
                width: {
                  type: Type.INTEGER,
                },
                height: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "alt", "imgUri"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["equation"],
                },
                equation: {
                  type: Type.STRING,
                },
              },
              required: ["type", "equation"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["quote"],
                },
                content: {
                  type: Type.STRING,
                },
                author: {
                  type: Type.STRING,
                },
                year: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "content"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["link"],
                },
                href: {
                  type: Type.STRING,
                },
              },
              required: ["type", "href"],
            },
          ],
        },
      },
      answer: {
        type: Type.ARRAY,
        maxItems: "3",
        minItems: "1",
        items: {
          anyOf: [
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["text"],
                },
                heading: {
                  type: Type.STRING,
                  enum: ["title", "subtitle", "paragraph"],
                },
                text: {
                  type: Type.STRING,
                },
              },
              required: ["type", "heading", "text"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["image"],
                },
                alt: {
                  type: Type.STRING,
                },
                imgUri: {
                  type: Type.STRING,
                },
                width: {
                  type: Type.INTEGER,
                },
                height: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "alt", "imgUri"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["equation"],
                },
                equation: {
                  type: Type.STRING,
                },
              },
              required: ["type", "equation"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["quote"],
                },
                content: {
                  type: Type.STRING,
                },
                author: {
                  type: Type.STRING,
                },
                year: {
                  type: Type.INTEGER,
                },
              },
              required: ["type", "content"],
            },
            {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["link"],
                },
                href: {
                  type: Type.STRING,
                },
              },
              required: ["type", "href"],
            },
          ],
        },
      },
    },
    required: ["question", "answer"],
  },
};

export function DeckOptionsDropdown({ deck }: { deck: Deck }) {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<"rename" | "delete" | "generate">(
    "delete"
  );
  const [newtitle, setNewtitle] = useState(deck.title ?? "");
  const [generatedData, setGeneratedData] = useState("");
  const { prefetch, replace, refresh } = useRouter();

  const { data: deckState, updateDeckData } = useContext(DeckDataContext);

  const handleDeleteDeck = async () => {
    setLoading(true);
    try {
      prefetch("/decks");
      await fetch(`/api/deck?id=${deck.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      replace("/decks");
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleRenameDeck = async () => {
    setLoading(true);
    try {
      await fetch(
        `/api/deck?id=${deck.id}&action=rename&newtitle=${newtitle}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      updateDeckData((prev) => ({ ...prev, title: newtitle }));
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    setLoading(true);
    const prevDeckState = deckState;
    try {
      updateDeckData((prev) => ({ ...prev, isPublic: !prev.isPublic }));
      await fetch(`/api/deck?id=${deck.id}&action=toggle-visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      if (prevDeckState) updateDeckData(prevDeckState);
    } finally {
      onClose();
      setLoading(false);
      refresh();
    }
  };

  const handleGenerateCards = async () => {
    try {
      setLoading(true);
      // Avoid calling the ai if the input is not good enough
      if (
        generatedData === undefined ||
        generatedData === null ||
        generatedData === ""
      )
        return;
      if (typeof generatedData !== "string") return;
      if (generatedData.length < 3) return;

      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
      });

      // Stream generated data
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: generatedData,
        config: {
          systemInstruction:
            "Generate a collection of flashcards about the topic that is given to you. The questions and answers must follow the language used in the topic. Keep questions and answers as concise as possible. Try to split all your knowledge into multiple cards, instead of putting everything on one card. Avoid using special characters such as * if it is not needed for comprehension. Make sentences as short as possible, while keeping important information. If the answer is a bit short, try adding a short and concise example.",
          responseMimeType: "application/json",
          responseSchema: geminiResponseSchema,
        },
      });

      // Close modal to display appearing cards
      setLoading(false);
      onClose();

      let buffer = "";
      const generatedCards: FlashCard[] = [];

      for await (const chunk of stream) {
        console.log(chunk);
        const candidates = chunk.candidates;
        const parts = candidates ? candidates[0].content?.parts : undefined;
        const data = parts ? parts[0].text : undefined;

        if (!data) continue;

        buffer += data;


        // Strip initial buffer characters
        const startingIndex = buffer.indexOf("{");
        if (startingIndex === -1) continue;
        buffer = buffer.trim().slice(startingIndex); // Remove the opening characters ('[' + spaces and newlines)

        // Skip verification process if one of the two mandatory
        // fields is missing
        let questionFieldFound = buffer.includes('"question"');
        let answerFieldFound = buffer.includes('"answer"');
        if (!questionFieldFound || !answerFieldFound) continue;

        // Analyze buffer to extract a correct object
        let openingCurlyBracketsCount = 0;
        let closingCurlyBracketsCount = 0;
        let openingSquareBracketsCount = 0;
        let closingSquareBracketsCount = 0;
        let isInString = false;
        let charIdx = -1;
        for (const char of buffer) {
          // Increment counters
          charIdx++;
          if (char === "{" && !isInString) openingCurlyBracketsCount++;
          if (char === "}" && !isInString) closingCurlyBracketsCount++;
          if (char === "[" && !isInString) openingSquareBracketsCount++;
          if (char === "]" && !isInString) closingSquareBracketsCount++;
          if (char === '"') isInString = !isInString;

          // If the object is malformed, continue generating
          if (openingCurlyBracketsCount === 0) continue;
          if (closingCurlyBracketsCount === 0) continue;
          if (openingSquareBracketsCount === 0) continue;
          if (closingSquareBracketsCount === 0) continue;

          // If one object has been found
          if (
            openingCurlyBracketsCount === closingCurlyBracketsCount &&
            openingSquareBracketsCount === closingSquareBracketsCount
          ) {
            // Get the object
            const strObj = buffer.slice(startingIndex, charIdx + 1);

            // Remove the object from the buffer
            buffer = buffer.slice(charIdx + 1);
            try {
              const obj = JSON.parse(strObj);
              generatedCards.push(obj);
              // Reverse array to push new card at first place
              const rev = generatedCards.toReversed();
              updateDeckData((prev) => ({
                ...prev,
                cards: [...rev, ...deck.cards],
              }));
            } catch (e) {
              console.warn(e);
            }
            break;
          }
        }
      }

      // Upload cards onto the server
      await fetch(`/api/fill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckId: deck.id,
          data: generatedCards,
        }),
      });
    } catch (err) {
      console.error("Error in data provided : " + err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <button className="rounded-full outline-none active:bg-neutral-200 transition-colors p-2">
            <MoreVertical />
          </button>
        </DropdownTrigger>
        <DropdownMenu variant="flat" aria-label="Static Actions">
          <DropdownItem
            key="rename"
            startContent={<Edit2 size={16} />}
            onPress={() => {
              setModalType("rename");
              onOpen();
            }}
          >
            Rename
          </DropdownItem>
          <DropdownItem
            key="toggleVisibility"
            startContent={
              deckState?.isPublic ? <EyeOff size={16} /> : <Eye size={16} />
            }
            showDivider
            onPress={handleToggleVisibility}
          >
            {deckState?.isPublic ? "Make private" : "Make public"}
          </DropdownItem>
          <DropdownItem
            key="generateData"
            startContent={<Circle size={16} />}
            showDivider
            onPress={() => {
              setModalType("generate");
              onOpen();
            }}
          >
            Generate cards
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<Trash size={16} />}
            onPress={() => {
              setModalType("delete");
              onOpen();
            }}
          >
            Delete deck
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) =>
            modalType === "delete" ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Delete deck
                </ModalHeader>
                <ModalBody>
                  If you delete this deck, all cards in it will be deleted too,
                  and cannot be recovered
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="danger"
                    isLoading={loading}
                    onPress={handleDeleteDeck}
                  >
                    Delete deck
                  </Button>
                </ModalFooter>
              </>
            ) : modalType === "rename" ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Rename deck
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="New title"
                    labelPlacement="outside"
                    isRequired
                    required
                    value={newtitle}
                    maxLength={MAX_DECK_TITLE_LENGTH}
                    onChange={(e) => setNewtitle(e.target.value)}
                    placeholder="Physics, Philosophy, Computer Science..."
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    isLoading={loading}
                    onPress={handleRenameDeck}
                  >
                    Rename deck
                  </Button>
                </ModalFooter>
              </>
            ) : (
              // modalType === "generate"
              // Generate data modal
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Generate data
                </ModalHeader>
                <ModalBody>
                  <Textarea
                    label="Topic"
                    labelPlacement="outside"
                    isRequired
                    value={generatedData}
                    onChange={(e) => setGeneratedData(e.target.value)}
                    placeholder="Enter the topic you want to generate cards about here..."
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    isLoading={loading}
                    onPress={handleGenerateCards}
                  >
                    Post data
                  </Button>
                </ModalFooter>
              </>
            )
          }
        </ModalContent>
      </Modal>
    </>
  );
}
