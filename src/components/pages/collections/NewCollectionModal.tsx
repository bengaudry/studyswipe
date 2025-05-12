"use client";
import { MAX_COLLECTION_TITLE_LENGTH } from "@/lib/constants";
import {
  Button,
  ButtonProps,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Collection } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "react-feather";

export type PartialCollection = Omit<
  Collection,
  "id" | "createdAt" | "updatedAt" | "ownerId"
>;

export function NewCollectionModalTrigger({
  color,
  ...props
}: ButtonProps) {
  return (
    <Button
      color={color ?? "primary"}
      size="sm"
      startContent={<Plus />}
      {...props}
    >
      New collection
    </Button>
  );
}

export function NewCollectionModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loadingCreation, setLoadingCreation] = useState(false);
  const { refresh } = useRouter();

  const [data, setData] = useState<PartialCollection>({
    title: "",
  });

  const handleSubmit = async (onClose: () => void) => {
    setLoadingCreation(true);

    try {
      const response = await fetch("/api/collection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to add collection");
      }
    } finally {
      onClose();
      setLoadingCreation(false);
      refresh();
    }
  };

  return (
    <>
      <NewCollectionModalTrigger onPress={onOpen} />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create a new collection
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  labelPlacement="outside"
                  autoFocus
                  required
                  isRequired
                  maxLength={MAX_COLLECTION_TITLE_LENGTH}
                  value={data.title}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Physics, Philosophy, Computer Science..."
                />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isLoading={loadingCreation}
                  onPress={() => handleSubmit(onClose)}
                >
                  Create collection
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
