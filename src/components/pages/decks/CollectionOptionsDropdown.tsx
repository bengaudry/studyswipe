"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { Edit2, MoreVertical, Trash } from "react-feather";

export function CollectionOptionsDropdown({
  collectionId,
  collectionTitle,
}: {
  collectionId: string;
  collectionTitle?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<"rename" | "delete">("delete");
  const [newtitle, setNewtitle] = useState(collectionTitle ?? "");

  const handleDeleteCollection = async () => {
    setLoading(true);
    try {
      await fetch(`/api/collection?id=${collectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleRenameCollection = async () => {
    setLoading(true);
    try {
      await fetch(
        `/api/collection?id=${collectionId}&action=rename&newtitle=${newtitle}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
            Delete collection
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) =>
            modalType === "delete" ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Delete collection
                </ModalHeader>
                <ModalBody>
                  If you delete this collection, all decks in it will be deleted
                  too.
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="danger"
                    isLoading={loading}
                    onPress={handleDeleteCollection}
                  >
                    Delete collection
                  </Button>
                </ModalFooter>
              </>
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Rename collection
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
                    onPress={handleRenameCollection}
                  >
                    Rename collection
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
