import { useState } from "react";
import Latex from "react-latex-next";

const LatexElementButton = ({
  element,
  onPress,
}: {
  element: string;
  onPress?: () => void;
}) => {
  return (
    <button
      onClick={onPress}
      className="hover:bg-neutral-100 rounded-full aspect-square grid place-content-center cursor-default"
    >
      <Latex>${element}$</Latex>
    </button>
  );
};

export function LatexToolbar({
  onAddElement,
}: {
  onAddElement: (element: string) => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const LatexElements = [
    {
      title: "Arrows",
      items: [
        "\\rightarrow",
        "\\leftarrow",
        "\\leftrightarrow",
        "\\longleftrightarrow",
        "\\mapsto",
        "\\longmapsto",
        "\\Longleftarrow",
        "\\Longrightarrow",
        "\\Longleftrightarrow",
        "\\nLeftrightarrow",
      ],
    },
    {title: "Logic", items: [
      "\\forall",
      "\\exists",
      "\\land",
      "\\lor",
      "\\neg",
      "\\Rightarrow",
      "\\Leftarrow",
      "\\Leftrightarrow",
      "\\nRightarrow",
      "\\nLeftarrow",
      "\\nLeftrightarrow",
      "\\equiv"
    ]},
    {
      title: "Sets",
      items: [
        "\\mathbb{C}",
        "\\mathbb{K}",
        "\\mathbb{N}",
        "\\mathbb{Q}",
        "\\mathbb{R}",
        "\\mathbb{Z}",
        "\\mathbb{+}",
      ]
    },
    {
      title: "Sets Operations",
      items: [
        "\\cup",
        "\\cap",
        "\\subset",
        "\\subseteq",
        "\\subsetneq",
        "\\nsubseteq",
        "\\mathbb{?}",
      ]
    }
  ];

  return (
    <div className="grid grid-cols-7 gap-2">
      {LatexElements.map((el, idx) => (
        <div
          className="relative hover:bg-neutral-100 rounded-sm border-r px-2 aspect-square grid place-content-center cursor-default"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Latex>${el.items[0]}$</Latex>
          <div
            className={`${
              hoveredIndex === idx ? "opacity-100" : "opacity-0"
            } absolute w-max p-2 rounded-lg left-0 bg-white border top-full z-50 grid grid-cols-4 gap-2`}
          >
            {el.items.map((item) => (
              <LatexElementButton
                element={item}
                onPress={() => onAddElement(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
