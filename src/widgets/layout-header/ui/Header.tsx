import { Logo } from "@/shared/ui/Logo";
import { SearchButton } from "@/shared/ui/SearchMenu/ui/SearchButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { HeaderNavigation } from "./HeaderNavigation";
import { BurgerButton } from "@/shared/ui/BurgerMenu";
import { Tag } from "@/entities/tag";

interface HeaderProps {
    initialTags?: Tag[];
}

const Header = ({ initialTags }: HeaderProps) => {
    return (
        <header className="flex-between fixed top-0 z-10 w-full bg-gray-200 p-6 lg:p-8 dark:bg-slate-800">
            <BurgerButton initialTags={initialTags} />
            <HeaderNavigation className="hidden gap-8 lg:flex dark:text-white" />
            <Logo className="xs:absolute-center" />
            <div className="flex gap-8">
                <ThemeSwitcher />
                <SearchButton />
            </div>
        </header>
    );
};

export default Header;
