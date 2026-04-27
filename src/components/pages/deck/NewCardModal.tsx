'use client'
import {clsx} from 'clsx'
import {Reorder} from 'motion/react'
import Latex from 'react-latex-next'
import {Plus, Circle, X, Upload} from 'react-feather'
import {DeckDataContext} from './DeckDataProvider'
import {
    Button,
    useDisclosure,
    Input,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    Accordion,
    AccordionItem,
    Textarea,
    Divider,
    Select,
    SelectItem
} from '@/components/ui'
import {Modal, ModalProps} from '@/components/modals'
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'
import {FileUploader} from 'react-drag-drop-files'
import {useAiCardGeneration} from '@/hooks/useAiCardGeneration'
import {useRouter} from 'next/navigation'
import NextImage from 'next/image'
import {useSupabaseImageUpload} from '@/hooks/useSupabaseImageUpload'
import {ToolSelector} from './ToolSelector'
import {useSessionContext} from '@/components/SessionProvider'
import {AVAILABLE_MODELS, AVAILABLE_MODELS_BY_PLAN, isUserAuthorizedToUseModel} from "@/lib/aiModels";
import {useAuth} from "@/hooks/useAuth";

export function NewCardModalTrigger({
                                        onOpen,
                                        onGenerate,
                                        isDisabled
                                    }: {
    onOpen?: () => void
    onGenerate?: () => void
    isDisabled?: boolean
}) {
    return (
        <div className="flex flex-col gap-2 h-full w-full aspect-square">
            <Button
                isDisabled={isDisabled}
                variant="faded"
                className="w-full flex-1 aspect-square border-none"
                startContent={<Plus size={22}/>}
                onPress={onOpen}
            >
                Create a card
            </Button>
            <Button
                isDisabled={isDisabled}
                variant="faded"
                className="w-full flex-1 aspect-square border-none bg-gradient-to-tr from-pink-400 to-indigo-500 dark:from-pink-700 dark:to-indigo-600 text-white"
                startContent={<Circle size={22}/>}
                onPress={onGenerate}
            >
                Generate cards
            </Button>
        </div>
    )
}

export function AiPromptModal({
                                  isAskingGeneration,
                                  onAskGeneration,
                                  ...props
                              }: Omit<ModalProps, 'children' | 'title'> & {
    isAskingGeneration: boolean
    onAskGeneration: (
        prompt: string,
        file: File | null,
        model: string,
        onClose: () => void
    ) => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {push} = useRouter()
    const {user} = useSessionContext()

    const [prompt, setPrompt] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [model, setModel] = useState('gpt-4o')

    const formatSize = (sizeInBytes: number): string => {
        if (sizeInBytes > 1000) {
            const kb = Math.round(sizeInBytes / 100) / 10
            return `${kb}kB`
        }
        return `${sizeInBytes}b`
    }

    const authorizedFileTypes = ['application/pdf', 'image/*', "text/plain", "text/markdown"]

    return (
        <Modal
            {...props}
            title="Generate flashcards"
            submitButtonProps={{
                isDisabled: !file && prompt.length < 3,
                isLoading: isAskingGeneration,
                startContent: <Circle size={16}/>
            }}
            onValidate={(onClose) => {
                if (!file && prompt.length < 3) return
                onAskGeneration(prompt, file, model, onClose)
            }}
            submitButtonLabel="Generate flashcards"
        >
            <Textarea
                label="Topic"
                labelPlacement="outside"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the topic you want to generate cards about here..."
            />
            <Divider/>

            {file ? (
                <div className="bg-neutral-900 border rounded-lg p-3 text-sm flex items-center justify-between">
                    <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-neutral-500 text-xs">
                            {formatSize(file.size)}
                        </p>
                    </div>

                    <button
                        className="text-neutral-500 hover:text-white"
                        onClick={() => setFile(null)}
                    >
                        <X/>
                    </button>
                </div>
            ) : (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                            const uploadedFile = e.target.files?.[0] ?? null
                            if (!uploadedFile) return;

                            if (!authorizedFileTypes.includes(uploadedFile.type)) {
                                alert(`The file type '${uploadedFile.type} is not supported. Try uploading a pdf document, a text file or an image.'`)
                                return
                            }

                            if (uploadedFile.size > 10_000_000) {
                                // file greater than 10MB
                                alert("File is too large for upload. You might want to compress, or select relevant pages if it is a document.")
                                return
                            }
                            setFile(uploadedFile)
                        }}
                    />
                    <Button
                        variant="bordered"
                        startContent={<Upload size={16}/>}
                        onPress={() => {
                            fileInputRef?.current?.click()
                        }}
                    >
                        Ajouter un fichier
                    </Button>
                </>
            )}

            <Select
                label="AI Model"
                size="sm"
                onSelectionChange={(key) => {
                    if (!key.currentKey) return
                    if (!user) return
                    if (!isUserAuthorizedToUseModel(key.currentKey, user)) {
                        push('/subscription?from_feature=ai-gen')
                    } else setModel(key.currentKey)
                }}
                defaultSelectedKeys={AVAILABLE_MODELS[0]}
            >
                {AVAILABLE_MODELS.map((model) => {
                    const type = AVAILABLE_MODELS_BY_PLAN['FREE'].includes(model)
                        ? null
                        : AVAILABLE_MODELS_BY_PLAN['PREMIUM'].includes(model)
                        ? "(premium)"
                        : "(pro)"

                    return (
                        <SelectItem key={model} endContent={type && <span className="text-neutral-500">{type}</span>}>{model}</SelectItem>
                )})}
            </Select>
        </Modal>
    )
}

/** Provide `card` if this if for editing the card */
export function NewCardModal({
                                 deckid,
                                 card,
                                 onAiGenerateCard,
                                 onAiStopGeneration,
                                 onCancel
                             }: {
    deckid: string
    card?: { data: FlashCard }
    onAiGenerateCard: () => void
    onAiStopGeneration: () => void
    onCancel: () => void
}) {
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure()
    const [loading, setLoading] = useState(false)

    const [current, setCurrent] = useState<'question' | 'answer'>('question')
    const [questionContent, setQuestionContent] = useState<
        FlashCardContentJSON[]
    >([])
    const [answerContent, setAnswerContent] = useState<FlashCardContentJSON[]>(
        []
    )
    const {pushImages} = useSupabaseImageUpload()

    // AI GENERATION
    const {generateCards, isAskingGeneration, isGenerating} =
        useAiCardGeneration()

    useEffect(() => {
        if (isGenerating) onAiGenerateCard()
        else onAiStopGeneration()
    }, [isGenerating])

    const {
        isOpen: aiPromptModalIsOpen,
        onOpen: onOpenAiPromptModal,
        onOpenChange: onOpenChangeAiPromptModal
    } = useDisclosure()

    const {data: deckData, updateDeckData} = useContext(DeckDataContext)

    useEffect(() => {
        if (card) {
            setQuestionContent(card.data.question)
            setAnswerContent(card.data.answer)
            onOpen()
        } else {
            setQuestionContent([])
            setAnswerContent([])
        }
    }, [card])

    useEffect(() => {
        if (isOpen) setCurrent('question')
    }, [isOpen])

    const createCard = async (cardBody: FlashCard) => {
        const prevCardState = deckData
        try {
            updateDeckData((prevDeck) => ({
                ...prevDeck,
                cards: [...prevDeck.cards, cardBody]
            }))

            await pushImages()

            await fetch(`/api/card?deckid=${deckid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cardBody)
            })
        } catch (err) {
            console.error('Could not create card :')
            console.error(err)
            if (prevCardState) updateDeckData(prevCardState)
        }
    }

    const editCard = async (newCardData: FlashCard) => {
        if (!card) return // No card in entry, not editing
        const prevDeckState = deckData

        try {
            // Avoid api call and ui refresh if card has not changed
            if (
                JSON.stringify(newCardData.question) ===
                JSON.stringify(card.data.question) &&
                JSON.stringify(newCardData.answer) ===
                JSON.stringify(card.data.answer)
            ) {
                return
            }

            // Update the ui state
            updateDeckData((prevDeck) => ({
                ...prevDeck,
                cards: (prevDeck.cards as FlashCard[]).map((c) => {
                    if (c.id === card.data.id) return newCardData
                    return c
                })
            }))

            await pushImages()

            // Edit the card in database
            await fetch(`/api/card?deckid=${deckid}&cardid=${card.data.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCardData)
            })
        } catch (err) {
            console.error('Could not edit card :')
            console.error(err)
            if (prevDeckState) updateDeckData(prevDeckState)
        }
    }

    const handleCardChanges = async (onClose: () => void) => {
        setLoading(true)
        try {
            const cardBody = {
                question: questionContent,
                answer: answerContent
            } as FlashCard

            // Create a card if we are creating a card
            if (card === undefined) await createCard(cardBody)
            else await editCard(cardBody)
        } finally {
            setLoading(false)
            onClose()
            setAnswerContent([])
            setQuestionContent([])
            setCurrent('question')
        }
    }

    const handleAddElement = (newElement: FlashCardContentJSON) => {
        if (current === 'question')
            setQuestionContent((prev) => [...prev, newElement])
        else setAnswerContent((prev) => [...prev, newElement])
    }

    return (
        <>
            <NewCardModalTrigger
                onOpen={onOpen}
                onGenerate={onOpenAiPromptModal}
            />

            <AiPromptModal
                isOpen={aiPromptModalIsOpen}
                onOpenChange={onOpenChangeAiPromptModal}
                onClose={onClose}
                isAskingGeneration={isAskingGeneration}
                onAskGeneration={(prompt, file, model, onClose) =>
                    generateCards(
                        prompt,
                        file,
                        deckid,
                        // @ts-expect-error
                        model,
                        (generatedCard) => {
                            updateDeckData((prevDeck) => ({
                                ...prevDeck,
                                cards: [...prevDeck.cards, generatedCard]
                            }))
                        },
                        onClose
                    )
                }
            />

            <Drawer
                isOpen={isOpen}
                onClose={onCancel}
                onOpenChange={onOpenChange}
                isKeyboardDismissDisabled
                placement="bottom"
                size="5xl"
                classNames={{
                    backdrop: !isOpen && 'pointer-events-none',
                    body: isOpen ? 'px-2 sm:px-6' : 'pointer-events-none',
                    wrapper: `max-w-screen-sm mx-auto ${
                        !isOpen && 'pointer-events-none'
                    }`
                }}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-1 data-[open=false]:pointer-events-none">
                                Create a new card
                            </DrawerHeader>
                            <DrawerBody>
                                <ToolSelector onAddElement={handleAddElement}/>

                                <Accordion
                                    variant="splitted"
                                    isCompact
                                    defaultExpandedKeys={['question']}
                                >
                                    <AccordionItem
                                        key="question"
                                        title="Question"
                                        onPress={() => setCurrent('question')}
                                    >
                                        <FlashcardPreview
                                            content={questionContent}
                                            updateContent={setQuestionContent}
                                        />
                                    </AccordionItem>

                                    <AccordionItem
                                        key="answer"
                                        title="Answer"
                                        onPress={() => setCurrent('answer')}
                                    >
                                        <FlashcardPreview
                                            content={answerContent}
                                            updateContent={setAnswerContent}
                                        />
                                    </AccordionItem>
                                </Accordion>
                            </DrawerBody>
                            <DrawerFooter>
                                <Button
                                    color="primary"
                                    variant="flat"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    isDisabled={
                                        answerContent.length < 1 ||
                                        questionContent.length < 1
                                    }
                                    color="primary"
                                    isLoading={loading}
                                    onPress={() => handleCardChanges(onClose)}
                                >
                                    {card ? 'Edit card' : 'Create card'}
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    )
}

function FlashcardPreview({
                              content,
                              updateContent
                          }: {
    content: FlashCardContentJSON[]
    updateContent: Dispatch<SetStateAction<FlashCardContentJSON[]>>
}) {
    return (
        <div className={clsx(`w-full h-full mb-3 transition-all`)}>
            {content.length > 0 ? (
                <Reorder.Group values={content} onReorder={updateContent}>
                    <div className="flex flex-col gap-2">
                        {content.map((value, idx) => (
                            <Reorder.Item value={value} key={idx}>
                                <ContentElement
                                    key={idx}
                                    content={value}
                                    onUpdate={(updatedValue) =>
                                        updateContent((prev) =>
                                            prev.map((item, itemIdx) =>
                                                itemIdx === idx
                                                    ? updatedValue
                                                    : item
                                            )
                                        )
                                    }
                                    onDelete={() =>
                                        updateContent((prev) => {
                                            return prev.filter(
                                                (_, i) => i !== idx
                                            )
                                        })
                                    }
                                />
                            </Reorder.Item>
                        ))}
                    </div>
                </Reorder.Group>
            ) : (
                <p className="text-neutral-400 text-center text-sm mt-3">
                    No content yet.
                </p>
            )}
        </div>
    )
}

function ContentElement({
                            content,
                            onUpdate,
                            onDelete
                        }: {
    content: FlashCardContentJSON
    onUpdate: (updatedContent: FlashCardContentJSON) => void
    onDelete: () => void
}) {
    const {user} = useSessionContext()

    const [isFocused, setFocused] = useState(false)
    const [fileUrl, setFileUrl] = useState<string | null>(null)

    const {addFileToQueue} = useSupabaseImageUpload()

    const handleChange = async (file: File | File[]) => {
        if (content.type !== 'image' || !file) return setFileUrl(null)

        // Extract single file from array if needed
        const singleFile = Array.isArray(file) ? file[0] : file
        if (!singleFile) return setFileUrl(null)

        if (!user) return
        const imgUri = `https://oqtjixzwhpbmzpsieuoo.supabase.co/storage/v1/object/public/deck-images/${user.id}/${singleFile.name}`
        try {
            const imgDataUrl = URL.createObjectURL(singleFile)
            setFileUrl(imgDataUrl)

            const {image} = addFileToQueue(singleFile)

            onUpdate({
                ...content,
                imgUri,
                width: image.width,
                height: image.height
            })
        } catch (err) {
            console.error(err)
            if (typeof err === 'object' && err) {
                // If the image alreay exists, do not recreate it, but get the link and metadata
                if ('error' in err && err.error === 'Duplicate') {
                    const image = new Image()
                    image.src = imgUri
                    onUpdate({
                        ...content,
                        imgUri,
                        width: image.width,
                        height: image.height
                    })
                }
                if ('name' in err) alert(err.name)
            }
        }
    }

    const fileTypes = ['jpg', 'png', 'heic', 'heif', 'jpeg', 'image/*']

    return (
        <div
            className={`group relative border-2 border-dashed rounded-lg transition-colors px-4 ${
                isFocused
                    ? 'border-black dark:border-neutral-200 shadow-md'
                    : 'border-neutral-300 hover:border-neutral-500 dark:border-neutral-600'
            }`}
        >
            {content.type === 'text' && (
                <div>
                    <button
                        className="block w-full"
                        onClick={() => setFocused(true)}
                    >
                        <p
                            className={`bg-transparent whitespace-normal px-3 py-1 min-h-4 bg-red-500 block ${
                                content.heading === 'title' &&
                                'text-2xl font-semibold'
                            } ${content.heading === 'subtitle' && 'text-xl font-medium'}`}
                        >
                            {content.text || 'Your text here...'}
                        </p>
                    </button>
                    {isFocused && (
                        <textarea
                            value={content.text || ''}
                            autoFocus
                            className={`absolute z-50 bottom-full mb-2 left-0 right-0 bg-white dark:bg-neutral-800 mt-2 rounded-lg w-full overflow-y-scroll whitespace-normal p-2`}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            onChange={(e) =>
                                onUpdate({...content, text: e.target.value})
                            }
                        />
                    )}
                </div>
            )}

            {content.type === 'quote' && (
                <>
                    <button onClick={() => setFocused(true)}>
                        <p
                            className={`bg-transparent whitespace-normal px-3 py-1 font-["Imperial_Script",sans-serif] font-medium text-4xl`}
                        >
                            {'« '}
                            {content.content || 'Your quote here'}
                            {' »'}
                        </p>
                    </button>
                    {isFocused && (
                        <textarea
                            value={content.content || ''}
                            autoFocus
                            className={`absolute z-50 bottom-full mb-2 left-0 right-0 border-none bg-white dark:bg-neutral-800 mt-2 rounded-lg w-full overflow-y-scroll whitespace-normal p-2`}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            onChange={(e) =>
                                onUpdate({
                                    ...content,
                                    content: e.target.value
                                })
                            }
                        />
                    )}
                </>
            )}

            {content.type === 'equation' && (
                <>
                    <button
                        onClick={() => setFocused(true)}
                        className="w-full py-2 grid place-content-center"
                    >
                        <Latex>
                            $ {content.equation || '$Your equation here$'} $
                        </Latex>
                    </button>
                    {isFocused && (
                        <>
                            {/* <div className="absolute z-50 bottom-full mb-2 h-fit rounded-lg bg-white p-2 w-fit">
                <LatexToolbar
                  onAddElement={(element) =>
                    onUpdate({
                      ...content,
                      equation: content.equation + element,
                    })
                  }
                />
              </div> */}
                            <textarea
                                placeholder="Type your equation in LaTex format here. The text can be placed either with \text{...} or with $...$."
                                autoFocus
                                autoCorrect="false"
                                autoComplete="false"
                                value={content.equation || ''}
                                onBlur={() => setFocused(false)}
                                wrap="hard"
                                rows={2}
                                className={`absolute z-50 bottom-full mb-2 left-0 right-0 border-none bg-white dark:bg-neutral-800 rounded-lg w-full overflow-y-scroll p-2`}
                                onChange={(e) =>
                                    onUpdate({
                                        ...content,
                                        equation: e.target.value
                                    })
                                }
                            />
                        </>
                    )}
                </>
            )}

            {content.type === 'link' && (
                <Input
                    label="URL"
                    placeholder="https://studyswipe.vercel.app/"
                    value={content.href}
                    classNames={{
                        inputWrapper: `bg-transparent focus:bg-white dark:focus:bg-neutral-900`
                    }}
                    className="text-blue-500"
                    onChange={(e) =>
                        onUpdate({...content, href: e.target.value})
                    }
                />
            )}

            {content.type === 'image' && (
                <>
                    {fileUrl ? (
                        <NextImage
                            src={fileUrl}
                            alt={content.alt}
                            className="mx-auto object-cover"
                            width={64}
                            height={64}
                        />
                    ) : (
                        <FileUploader
                            handleChange={handleChange}
                            name="file"
                            multiple={false}
                        />
                    )}
                </>
            )}

            {/* Delete element button */}
            <button
                onClick={() => {
                    console.log('deleting')
                    onDelete()
                }}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 translate-x-1/2 -translate-y-1/2 rounded-full h-5 w-5 bg-red-500"
            >
                <Plus size={15} color="#fff" className="mx-auto rotate-45"/>
            </button>
        </div>
    )
}
