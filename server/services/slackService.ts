import { storeInDB } from "./dbService";

const channels = ["lab-notes", "engineering", "offtopic"];

export const getSlackContent = async () => {
    for (const channel of channels) {
        let page = 1;
        let hasMore = true;
        let allMessages = "";

        try {
            while (hasMore) {
                console.log(`Fetching Slack: ${channel} (page ${page})`);
                const res = await fetch(`https://lev-boots-slack-api.jona-581.workers.dev/?channel=${channel}&page=${page}`);
                if (!res.ok) {
                    console.error(`Failed to fetch Slack for ${channel}: ${res.statusText}`);
                    break;
                }

                const data: any = await res.json();
                const messages = data.items.map((m: any) => `[${m.user} (${m.role})]: ${m.text}`).join("\n");
                allMessages += messages + "\n";

                if (data.page * data.limit >= data.total) {
                    hasMore = false;
                } else {
                    page++;
                }
            }
            if (allMessages) {
                await storeInDB("slack", channel, allMessages);
            }
        } catch (error) {
            console.error(`Error fetching Slack for ${channel}:`, error);
        }
    }
};
