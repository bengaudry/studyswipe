import { useTailwindBreakpoint } from '@/hooks/useTailwindBreakpoint'
import { ReactNode } from 'react'
import { Feather, Link2, Image as ImageIcon } from 'react-feather'
import Latex from 'react-latex-next'

export function ToolSelector({
    onAddElement
}: {
    onAddElement: (newElement: FlashCardContentJSON) => void
}) {
    const twBreakpoint = useTailwindBreakpoint()
    const tools: {
        el: FlashCardContentJSON
        representingElement: ReactNode
    }[] = [
        {
            el: {
                type: 'text',
                heading: 'title',
                text: ''
            },
            representingElement: <span className="text-xl font-bold">H1</span>
        },
        {
            el: {
                type: 'text',
                heading: 'subtitle',
                text: ''
            },
            representingElement: (
                <span className="text-lg font-semibold">H2</span>
            )
        },
        {
            el: {
                type: 'text',
                heading: 'paragraph',
                text: ''
            },
            representingElement: <span>Text</span>
        },
        {
            el: { type: 'equation', equation: '' },
            representingElement: <Latex>$\sqrt{'{x}'}$</Latex>
        },
        {
            el: { type: 'quote', content: '' },
            representingElement: <Feather />
        },
        {
            el: { type: 'link', href: '' },
            representingElement: <Link2 />
        },
        {
            el: { type: 'image', alt: '', imgUri: '' },
            representingElement: <ImageIcon />
        }
    ]

    let elPerRow = 6
    switch (twBreakpoint) {
        case 'base':
            elPerRow = 3
            break
        default:
            elPerRow = 6
            break
    }

    return (
        <div className="flex flex-col gap-y-1 mx-2">
            <div className="grid grid-cols-3 sm:grid-cols-6 mx-auto w-full border rounded-lg">
                {tools.map((tool, idx) => {
                    // Get the screen resolution for tailwind (sm, md, ...)
                    const hasRightNeighbour = (idx + 1) % elPerRow !== 0
                    const nbElementsOnBottomLine =
                        tools.length % elPerRow || elPerRow
                    const nbElementsWithoutBottomLine =
                        tools.length - nbElementsOnBottomLine
                    const hasBottomNeighbour = idx < nbElementsWithoutBottomLine
                    const isTopRight = idx + 1 === elPerRow
                    const isBottomRight =
                        idx === tools.length - 1 && !hasRightNeighbour
                    const isTopLeft = idx === 0
                    const isBottomLeft = idx % elPerRow === 0

                    return (
                        <button
                            key={idx}
                            className={`flex items-center justify-center p-2 hover:bg-neutral-100/50 dark:hover:bg-neutral-800 active:scale-95 transition-all
              ${hasRightNeighbour ? 'border-r-1' : 'border-r-0'}
              ${hasBottomNeighbour ? 'border-b-1' : 'border-b-0'}
              ${isTopLeft ? 'rounded-tl-lg' : ''}
              ${isBottomLeft ? 'rounded-bl-lg' : ''}
              ${isTopRight ? 'rounded-tr-lg' : ''}
              ${isBottomRight ? 'rounded-br-lg' : ''}
            `}
                            onClick={() => onAddElement(tool.el)}
                        >
                            {tool.representingElement}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
