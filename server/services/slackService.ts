import { storeInDB } from "./dbService";

const SLACK_CHANNELS = ["lab-notes", "engineering", "offtopic"];
const SLACK_API_BASE_URL = "https://lev-boots-slack-api.jona-581.workers.dev";

/**
 * Fetches messages from a Slack channel with pagination.
 */
const fetchChannelMessages = async (channel: string): Promise<string> => {
    let page = 1;
    let hasMore = true;
    let allMessages = "";

    while (hasMore) {
        console.log(`Fetching Slack: ${channel} (page ${page})`);
        const res = await fetch(`${SLACK_API_BASE_URL}/?channel=${channel}&page=${page}`);
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
    return allMessages;
};

/**
 * Ingests content from configured Slack channels into the database.
 */
export const getSlackContent = async () => {
    for (const channel of SLACK_CHANNELS) {
        try {
            const allMessages = await fetchChannelMessages(channel);
            if (allMessages) {
                await storeInDB("slack", channel, allMessages);
            }
        } catch (error) {
            console.error(`Error fetching Slack for ${channel}:`, error);
        }
    }
};
