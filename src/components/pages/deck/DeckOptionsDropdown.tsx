"use client";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/react";
import {
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
} from "@nextui-org/react";
import { Deck } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import {
  MoreVertical,
  Edit2,
  Trash,
  EyeOff,
  Eye,
  Database,
} from "react-feather";
import { DeckDataContext } from "./DeckDataProvider";
import { validateFlashCardArray } from "@/lib/cardObject";

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
            startContent={<Database size={16} />}
            showDivider
            onPress={() => {
              setModalType("generate");
              onOpen();
            }}
          >
            Import data
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
              // Generate data modal
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Generate data
                </ModalHeader>
                <ModalBody>
                  <Textarea
                    label="Data"
                    labelPlacement="outside"
                    isRequired
                    value={generatedData}
                    onChange={(e) => setGeneratedData(e.target.value)}
                    placeholder="Type your data here..."
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    isLoading={loading}
                    onPress={async () => {
                      try {
                        setLoading(true);
                        const res = validateFlashCardArray(
                          JSON.parse(generatedData)
                        );
                        if (typeof res === "string") throw res;
                        await fetch(`/api/fill`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            deckId: deck.id,
                            data: res,
                          }),
                        });
                        updateDeckData((prev) => ({
                          ...prev,
                          cards: Array.prototype.concat(
                            deck.cards,
                            JSON.parse(generatedData)
                          ),
                        }));
                      } catch (err) {
                        alert("Error in data provided : " + err);
                      } finally {
                        setLoading(false);
                        onClose();
                      }
                    }}
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
