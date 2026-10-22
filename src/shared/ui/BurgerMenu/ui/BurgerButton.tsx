"use client";

import { useModal } from "@/shared/lib/modal-node";
import { Tag } from "@/entities/tag";

import BurgerIcon from "@icons/burger-black.svg";

import { BurgerMenu } from "./BurgerMenu";

interface BurgerButtonProps {
    initialTags?: Tag[];
}

export const BurgerButton = ({ initialTags }: BurgerButtonProps) => {
    const { openDialog, closeModal } = useModal();

    const handleOpen = () => {
        openDialog(
            <BurgerMenu onClose={closeModal} initialTags={initialTags} />,
        )();
    };

    return (
        <button onClick={() => handleOpen()} className="block lg:hidden">
            <BurgerIcon
                alt="Открыть меню навигации"
                className="text-black dark:text-white"
            />
        </button>
    );
};
