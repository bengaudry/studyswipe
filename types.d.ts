/* +====== IMPORTANT ======+ */
/* UPDATE THE GEMINI RESPONSE
 * SCHEMA WHEN UPDATING THESE
 * TYPES !!!!!               */

type FlashCardContentJSON =
    | {
          type: 'text'
          heading: 'title' | 'subtitle' | 'paragraph'
          text: string
      }
    | {
          type: 'image'
          alt: string
          imgUri: string
          width?: number
          height?: number
      }
    | {
          type: 'equation'
          equation: string
      }
    | {
          type: 'quote'
          content: string
          author?: string
          year?: number
      }
    | {
          type: 'link'
          href: string
      }

type FlashCard = {
    id: string
    aiGenerated?: boolean
    question: FlashCardContentJSON[]
    answer: FlashCardContentJSON[]
}
