import { YandexMetrikaMethod } from "../model";

type YandexMetrikaFunction = (
    id: number,
    method: YandexMetrikaMethod,
    ...params: unknown[]
) => void;

export const getYandexMetrika = (): YandexMetrikaFunction | undefined => {
    if (typeof window === "undefined") {
        return;
    }

    const { ym } = window as typeof window & {
        ym?: (id: number, method: string, ...params: unknown[]) => void;
    };

    if (typeof ym !== "function") {
        return;
    }

    return (id: number, method: YandexMetrikaMethod, ...params: unknown[]) =>
        ym(id, method, ...params);
};
