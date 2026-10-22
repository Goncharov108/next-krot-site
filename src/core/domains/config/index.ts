import { domainCityProps } from "../model";

const baseUrl =
    process.env.NODE_ENV === "production" ? "krot.media" : "localhost:3000";
const baseProtocol = process.env.NODE_ENV === "production" ? "https" : "http";

export const domainCities: domainCityProps[] = [
    {
        id: 1,
        slug: "novosibirsk",
        name: "Новосибирск",
        prepositionalName: "Новосибирске",
        url: `${baseProtocol}://${baseUrl}`,
    },
    {
        id: 2,
        slug: "berdsk",
        name: "Бердск",
        prepositionalName: "Бердске",
        url: `${baseProtocol}://berdsk.${baseUrl}`,
    },
    // {
    //     id: 3,
    //     slug: "academgorodok",
    //     name: "Академгородок",
    //     prepositionalName: "Академгородке",
    // },
    // {
    //     id: 4,
    //     slug: "nso",
    //     name: "Новосибирская область",
    //     prepositionalName: "Новосибирской области",
    // },
];

export const DEFAULT_CITY = domainCities[0];
