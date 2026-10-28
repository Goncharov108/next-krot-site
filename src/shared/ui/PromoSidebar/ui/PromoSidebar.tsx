import Link from "next/link";

/**
 * Правый конверсионный сайдбар «КРОТ Медиа»:
 * 1) Виджет подписки на Telegram-канал @krotmedia (с UTM-меткой);
 * 2) Быстрая навигация по ключевым прикладным рубрикам;
 * 3) Блок для B2B-спецпроектов и партнерских интеграций.
 */
export const PromoSidebar = () => {
    return (
        <div className="sticky top-44 space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-xs dark:bg-gray-900">
                <span className="inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
                    КРОТ в Telegram
                </span>
                <h3 className="mt-3 text-base leading-snug font-bold text-slate-900 dark:text-white">
                    Готовые промпты, зарплатные вилки и разборы каждый день
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Короткие карточки и чеклисты для работы, малого бизнеса и
                    семьи без информационного шума
                </p>
                <a
                    href="https://t.me/krotmedia?utm_source=krot.media&utm_medium=sidebar&utm_campaign=tg_widget"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500 dark:bg-white dark:text-slate-900 dark:hover:bg-red-500 dark:hover:text-white"
                >
                    Подписаться на @krotmedia
                </a>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-xs dark:bg-gray-900">
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Спецпроекты и B2B
                </p>
                <h3 className="mt-2 text-sm leading-snug font-bold text-slate-900 dark:text-white">
                    Нативные разборы и кейсы вашей компании на КРОТе
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Расскажем о вашем ИТ-продукте, сервисе для МСБ или
                    инженерной команде на языке цифр и пользы
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <a
                        href="mailto:info@krot.media?subject=Спецпроект%20на%20КРОТ%20Медиа"
                        className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Запросить медиакит →
                    </a>
                    <Link
                        href="/rss.xml"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        RSS
                    </Link>
                </div>
            </div>
        </div>
    );
};
