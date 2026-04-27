/**
 * SQL Agent — Generates Databricks SQL from pruned schema context
 * 
 * UPGRADED: Uses RAG semantic search for few-shot retrieval.
 * - NO SQL truncation — full gold SQL examples are injected
 * - Uses ragRetriever.searchExamples() instead of word-overlap queryHistory
 * - Up to 2 few-shot examples for better pattern matching
 * 
 * Fits within sarvam-m 7192 token context window via smart context assembly.
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
    maxTokens: 2048,
});

const RULES = `You are a SQL generator. Output the final Databricks SQL at the end.

CRITICAL: TPC-DS column names INCLUDE the table prefix as part of the name.
- store_sales columns start with ss_: ss_ext_sales_price, ss_net_profit, ss_ext_discount_amt, ss_sold_date_sk
- web_sales columns start with ws_: ws_ext_sales_price, ws_net_profit, ws_ext_discount_amt, ws_sold_date_sk
- catalog_sales columns start with cs_: cs_ext_sales_price, cs_net_profit, cs_ext_discount_amt, cs_sold_date_sk
- date_dim columns start with d_: d_year, d_qoy, d_date_sk
With alias ss for store_sales, write ss.ss_ext_sales_price (NOT ss.ext_sales_price).

Rules:
1. Fully qualify tables: samples.tpcds_sf1.<table>
2. Date filtering: JOIN date_dim ON sold_date_sk = d_date_sk
3. Year/quarter: GROUP BY d.d_year, d.d_qoy ORDER BY d.d_year, d.d_qoy
4. Multi-channel: write ALL three SELECTs with UNION ALL:
   SELECT 'store' AS channel, SUM(ss.ss_ext_sales_price) AS sales FROM samples.tpcds_sf1.store_sales ss
   UNION ALL
   SELECT 'web', SUM(ws.ws_ext_sales_price) FROM samples.tpcds_sf1.web_sales ws
   UNION ALL
   SELECT 'catalog', SUM(cs.cs_ext_sales_price) FROM samples.tpcds_sf1.catalog_sales cs
5. NULLIF only in division denominators
6. ALWAYS write the COMPLETE query. Never abbreviate.`;

async function agent(state: typeof MessagesAnnotation.State) {
    const userMsg = state.messages.find(m => m.getType() === "human");
    const userQuestion = typeof userMsg?.content === "string" ? userMsg.content : "";

    // Get pruned schema from previous agent (ColumnPruner output)
    const prunedMsg = state.messages.filter(m => m.getType() === "ai").pop();
    const prunedSchema = typeof prunedMsg?.content === "string" ? prunedMsg.content : "";

    // RAG: Semantic few-shot retrieval — FULL SQL, NO truncation
    const examples = ragRetriever.searchExamples(userQuestion, 1);
    let fewShot = "";
    if (examples.length > 0) {
        fewShot = "\n\nFew-shot examples:";
        for (const ex of examples) {
            fewShot += `\n\nQ: ${ex.question}\nSQL:\n${ex.sql}`;
        }
    }

    // RAG: Get glossary hints for column mapping
    const glossary = ragRetriever.searchGlossary(userQuestion, 6);
    let glossaryHints = "";
    if (glossary.length > 0) {
        const hints = glossary
            .map(g => `${g.columnName}: ${g.businessMeaning}`)
            .slice(0, 4)
            .join(", ");
        glossaryHints = `\n\nColumn hints: ${hints}`;
    }

    const systemPrompt = `${RULES}

Pruned schema:
${prunedSchema}${glossaryHints}${fewShot}`;

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userQuestion)
    ]);

    return { messages: [response] };
}

export { agent };