"use client";
import {
  cn,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import React, { PropsWithChildren, useState } from "react";
import { Plus } from "react-feather";

export function DeckButton({ title }: { title: string; id: string }) {}

export const DeckButtonWrapper = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren & { onPress: () => void }
>(({ children, onPress }, ref) => {
  return (
    <Button
      ref={ref}
      onPress={onPress}
      className="border border-neutral-200 rounded-md p-6 hover:bg-neutral-100 transition-colors"
    >
      {children}
    </Button>
  );
});

const CustomRadio = ({ color }: { color: string }) => (
  <Radio
    value={color}
    size="lg"
    classNames={{
      wrapper: cn(
        `bg-${color}-500/20 group-data-[selected=true]:border-${color}-500`
      ),
      control: cn(`bg-${color}-500`),
    }}
  />
);

export function CreateDeckButton({ collectionId }: { collectionId: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<{
    title: string;
    description: string;
    theme: string;
  }>({
    title: "",
    description: "",
    theme: "neutral",
  });

  const handleSubmit = async (onClose: () => void) => {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/deck",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, collectionId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add collection");
      }
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip content="Create a deck of cards" placement="bottom">
        <Button variant="faded" color="default" className="w-8 h-40" onPress={onOpen}>
          <Plus />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create a new deck
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  required
                  isRequired
                  autoFocus
                  labelPlacement="outside"
                  value={data.title}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Chapter 4, Newton Laws, World War I..."
                />
                <Textarea
                  label="Description"
                  labelPlacement="outside"
                  value={data.description}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <Divider orientation="horizontal" />
                <RadioGroup
                  label="Theme color"
                  orientation="horizontal"
                  classNames={{ wrapper: "ml-2" }}
                  value={data.theme}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, theme: e.target.value }))
                  }
                >
                  <CustomRadio color="neutral" />
                  <CustomRadio color="red" />
                  <CustomRadio color="orange" />
                  <CustomRadio color="yellow" />
                  <CustomRadio color="green" />
                  <CustomRadio color="cyan" />
                  <CustomRadio color="blue" />
                  <CustomRadio color="indigo" />
                  <CustomRadio color="purple" />
                  <CustomRadio color="pink" />
                </RadioGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isLoading={loading}
                  onPress={() => handleSubmit(onClose)}
                >
                  Create deck
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
