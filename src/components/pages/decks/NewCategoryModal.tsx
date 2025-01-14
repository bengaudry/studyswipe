"use client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { Collection } from "@prisma/client";
import { useState } from "react";
import { Plus } from "react-feather";

export type PartialCollection = Omit<
  Collection,
  "id" | "createdAt" | "updatedAt" | "ownerId"
>;

export function NewCategoryModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loadingCreation, setLoadingCreation] = useState(false);

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
    }
  };

  return (
    <>
      <Button
        color="primary"
        size="sm"
        startContent={<Plus />}
        onPress={onOpen}
      >
        New collection
      </Button>
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
