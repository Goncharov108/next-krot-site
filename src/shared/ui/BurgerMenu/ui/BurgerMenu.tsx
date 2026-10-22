"use client";

import Link from "next/link";

import { Tag } from "@/entities/tag";
import { SITE_NAVIGATION_LINKS } from "@/shared/lib/site-links";
import CloseIcon from "@icons/close-black.svg";
import { SocialLinks } from "@/shared/ui/SocialLinks";
import { TagMap } from "@/shared/ui/TagMap";
import { Logo } from "../../Logo";
import { MailInfo } from "../../MailInfo/ui/MailInfo";

interface BurgerMenuProps {
    onClose: () => void;
    initialTags?: Tag[];
}

export const BurgerMenu = ({ onClose, initialTags }: BurgerMenuProps) => {
    return (
        <div className="w-full space-y-25 bg-white p-4 dark:bg-gray-900">
            <Logo className="absolute-x-center mt-3" onClick={onClose} />

            <button
                onClick={onClose}
                className="h-10 max-h-5 w-10 max-w-5 rounded-full hover:opacity-70"
            >
                <CloseIcon
                    className="w-full text-black dark:text-white"
                    alt="Закрыть меню"
                />
            </button>

            <nav className="text-black dark:text-white">
                <ul className="flex-center flex-col gap-4">
                    {SITE_NAVIGATION_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                onClick={onClose}
                                className="text-h4 transition hover:opacity-70"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex-center flex-col gap-4">
                <p className="text-bold text-2xl text-black dark:text-white">
                    Наши темы
                </p>
                <TagMap initialTags={initialTags} onClick={onClose} />
                <MailInfo />
            </div>
            <SocialLinks variant="burger" />
        </div>
    );
};
