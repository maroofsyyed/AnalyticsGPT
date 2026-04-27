/**
 * Intent Agent — Classifies user query into TPC-DS business domains
 * 
 * Custom node function (no tool-calling required).
 * Domains: SALES_ANALYSIS, RETURN_ANALYSIS, INVENTORY, CUSTOMER_DEMOGRAPHICS,
 * PROMOTION_EFFECTIVENESS, CHANNEL_COMPARISON, GEOGRAPHY, TIME_ANALYSIS
 * 
 * OPTIMIZED: Minimal prompt to fit within sarvam-m 7192 token limit.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";

const model = new ChatOpenAI({
    model: process.env.SARVAM_MODEL || "sarvam-m",
    apiKey: process.env.SARVAM_API_KEY,
    configuration: {
        baseURL: "https://api.sarvam.ai/v1"
    },
    maxTokens: 300,
});

async function agent(state: typeof MessagesAnnotation.State) {
    const userMsg = state.messages.find(m => m.getType() === "human");
    const userQuestion = typeof userMsg?.content === "string" ? userMsg.content : "unknown query";

    const systemPrompt = `Classify the user question into TPC-DS retail analytics domains.

Domains:
SALES_ANALYSIS, RETURN_ANALYSIS, INVENTORY, CUSTOMER_DEMOGRAPHICS,
PROMOTION_EFFECTIVENESS, CHANNEL_COMPARISON, GEOGRAPHY, TIME_ANALYSIS

Output exactly:
DOMAINS: <comma-separated>
TIME_PERIOD: <period or none>
CHANNELS: <store/web/catalog/all>
METRICS: <what to measure>
FILTERS: <filters or none>
AGGREGATION: <grouping or none>`;

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userQuestion)
    ]);

    return { messages: [response] };
}

export { agent };