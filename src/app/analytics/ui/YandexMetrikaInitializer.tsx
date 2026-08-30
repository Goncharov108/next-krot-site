/* eslint-disable @next/next/no-img-element */
"use client";

import Script from "next/script";
import { YandexMetrikaInitializerProps } from "../model";

const YandexMetrikaInitializer = ({
    id,
    initParameters,
}: YandexMetrikaInitializerProps) => {
    return (
        <>
            <Script type="text/javascript" id={`ym_${id}`}>
                {`(function(m,e,t,r,i,k,a){
                        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                        m[i].l=1*new Date();
                        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');

                    ym(${id}, "init", ${JSON.stringify(initParameters)});
                `}
            </Script>
            <noscript>
                <div>
                    <img
                        src={`https://mc.yandex.ru/watch/${id}`}
                        style={{ position: "absolute", left: "-9999px" }}
                        alt=""
                    />
                </div>
            </noscript>
        </>
    );
};

export default YandexMetrikaInitializer;
