import { YM_COUNTER_ID } from "../config";
import { getYandexMetrika } from "./getYandexMetrika";
import { isAnalyticsEnabled } from "./isAnalyticsEnabled";

export const trackYandexGoal = (goalName: string) => {
    if (!isAnalyticsEnabled()) {
        return;
    }

    const metrika = getYandexMetrika();

    if (!metrika) {
        console.warn("YM is not available");
        return;
    }

    console.log("YM is OK");
    metrika(YM_COUNTER_ID, "reachGoal", goalName);
};
