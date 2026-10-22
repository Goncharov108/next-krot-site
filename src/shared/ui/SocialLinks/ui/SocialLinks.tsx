import VkIcon from "@icons/vk-small.svg";
import TgIcon from "@icons/tg-small.svg";

import { cn } from "@/shared/lib/cn";

type SocialLinksProps = {
    variant?: "burger" | "default";
    vkHref?: string;
};

const TELEGRAM_CHANNEL_URL = "https://t.me/krotmedia";

/**
 * Отображает ссылки на официальные соцсети издания КРОТ (Telegram и опционально ВК).
 */
export const SocialLinks = ({
    variant = "default",
    vkHref,
}: SocialLinksProps) => {
    const iconClassName = cn(
        variant === "burger" ? "text-slate-300" : "text-white",
    );

    return (
        <div
            className={cn(
                variant === "burger" ? "flex-center gap-2" : "space-y-3",
            )}
        >
            <p className="text-sm dark:text-white">Крот в соцсетях</p>
            <div className="flex gap-2">
                {vkHref && (
                    <a
                        href={vkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Мы в ВКонтакте"
                    >
                        <VkIcon
                            className={iconClassName}
                            alt="Мы в ВКонтакте"
                        />
                    </a>
                )}
                <a
                    href={TELEGRAM_CHANNEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Мы в Telegram"
                >
                    <TgIcon className={iconClassName} alt="Мы в Telegram" />
                </a>
            </div>
        </div>
    );
};
