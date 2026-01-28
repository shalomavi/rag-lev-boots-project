import { storeInDB } from "./dbService";

const articleIds = [
    "military-deployment-report",
    "urban-commuting",
    "hover-polo",
    "warehousing",
    "consumer-safety"
];

export const getArticleContent = async () => {
    for (let i = 0; i < articleIds.length; i++) {
        const id = articleIds[i];
        const url = `https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw/article-${i + 1}_${id}.md`;
        console.log(`Fetching article: ${id}`);
        try {
            const res = await fetch(url);
            if (res.ok) {
                const text = await res.text();
                await storeInDB("article", id, text);
            } else {
                console.error(`Failed to fetch article ${id}: ${res.statusText}`);
            }
        } catch (error) {
            console.error(`Error fetching article ${id}:`, error);
        }
    }
};
