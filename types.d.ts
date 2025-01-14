type FlashCardContentJSON =
  | {
      type: "text";
      heading: "title" | "subtitle" | "paragraph"
      text: string;
    }
  | {
      type: "image";
      alt: string;
      imgUri: string;
      width?: number;
      height?: number;
    }
  | {
      type: "equation";
      equation: string;
    };

type FlashCard = {
  question: FlashCardContentJSON[];
  answer: FlashCardContentJSON[];
};
