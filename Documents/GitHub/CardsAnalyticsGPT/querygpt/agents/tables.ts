/**
 * Tables Agent — Selects relevant TPC-DS tables using RAG semantic search
 * 
 * UPGRADED: Uses ragRetriever.searchTables() for semantic table selection
 * instead of relying on the LLM to pick tables from a static domain map.
 * The LLM still validates and refines the selection.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import ragRetriever from "./../memory/ragRetriever.ts";

const model = new ChatOpenAI({
    model: process.env.SARVAM_MODEL || "sarvam-m",
    apiKey: process.env.SARVAM_API_KEY,
    configuration: {
        baseURL: "https://api.sarvam.ai/v1"
    },
    maxTokens: 200,
});

async function agent(state: typeof MessagesAnnotation.State) {
    const userMsg = state.messages.find(m => m.getType() === "human");
    const userQuestion = typeof userMsg?.content === "string" ? userMsg.content : "";

    // Get intent from previous agent
    const intentMsg = state.messages.filter(m => m.getType() === "ai").pop();
    const intentText = typeof intentMsg?.content === "string" ? intentMsg.content : "";

    // RAG: Semantic table search
    const ragTables = ragRetriever.searchTables(userQuestion, 8);
    const ragTableList = ragTables
        .map(t => `${t.tableName} (score: ${t.relevanceScore.toFixed(2)})`)
        .join("\n");

    // Get glossary hints for the query
    const glossary = ragRetriever.searchGlossary(userQuestion, 6);
    const glossaryHints = glossary
        .map(g => `${g.tableName}.${g.columnName} = ${g.businessMeaning}`)
        .join("\n");

    const systemPrompt = `Select tables needed for this TPC-DS SQL query on samples.tpcds_sf1.

Intent: ${intentText}

RAG-ranked tables (by semantic relevance):
${ragTableList}

Key column mappings:
${glossaryHints}

Rules:
- ALWAYS include date_dim when the query mentions year, quarter, month, date, or time
- Include item for product/category/brand analysis
- For multi-channel: include store_sales, web_sales, catalog_sales
- For returns: include both sales and returns tables
- Prefer tables with highest RAG scores

Return ONLY a comma-separated list of table names.`;

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userQuestion)
    ]);

    return { messages: [response] };
}

export { agent };