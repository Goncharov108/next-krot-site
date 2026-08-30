"use client";

import { YM_COUNTER_ID } from "../config";
import { useEffect } from "react";

import YandexMetrikaInitializer from "./YandexMetrikaInitializer";
import { usePathname, useSearchParams } from "next/navigation";
import { getYandexMetrika } from "../lib/getYandexMetrika";

const YandexMetrikaContainer = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const search = searchParams?.toString();

    useEffect(() => {
        const metrika = getYandexMetrika();
        const fullUrl = search ? `${pathname}?${search}` : pathname;

        if (pathname && metrika) {
            metrika(YM_COUNTER_ID, "hit", fullUrl);
        }
    }, [pathname, search]);

    return (
        <YandexMetrikaInitializer
            id={YM_COUNTER_ID}
            initParameters={{
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: "dataLayer",
                accurateTrackBounce: true,
                trackLinks: true,
                defer: true,
            }}
        />
    );
};

export default YandexMetrikaContainer;
