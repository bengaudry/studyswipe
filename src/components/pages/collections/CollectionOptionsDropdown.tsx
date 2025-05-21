"use client";
import { MAX_COLLECTION_TITLE_LENGTH } from "@/lib/constants";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  useDisclosure,
} from "@/components/ui";
import { Collection } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit2, MoreVertical, Trash } from "react-feather";
import { Modal } from "@/components/modals";

export function CollectionOptionsDropdown({
  collection,
}: {
  collection: Collection;
}) {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<"rename" | "delete">("delete");
  const [newtitle, setNewtitle] = useState(collection.title ?? "");
  const { refresh } = useRouter();

  const handleDeleteCollection = async () => {
    setLoading(true);
    try {
      await fetch(`/api/collection?id=${collection.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } finally {
      onClose();
      setLoading(false);
      refresh();
    }
  };

  const handleRenameCollection = async () => {
    setLoading(true);
    try {
      await fetch(
        `/api/collection?id=${collection.id}&action=rename&newtitle=${newtitle}`,
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
            showDivider
            startContent={<Edit2 size={16} />}
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

      {modalType === "delete" && (
        <Modal
          title="Delete collection"
          color="danger"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onValidate={handleDeleteCollection}
          submitButtonLabel="Delete collection"
          submitButtonProps={{
            isLoading: loading,
            startContent: <Trash size={16} />,
          }}
        >
          If you delete this collection, all decks in it, and the cards it
          contains will be deleted too, and cannot be recovered.
        </Modal>
      )}

      {modalType === "rename" && (
        <Modal
          title="Rename collection"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onValidate={handleRenameCollection}
          submitButtonLabel="Rename collection"
          submitButtonProps={{
            isLoading: loading,
            startContent: <Edit2 size={16} />,
          }}
        >
          <Input
            label="New title"
            labelPlacement="outside"
            isRequired
            required
            maxLength={MAX_COLLECTION_TITLE_LENGTH}
            value={newtitle}
            onChange={(e) => setNewtitle(e.target.value)}
            placeholder="Physics, Philosophy, Computer Science..."
          />
        </Modal>
      )}
    </>
  );
}
