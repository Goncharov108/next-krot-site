// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./globals.css";
import { Metadata } from "next";
import { ReactNode } from "react";

import { Header } from "@/widgets/layout-header";
import { FontMontserrat } from "@/shared/lib/fonts";
import { YandexMetrika } from "@/core/analytics";
import { cn } from "@/shared/lib/cn";
import { TagMap } from "@/shared/ui/TagMap/ui/TagMap";
import { SocialLinks } from "@/shared/ui/SocialLinks";
import { ModalProvider, ModalRenderer } from "@/shared/lib/modal-node";
import { AdminGate, auth } from "@/core/auth";
import { SessionProvider } from "next-auth/react";
import AdminRedactor from "@/widgets/admin-redactor/AdminMenu";
import { MailInfo } from "@/shared/ui/MailInfo/ui/MailInfo";

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: {
            default: `Кроссхаб Российских Онлайн Технологий — КРОТ`,
            template: `%s `,
        },
        description: `Все о информационных технологиях в России | ИИ в настоящем и будущем`,
    };
};

const RootLayout = async ({
    children,
}: Readonly<{
    children: ReactNode;
}>) => {
    const session = await auth();

    return (
        <html lang="ru">
            <body
                className={cn(
                    FontMontserrat.className,
                    "bg-gray-200 antialiased dark:bg-slate-800",
                )}
            >
                <YandexMetrika />
                <SessionProvider session={session}>
                    <ModalProvider>
                        <Header />

                        <div className="mx-auto mt-22 flex w-full max-w-360 justify-between gap-8 px-4 md:mt-28">
                            <aside className="hidden w-58 shrink-0 lg:block">
                                <div className="sticky top-44 space-y-10">
                                    <TagMap />
                                    <SocialLinks />

                                    <MailInfo />
                                </div>
                            </aside>

                            <main className="min-w-0 flex-1 pb-10 lg:max-w-3xl">
                                {children}
                            </main>

                            <aside className="hidden w-58 shrink-0 lg:block" />
                        </div>
                        <ModalRenderer />
                        <AdminGate>
                            <AdminRedactor />
                        </AdminGate>
                    </ModalProvider>
                </SessionProvider>
            </body>
        </html>
    );
};

export default RootLayout;
