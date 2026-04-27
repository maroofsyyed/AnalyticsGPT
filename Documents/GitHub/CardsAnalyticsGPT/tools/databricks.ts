/**
 * Schema Tool (was sqlite.ts) — Column metadata retrieval from RAG schemaStore
 * Replaces SQLite PRAGMA table_info() calls with cached schema lookup.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import schemaStore from "./../memory/schemaStore.ts";

const trigger = tool(async ({ query }) => {
    // query is the table name to get columns for
    const tableName = query.trim().toLowerCase();
    
    const formatted = schemaStore.getColumnsForTableFormatted(tableName);
    
    if (formatted.startsWith("Table '")) {
        // Table not found — try fuzzy match
        const matches = schemaStore.findTablesByTerm(tableName);
        if (matches.length > 0) {
            return `Table '${tableName}' not found. Did you mean: ${matches.join(", ")}?\n\n` +
                   matches.map(m => schemaStore.getColumnsForTableFormatted(m)).join("\n\n");
        }
        return formatted;
    }

    return formatted;
}, {
  name: "columns",
  description: "Get the column definitions for a TPC-DS table including data types, null percentages, and business meanings. Input should be a table name.",
  schema: z.object({
    query: z.string().describe("The table name to get columns for, e.g. 'store_sales' or 'date_dim'"),
  }),
});

export { trigger };