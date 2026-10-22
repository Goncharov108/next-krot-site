import parse from "html-react-parser";

import "@/shared/lib/react-quill/_quill.css";

interface ParsedHTMLProps {
    html: string;
}

const EDITOR_ATTR_PATTERNS = [
    /\scontenteditable(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    /\sdata-quill-inner-events-stopped(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    /\sdata-quote-blur-sync-bound(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    /\sdata-quote-input-bound(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    /\sdata-quote-avatar-bound(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    /\sdata-placeholder(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
    /\sdata-empty(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
] as const;

/**
 * Удаляет кнопку удаления экспертной цитаты (`.ql-expert-quote__delete`) из HTML-строки.
 */
const removeDeleteButtons = (html: string): string => {
    return html.replace(
        /<button\b[^>]*\bclass=(?:"[^"]*\bql-expert-quote__delete\b[^"]*"|'[^']*\bql-expert-quote__delete\b[^']*')[^>]*>[\s\S]*?<\/button>/gi,
        "",
    );
};

/**
 * Удаляет служебные атрибуты редактора Quill (`contenteditable`, `data-*`) из HTML-строки.
 */
const removeEditableAttributes = (html: string): string => {
    return EDITOR_ATTR_PATTERNS.reduce(
        (acc, pattern) => acc.replace(pattern, ""),
        html,
    );
};

/**
 * Очищает HTML статьи от админской разметки редактора перед публичным рендером.
 */
export const sanitizeArticleHtml = (html: string): string => {
    if (!html) {
        return "";
    }

    return removeEditableAttributes(removeDeleteButtons(html));
};

/**
 * Безопасно рендерит очищенный HTML-контент статьи на публичной странице.
 */
export const ParsedHTML = ({ html }: ParsedHTMLProps) => {
    return (
        <div className="ql-rendered-content">
            {parse(sanitizeArticleHtml(html))}
        </div>
    );
};
