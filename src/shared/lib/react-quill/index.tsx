/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import "react-quill-new/dist/quill.snow.css";

import { cn } from "@/shared/lib/cn";

import "./_quill.css";

const DEFAULT_AVATAR_SRC = "/images/default-avatar.png";
const DEFAULT_EXPERT_NAME = "Крот Михайлович";
const DEFAULT_EXPERT_DESCRIPTION = "Наш виртуальный помощник";
const EXPERT_QUOTE_SYNC_EVENT = "expert-quote-sync";

interface ExpertQuoteValue {
    text: string;
    description: string;
    name: string;
    avatar: string;
}

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

interface QuillRange {
    index: number;
    length: number;
}

interface QuillHandlerContext {
    quill: {
        getSelection: (focus?: boolean) => QuillRange | null;
        insertEmbed: (
            index: number,
            type: string,
            value: unknown,
            source: "user",
        ) => void;
        setSelection: (index: number, length?: number) => void;
    };
}

const uploadEditorImage = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
    });

    const result = (await response.json()) as {
        url?: string;
        message?: string;
    };

    if (!response.ok || !result.url) {
        throw new Error(result.message ?? "Не удалось загрузить изображение");
    }

    return result.url;
};

const selectImageFile = (): Promise<File | null> => {
    return new Promise((resolve) => {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/*";
        input.click();

        input.onchange = () => {
            resolve(input.files?.[0] ?? null);
        };
    });
};

const getEditorHtmlFromContainer = (container: HTMLElement): string => {
    const editorRoot = container.querySelector<HTMLElement>(".ql-editor");

    return editorRoot?.innerHTML ?? "";
};

const dispatchExpertQuoteSync = (node: HTMLElement): void => {
    node.dispatchEvent(
        new CustomEvent(EXPERT_QUOTE_SYNC_EVENT, {
            bubbles: true,
        }),
    );
};

const setEmptyState = (element: HTMLElement): void => {
    const text = element.textContent?.trim() ?? "";

    element.dataset.empty = text ? "false" : "true";
};

const normalizeExpertText = (value: string): string => {
    return value.replace(/\u00A0/g, " ");
};

const normalizeTextNodes = (element: HTMLElement): void => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

    let textNode = walker.nextNode();

    while (textNode) {
        textNode.nodeValue = normalizeExpertText(textNode.nodeValue ?? "");
        textNode = walker.nextNode();
    }
};

const stopQuillInnerEvents = (element: HTMLElement): void => {
    if (element.dataset.quillInnerEventsStopped === "true") {
        return;
    }

    element.dataset.quillInnerEventsStopped = "true";

    [
        "mousedown",
        "mouseup",
        "click",
        "dblclick",
        "keydown",
        "keyup",
        "beforeinput",
        "input",
        "paste",
        "compositionstart",
        "compositionupdate",
        "compositionend",
        "focusin",
        "focusout",
    ].forEach((eventName) => {
        element.addEventListener(eventName, (event) => {
            event.stopPropagation();
        });
    });
};

const syncQuoteOnBlur = (node: HTMLElement, element: HTMLElement): void => {
    if (element.dataset.quoteBlurSyncBound === "true") {
        return;
    }

    element.dataset.quoteBlurSyncBound = "true";

    element.addEventListener("blur", (event) => {
        const nextTarget = event.relatedTarget;

        if (nextTarget instanceof Node && node.contains(nextTarget)) {
            return;
        }

        dispatchExpertQuoteSync(node);
    });
};

const updateQuoteDataFromFields = (node: HTMLElement): void => {
    const bubble = node.querySelector<HTMLElement>(".ql-expert-quote__bubble");

    const description = node.querySelector<HTMLElement>(
        ".ql-expert-quote__description",
    );

    const name = node.querySelector<HTMLElement>(".ql-expert-quote__name");

    node.setAttribute(
        "data-text",
        normalizeExpertText(bubble?.textContent ?? ""),
    );
    node.setAttribute(
        "data-description",
        normalizeExpertText(description?.textContent ?? ""),
    );
    node.setAttribute(
        "data-name",
        normalizeExpertText(name?.textContent ?? ""),
    );

    if (bubble) {
        setEmptyState(bubble);
    }

    if (description) {
        setEmptyState(description);
    }

    if (name) {
        setEmptyState(name);
    }
};

const bindEditableField = (node: HTMLElement, element: HTMLElement): void => {
    element.contentEditable = "true";

    stopQuillInnerEvents(element);
    syncQuoteOnBlur(node, element);
    setEmptyState(element);

    if (element.dataset.quoteInputBound === "true") {
        return;
    }

    element.dataset.quoteInputBound = "true";

    element.addEventListener("input", () => {
        updateQuoteDataFromFields(node);
    });
};

const createDeleteButton = (node: HTMLElement): HTMLButtonElement => {
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "ql-expert-quote__delete";
    deleteButton.title = "Удалить цитату";
    deleteButton.ariaLabel = "Удалить цитату";
    deleteButton.textContent = "×";

    deleteButton.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
    });

    deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const parent = node.parentElement;

        node.remove();

        if (parent) {
            parent.dispatchEvent(
                new CustomEvent(EXPERT_QUOTE_SYNC_EVENT, {
                    bubbles: true,
                }),
            );
        }
    });

    return deleteButton;
};

const bindAvatarButton = (
    node: HTMLElement,
    avatarButton: HTMLButtonElement,
    avatarImage: HTMLImageElement,
): void => {
    avatarButton.type = "button";
    avatarImage.src = node.getAttribute("data-avatar") || DEFAULT_AVATAR_SRC;

    if (avatarButton.dataset.quoteAvatarBound === "true") {
        return;
    }

    avatarButton.dataset.quoteAvatarBound = "true";

    avatarButton.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
    });

    avatarButton.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const file = await selectImageFile();

        if (!file) {
            return;
        }

        try {
            const avatarUrl = await uploadEditorImage(file);

            avatarImage.src = avatarUrl;
            node.setAttribute("data-avatar", avatarUrl);

            dispatchExpertQuoteSync(node);
        } catch (error) {
            console.error(error);
            alert("Не удалось загрузить аватар");
        }
    });
};

const EDITOR_ONLY_QUOTE_ATTRS = [
    "contenteditable",
    "data-placeholder",
    "data-empty",
    "data-quill-inner-events-stopped",
    "data-quote-blur-sync-bound",
    "data-quote-input-bound",
    "data-quote-avatar-bound",
] as const;

/**
 * Удаляет служебные элементы и атрибуты редактора из DOM-узла экспертной цитаты перед сохранением.
 */
const stripEditorArtifactsFromQuote = (quote: HTMLElement): void => {
    quote
        .querySelectorAll(".ql-expert-quote__delete")
        .forEach((button) => button.remove());

    const nodesToClean = [
        quote,
        ...Array.from(quote.querySelectorAll<HTMLElement>("*")),
    ];

    nodesToClean.forEach((element) => {
        EDITOR_ONLY_QUOTE_ATTRS.forEach((attr) => {
            element.removeAttribute(attr);
        });
    });
};

/**
 * Подготавливает HTML статьи к сохранению в БД: синхронизирует поля цитаты и очищает разметку редактора.
 */
const prepareExpertQuotesForSave = (html: string): string => {
    const parsedDocument = new DOMParser().parseFromString(html, "text/html");

    parsedDocument
        .querySelectorAll<HTMLElement>(".ql-expert-quote")
        .forEach((quote) => {
            const bubble = quote.querySelector<HTMLElement>(
                ".ql-expert-quote__bubble",
            );
            const description = quote.querySelector<HTMLElement>(
                ".ql-expert-quote__description",
            );
            const name = quote.querySelector<HTMLElement>(
                ".ql-expert-quote__name",
            );

            [bubble, description, name].forEach((field) => {
                if (field) {
                    normalizeTextNodes(field);
                }
            });

            const textValue = normalizeExpertText(bubble?.textContent ?? "");
            const descriptionText = normalizeExpertText(
                description?.textContent?.trim() ?? "",
            );
            const nameText = normalizeExpertText(
                name?.textContent?.trim() ?? "",
            );

            const finalDescription =
                descriptionText || DEFAULT_EXPERT_DESCRIPTION;
            const finalName = nameText || DEFAULT_EXPERT_NAME;

            quote.setAttribute("data-text", textValue);
            quote.setAttribute("data-description", finalDescription);
            quote.setAttribute("data-name", finalName);

            if (description) {
                description.textContent = finalDescription;
            }

            if (name) {
                name.textContent = finalName;
            }

            stripEditorArtifactsFromQuote(quote);
        });

    return parsedDocument.body.innerHTML;
};

const hydrateExpertQuoteNode = (node: HTMLElement): void => {
    node.contentEditable = "false";

    let deleteButton = node.querySelector<HTMLButtonElement>(
        ".ql-expert-quote__delete",
    );

    if (!deleteButton) {
        deleteButton = createDeleteButton(node);
        node.prepend(deleteButton);
    }

    let bubble = node.querySelector<HTMLElement>(".ql-expert-quote__bubble");

    if (!bubble) {
        bubble = document.createElement("div");
        bubble.className = "ql-expert-quote__bubble";
        bubble.textContent = node.getAttribute("data-text") ?? "";
        node.append(bubble);
    }

    normalizeTextNodes(bubble);
    bubble.dataset.placeholder = "Введите текст цитаты...";
    bindEditableField(node, bubble);

    let author = node.querySelector<HTMLElement>(".ql-expert-quote__author");

    if (!author) {
        author = document.createElement("div");
        author.className = "ql-expert-quote__author";
        node.append(author);
    }

    let avatarButton = author.querySelector<HTMLButtonElement>(
        ".ql-expert-quote__avatar-button",
    );

    if (!avatarButton) {
        avatarButton = document.createElement("button");
        avatarButton.className = "ql-expert-quote__avatar-button";
        author.prepend(avatarButton);
    }

    let avatarImage = avatarButton.querySelector<HTMLImageElement>(
        ".ql-expert-quote__avatar",
    );

    if (!avatarImage) {
        avatarImage = document.createElement("img");
        avatarImage.className = "ql-expert-quote__avatar";
        avatarImage.alt = "Аватар автора";
        avatarButton.append(avatarImage);
    }

    bindAvatarButton(node, avatarButton, avatarImage);

    let meta = author.querySelector<HTMLElement>(".ql-expert-quote__meta");

    if (!meta) {
        meta = document.createElement("div");
        meta.className = "ql-expert-quote__meta";
        author.append(meta);
    }

    let description = meta.querySelector<HTMLElement>(
        ".ql-expert-quote__description",
    );

    if (!description) {
        description = document.createElement("div");
        description.className = "ql-expert-quote__description";
        description.textContent = node.getAttribute("data-description") ?? "";
        meta.append(description);
    }

    normalizeTextNodes(description);
    description.dataset.placeholder = "Описание";
    bindEditableField(node, description);

    let name = meta.querySelector<HTMLElement>(".ql-expert-quote__name");

    if (!name) {
        name = document.createElement("div");
        name.className = "ql-expert-quote__name";
        name.textContent = node.getAttribute("data-name") ?? "";
        meta.append(name);
    }

    normalizeTextNodes(name);
    name.dataset.placeholder = "Имя автора";
    bindEditableField(node, name);

    updateQuoteDataFromFields(node);
};

const hydrateExpertQuotes = (container: HTMLElement): void => {
    container
        .querySelectorAll<HTMLElement>(".ql-expert-quote")
        .forEach((node) => {
            hydrateExpertQuoteNode(node);
        });
};

const ReactQuill = dynamic(
    async () => {
        const quillModule = await import("react-quill-new");
        const { Quill } = quillModule;

        const BlockEmbed = Quill.import("blots/block/embed") as any;

        class ExpertQuoteBlot extends BlockEmbed {
            static blotName = "expertQuote";
            static tagName = "div";
            static className = "ql-expert-quote";

            static create(value?: Partial<ExpertQuoteValue>) {
                const quote: ExpertQuoteValue = {
                    text: value?.text ?? "",
                    description: value?.description ?? "",
                    name: value?.name ?? "",
                    avatar: value?.avatar ?? "",
                };

                const node = super.create() as HTMLElement;

                node.contentEditable = "false";
                node.setAttribute("data-text", quote.text);
                node.setAttribute("data-description", quote.description);
                node.setAttribute("data-name", quote.name);
                node.setAttribute("data-avatar", quote.avatar);

                const deleteButton = createDeleteButton(node);

                const bubble = document.createElement("div");

                bubble.className = "ql-expert-quote__bubble";
                bubble.dataset.placeholder = "Введите текст цитаты...";
                bubble.textContent = quote.text;

                const author = document.createElement("div");

                author.className = "ql-expert-quote__author";

                const avatarButton = document.createElement("button");

                avatarButton.type = "button";
                avatarButton.className = "ql-expert-quote__avatar-button";

                const avatarImage = document.createElement("img");

                avatarImage.className = "ql-expert-quote__avatar";
                avatarImage.alt = "Аватар автора";
                avatarImage.src = quote.avatar || DEFAULT_AVATAR_SRC;

                avatarButton.append(avatarImage);

                const meta = document.createElement("div");

                meta.className = "ql-expert-quote__meta";

                const description = document.createElement("div");

                description.className = "ql-expert-quote__description";
                description.dataset.placeholder = "Описание";
                description.textContent = quote.description;

                const name = document.createElement("div");

                name.className = "ql-expert-quote__name";
                name.dataset.placeholder = "Имя автора";
                name.textContent = quote.name;

                meta.append(description, name);
                author.append(avatarButton, meta);
                node.append(deleteButton, bubble, author);

                hydrateExpertQuoteNode(node);

                return node;
            }

            static value(node: HTMLElement): ExpertQuoteValue {
                const bubble = node.querySelector<HTMLElement>(
                    ".ql-expert-quote__bubble",
                );

                const description = node.querySelector<HTMLElement>(
                    ".ql-expert-quote__description",
                );

                const name = node.querySelector<HTMLElement>(
                    ".ql-expert-quote__name",
                );

                return {
                    text:
                        node.getAttribute("data-text") ??
                        bubble?.textContent ??
                        "",
                    description:
                        node.getAttribute("data-description") ??
                        description?.textContent ??
                        "",
                    name:
                        node.getAttribute("data-name") ??
                        name?.textContent ??
                        "",
                    avatar: node.getAttribute("data-avatar") ?? "",
                };
            }
        }

        const quillWithImports = Quill as typeof Quill & {
            imports: Record<string, unknown>;
        };

        if (!quillWithImports.imports["formats/expertQuote"]) {
            Quill.register(ExpertQuoteBlot);
        }

        return quillModule.default;
    },
    {
        ssr: false,
        loading: () => <div>Загрузка редактора...</div>,
    },
);

const QUILL_FORMATS = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "code",
    "blockquote",
    "link",
    "list",
    "indent",
    "align",
    "color",
    "background",
    "size",
    "script",
    "image",
    "video",
    "code-block",
    "expertQuote",
];

const QuillEditor = ({
    value,
    onChange,
    placeholder = "Введите текст...",
    className,
}: QuillEditorProps) => {
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const skipNextExternalValueSyncRef = useRef(false);

    const [editorValue, setEditorValue] = useState(value || "");

    useEffect(() => {
        if (skipNextExternalValueSyncRef.current) {
            skipNextExternalValueSyncRef.current = false;
            return;
        }

        setEditorValue(value || "");
    }, [value]);

    const emitEditorHtml = useCallback(
        (html: string) => {
            skipNextExternalValueSyncRef.current = true;

            const htmlForSave = prepareExpertQuotesForSave(html);

            onChange(htmlForSave);
        },
        [onChange],
    );

    const syncHtmlFromEditor = useCallback(() => {
        const container = editorContainerRef.current;

        if (!container) {
            return;
        }

        hydrateExpertQuotes(container);

        const editorHtml = getEditorHtmlFromContainer(container);

        setEditorValue(editorHtml);
        emitEditorHtml(editorHtml);
    }, [emitEditorHtml]);

    useEffect(() => {
        const container = editorContainerRef.current;

        if (!container) {
            return;
        }

        const handleExpertQuoteSync = () => {
            syncHtmlFromEditor();
        };

        container.addEventListener(
            EXPERT_QUOTE_SYNC_EVENT,
            handleExpertQuoteSync,
        );

        const observer = new MutationObserver(() => {
            hydrateExpertQuotes(container);
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
        });

        hydrateExpertQuotes(container);

        return () => {
            container.removeEventListener(
                EXPERT_QUOTE_SYNC_EVENT,
                handleExpertQuoteSync,
            );

            observer.disconnect();
        };
    }, [syncHtmlFromEditor]);

    const handleChange = useCallback(
        (content: string) => {
            setEditorValue(content);
            emitEditorHtml(content);
        },
        [emitEditorHtml],
    );

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    [{ size: ["small", false, "large", "huge"] }],

                    ["bold", "italic", "underline", "strike", "code"],
                    [{ color: [] }, { background: [] }],

                    [{ script: "sub" }, { script: "super" }],

                    ["blockquote", "code-block", "expertQuote"],

                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],

                    [{ align: [] }],

                    ["link", "image", "video"],

                    ["clean"],
                ],

                handlers: {
                    image: function (this: QuillHandlerContext) {
                        const input = document.createElement("input");

                        input.type = "file";
                        input.accept = "image/*";
                        input.click();

                        input.onchange = async () => {
                            const file = input.files?.[0];

                            if (!file) {
                                return;
                            }

                            try {
                                const imageUrl = await uploadEditorImage(file);
                                const range = this.quill.getSelection(true);
                                const insertIndex = range?.index ?? 0;

                                this.quill.insertEmbed(
                                    insertIndex,
                                    "image",
                                    imageUrl,
                                    "user",
                                );

                                this.quill.setSelection(insertIndex + 1);
                            } catch (error) {
                                console.error(error);
                                alert("Не удалось загрузить изображение");
                            }
                        };
                    },

                    expertQuote: function (this: QuillHandlerContext) {
                        const range = this.quill.getSelection(true);
                        const insertIndex = range?.index ?? 0;

                        this.quill.insertEmbed(
                            insertIndex,
                            "expertQuote",
                            {
                                text: "",
                                description: "",
                                name: "",
                                avatar: "",
                            },
                            "user",
                        );

                        this.quill.setSelection(insertIndex + 1);
                    },
                },
            },

            clipboard: {
                matchers: [
                    [
                        Node.ELEMENT_NODE,
                        (_node: Node, delta: any) => {
                            delta.ops = delta.ops.map((op: any) => {
                                if (!op.attributes) {
                                    return op;
                                }

                                const attributes = { ...op.attributes };

                                delete attributes.color;
                                delete attributes.background;

                                return {
                                    ...op,
                                    attributes:
                                        Object.keys(attributes).length > 0
                                            ? attributes
                                            : undefined,
                                };
                            });

                            return delta;
                        },
                    ],

                    [
                        "U",
                        (_node: HTMLElement, delta: any) => {
                            delta.ops = delta.ops.map((op: any) => {
                                if (!op.attributes?.link) {
                                    return op;
                                }

                                const attributes = { ...op.attributes };

                                delete attributes.underline;

                                return {
                                    ...op,
                                    attributes:
                                        Object.keys(attributes).length > 0
                                            ? attributes
                                            : undefined,
                                };
                            });

                            return delta;
                        },
                    ],
                ],
            },
        }),
        [],
    );

    return (
        <div
            ref={editorContainerRef}
            className={cn("quill-editor-container", className)}
        >
            <ReactQuill
                value={editorValue}
                onChange={handleChange}
                modules={modules}
                formats={QUILL_FORMATS}
                theme="snow"
                placeholder={placeholder}
            />
        </div>
    );
};

export default memo(QuillEditor);
