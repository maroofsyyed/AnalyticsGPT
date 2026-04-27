/**
 * SQL Execution Agent — Formats SQL output for Databricks
 * 
 * Custom node function (no tool-calling required).
 * Does NOT execute SQL locally. Validates and formats the generated SQL
 * for copy-paste into a Databricks notebook, with metadata about
 * tables used, join count, and complexity.
 */

import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import queryHistory from "./../memory/queryHistory.ts";

const DATASET = process.env.DATABRICKS_DATASET || "samples.tpcds_sf1";

async function agent(state: typeof MessagesAnnotation.State) {
    // Get the SQL from the previous agent (SQL Agent)
    const lastMsg = state.messages[state.messages.length - 1];
    let sql = typeof lastMsg.content === "string" ? lastMsg.content.trim() : "";

    // Strip <think>...</think> reasoning blocks from sarvam-m output
    sql = sql.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Strip markdown fencing if present
    sql = sql.replace(/^```sql\s*/i, "").replace(/```\s*$/, "").trim();

    // Count tables and joins
    let match;
    const joinCount = (sql.match(/\bJOIN\b/gi) || []).length;
    const tableRefs = new Set<string>();
    const fullPathPattern = /samples\.tpcds_sf1\.(\w+)/g;
    while ((match = fullPathPattern.exec(sql)) !== null) {
        tableRefs.add(match[1]);
    }

    // Determine complexity
    const hasUnion = /UNION\s+ALL/i.test(sql);
    const hasWindow = /\b(LAG|LEAD|RANK|ROW_NUMBER|DENSE_RANK|NTILE)\s*\(/i.test(sql);
    const hasCTE = /\bWITH\b/i.test(sql);

    let complexity = "Low";
    if (hasUnion || hasWindow || hasCTE || joinCount >= 3) complexity = "High";
    else if (joinCount >= 1) complexity = "Medium";

    // Get the original user question for logging
    const userQuestion = state.messages.find(m => m.getType() === "human")?.content as string || "user_query";

    // Log to query history for future few-shot retrieval
    queryHistory.logQuery(
        userQuestion,
        sql,
        Array.from(tableRefs),
        "generated"
    );

    // Build formatted output
    const features: string[] = [];
    if (hasUnion) features.push("🔄 Multi-channel UNION ALL detected");
    if (hasWindow) features.push("📈 Window functions detected");
    if (hasCTE) features.push("📋 CTE (WITH clause) detected");

    const output = [
        "═══════════════════════════════════════════════════════════",
        "  READY TO RUN ON DATABRICKS: samples.tpcds_sf1",
        "═══════════════════════════════════════════════════════════",
        "",
        "```sql",
        sql,
        "```",
        "",
        `📊 Tables used: ${tableRefs.size > 0 ? Array.from(tableRefs).join(", ") : "see query"}`,
        `🔗 Joins: ${joinCount}`,
        `⚡ Estimated complexity: ${complexity}`,
        ...features,
        "",
        `Copy this SQL into your Databricks notebook to verify against ${DATASET}`,
    ].join("\n");

    return { messages: [new AIMessage(output)] };
}

export { agent };