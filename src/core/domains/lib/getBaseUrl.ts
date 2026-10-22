import { DEFAULT_CITY } from "../config";
import { getDomainCity } from "./getDomainCity";

/**
 * Возвращает базовый URL сайта с учётом поддомена города.
 */
export const getBaseUrl = async () => {
    const domainCity = await getDomainCity();
    return domainCity === DEFAULT_CITY
        ? "https://krot.media"
        : `https://${domainCity.slug}.krot.media`;
};
