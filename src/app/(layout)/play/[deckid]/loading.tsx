import { Spinner } from '@/components/ui'

export default function Loader() {
    return (
        <div className="grid place-content-center w-full h-full">
            <Spinner />
        </div>
    )
}
