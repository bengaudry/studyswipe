import { CardsDisplayer } from "@/components/pages/play/CardsDisplayer";

export default function Loader () {
    return <div className="grid place-content-center w-full h-full">
        <CardsDisplayer deckCards={undefined} deckTheme="neutral" />
    </div>
}