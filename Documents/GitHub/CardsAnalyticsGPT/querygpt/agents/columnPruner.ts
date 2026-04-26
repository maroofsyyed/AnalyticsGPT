/**
 * Column Pruner Agent — Selects only relevant columns from chosen tables
 * 
 * UPGRADED: Uses RAG glossary search to map business terms (revenue, profit)
 * to specific SQL columns. Includes relevant join paths automatically.
 */

import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import schemaStore from "./../memory/schemaStore.ts";
import ragRetriever from "./../memory/ragRetriever.ts";

const model = new ChatOpenAI({
    model: process.env.SARVAM_MODEL || "sarvam-m",
    apiKey: process.env.SARVAM_API_KEY,
    configuration: {
        baseURL: "https://api.sarvam.ai/v1"
    },
    maxTokens: 500,
});

/**
 * Compact column list: "col_name (type)" — no profiles or business meanings.
 */
function getCompactSchema(tableName: string): string {
    const cols = schemaStore.getColumnsForTable(tableName);
    if (cols.length === 0) return "";
    const colList = cols.map(c => `${c.column_name} (${c.data_type})`).join(", ");
    return `${tableName}: ${colList}`;
}

async function agent(state: typeof MessagesAnnotation.State) {
    // Get the user's original question
    const userMsg = state.messages.find(m => m.getType() === "human");
    const userQuestion = typeof userMsg?.content === "string" ? userMsg.content : "";

    // Get the Tables Agent output (last AI message)
    const lastAiMsg = state.messages.filter(m => m.getType() === "ai").pop();
    const tablesOutput = typeof lastAiMsg?.content === "string" ? lastAiMsg.content : "";

    // Parse table names
    const allTables = schemaStore.getAllTableNames();
    const mentionedTables = allTables.filter(t =>
        tablesOutput.toLowerCase().includes(t.toLowerCase())
    );

    // Build compact schema
    const schemaLines = mentionedTables.map(t => getCompactSchema(t)).filter(Boolean);

    // RAG: Get semantic join paths
    const joinPaths = ragRetriever.searchJoins(userQuestion, mentionedTables);
    const joinLines = joinPaths.length > 0 ? joinPaths.join("\n") : "No joins found.";

    // RAG: Get glossary hints to map business terms to columns
    const glossary = ragRetriever.searchGlossary(userQuestion, 12);
    const relevantGlossary = glossary
        .filter(g => mentionedTables.some(t => t.toLowerCase() === g.tableName.toLowerCase()))
        .map(g => `${g.tableName}.${g.columnName}: ${g.businessMeaning}`)
        .slice(0, 8);

    const glossarySection = relevantGlossary.length > 0
        ? `\nBusiness term → Column mappings:\n${relevantGlossary.join("\n")}`
        : "";

    const systemPrompt = `You are pruning columns for a SQL query on samples.tpcds_sf1.

User question: "${userQuestion}"

Available columns per table:
${schemaLines.join("\n")}

Join paths:
${joinLines}
${glossarySection}

Instructions:
- Keep FK columns needed for JOINs (e.g., ss_sold_date_sk for joining date_dim)
- Keep metric columns for the requested aggregation:
  * revenue/sales → ss_ext_sales_price, ws_ext_sales_price, cs_ext_sales_price
  * profit → ss_net_profit, ws_net_profit, cs_net_profit
  * amount paid → ss_net_paid, ws_net_paid, cs_net_paid
- Keep dimension columns for GROUP BY / ORDER BY:
  * year → d_year
  * quarter → d_qoy, d_quarter_name
  * month → d_moy
  * category → i_category
  * brand → i_brand
- Keep filter columns (e.g., d_year for WHERE year=2001)
- REMOVE everything else

Output ONLY the pruned columns in this format:
table1: col1 (type), col2 (type)
table2: col1 (type), col2 (type)`;

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Prune columns for: ${userQuestion}`)
    ]);

    return { messages: [response] };
}

export { agent };