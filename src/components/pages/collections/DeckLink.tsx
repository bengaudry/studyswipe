"use client";
import React, { PropsWithChildren, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAX_DECK_DESCRIPTION_LENGTH,
  MAX_DECK_TITLE_LENGTH,
} from "@/lib/constants";
import { Plus } from "react-feather";
import { cn } from "@nextui-org/react";
import {
  Button,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  useDisclosure,
} from "@/components/ui";
import { Modal } from "@/components/modals";

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
        `bg-${color}-500 bg-opacity-20 dark:bg-opacity-50 group-data-[selected=true]:border-${color}-500`
      ),
      control: cn(`bg-${color}-500`),
    }}
  />
);

export function CreateDeckButton({ collectionId }: { collectionId: string }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const { refresh } = useRouter();

  const [data, setData] = useState<{
    title: string;
    description: string;
    theme: string;
    isPublic: boolean;
  }>({
    title: "",
    description: "",
    theme: "neutral",
    isPublic: false,
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/deck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          collectionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add collection");
      }
    } finally {
      onClose();
      setLoading(false);
      refresh();
    }
  };

  return (
    <>
      <Button
        variant="flat"
        color="default"
        className="w-full"
        onPress={onOpen}
        endContent={<Plus />}
      >
        New deck
      </Button>

      <Modal
        title="Create a new deck"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onValidate={handleSubmit}
        submitButtonLabel="Create deck"
        submitButtonProps={{
          isLoading: loading,
          startContent: <Plus size={16} />,
        }}
      >
        <>
          <Input
            label="Name"
            required
            isRequired
            autoFocus
            labelPlacement="outside"
            maxLength={MAX_DECK_TITLE_LENGTH}
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
            maxLength={MAX_DECK_DESCRIPTION_LENGTH}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />

          <RadioGroup
            label="Visibility"
            orientation="horizontal"
            value={data.isPublic ? "public" : "private"}
            onValueChange={(value) =>
              setData((prev) => ({
                ...prev,
                isPublic: value === "public",
              }))
            }
          >
            <Radio description="Private" value="private" />
            <Radio description="Public" value="public" />
          </RadioGroup>

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
        </>
      </Modal>
    </>
  );
}
