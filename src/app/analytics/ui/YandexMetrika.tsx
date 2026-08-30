import { isAnalyticsEnabled } from "../lib/isAnalyticsEnabled";
import YandexMetrikaContainer from "./YandexMetrikaContainer";

const YandexMetrika = () => {
    if (!isAnalyticsEnabled()) return;

    return <YandexMetrikaContainer />;
};

export default YandexMetrika;
