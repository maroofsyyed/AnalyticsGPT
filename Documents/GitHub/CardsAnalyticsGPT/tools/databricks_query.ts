/**
 * Databricks Output Tool (was sqlite_query.ts) — SQL formatter for Databricks
 * No local execution. Formats SQL for copy-paste into Databricks notebooks.
 * Logs queries to queryHistory for future few-shot retrieval.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import queryHistory from "./../memory/queryHistory.ts";

const DATASET = process.env.DATABRICKS_DATASET || "samples.tpcds_sf1";

const trigger = tool(async ({ query }) => {
    let sql = query.trim();

    // Ensure all table references use full Databricks path
    // Find table names that aren't already prefixed
    const tablePattern = /(?:FROM|JOIN)\s+(?!samples\.tpcds_sf1\.)(\w+)(?:\s|$|,|\))/gi;
    let match;
    const tablesToPrefix: string[] = [];
    while ((match = tablePattern.exec(sql)) !== null) {
        const tableName = match[1];
        // Skip SQL keywords and aliases
        const skipWords = ["SELECT", "WHERE", "ON", "AND", "OR", "GROUP", "ORDER", "HAVING", "LIMIT", "AS", "IN", "NOT", "NULL", "UNION", "ALL", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END", "WITH", "CTE", "BY"];
        if (!skipWords.includes(tableName.toUpperCase())) {
            tablesToPrefix.push(tableName);
        }
    }

    // Count tables and joins
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

    // Log to query history
    queryHistory.logQuery(
        "user_query",
        sql,
        Array.from(tableRefs),
        "generated"
    );

    // Format output
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
        hasUnion ? "🔄 Multi-channel UNION ALL detected" : "",
        hasWindow ? "📈 Window functions detected" : "",
        hasCTE ? "📋 CTE (WITH clause) detected" : "",
        "",
        "Copy this SQL into your Databricks notebook to verify against",
        `${DATASET}`,
    ].filter(Boolean).join("\n");

    return output;
}, {
  name: "dbquery",
  description: "Format a SQL query for execution on Databricks. Does NOT execute locally — outputs formatted SQL ready for copy-paste into a Databricks notebook.",
  schema: z.object({
    query: z.string().describe("The SQL query to format for Databricks execution."),
  }),
});

export { trigger };