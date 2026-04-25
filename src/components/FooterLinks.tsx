'use client'
import { Link } from './ui'

export function FooterLinks() {
    return (
        <>
            <div className="flex flex-col gap-1">
                <Link href="/" className="text-neutral-400">
                    Terms and conditions
                </Link>
                <Link href="/" className="text-neutral-400">
                    Privacy policy
                </Link>
            </div>
            <div className="flex flex-col gap-1">
                <Link
                    target="_blank"
                    href="https://github.com/bengaudry/studyswipe/issues"
                    className="text-neutral-400"
                >
                    Report an issue
                </Link>
                <Link
                    href="mailto:bengaudry@outlook.fr"
                    className="text-neutral-400"
                >
                    Submit a suggestion
                </Link>
                <Link
                    target="_blank"
                    href="https://github.com/bengaudry/studyswipe"
                    className="text-neutral-400"
                >
                    See on GitHub
                </Link>
            </div>
        </>
    )
}
