"use client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Edit2, Trash } from "react-feather";

export function DeckOptionsDropdown({
  deckId,
  deckTitle,
}: {
  deckId: string;
  deckTitle?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<"rename" | "delete">("delete");
  const [newtitle, setNewtitle] = useState(deckTitle ?? "");
  const { prefetch, replace } = useRouter();

  const handleDeleteDeck = async () => {
    setLoading(true);
    try {
      prefetch("/decks");
      await fetch(`/api/deck?id=${deckId}`, {
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
      await fetch(`/api/deck?id=${deckId}&action=rename&newtitle=${newtitle}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } finally {
      onClose();
      setLoading(false);
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
            key="copy"
            startContent={<Edit2 size={16} />}
            showDivider
            onPress={() => {
              setModalType("rename");
              onOpen();
            }}
          >
            Rename
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
            ) : (
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
            )
          }
        </ModalContent>
      </Modal>
    </>
  );
}
