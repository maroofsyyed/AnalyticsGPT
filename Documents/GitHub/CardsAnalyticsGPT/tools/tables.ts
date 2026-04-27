/**
 * Tables Tool — Dynamic table retrieval from schemaStore
 * Replaces hardcoded Northwind table-to-domain mapping.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import schemaStore from "./../memory/schemaStore.ts";

const trigger = tool(async ({ query }) => {
    // The query here is the domain name(s) from the Intent Agent
    const domains = query.split(/[,\n]+/).map(d => d.trim()).filter(Boolean);
    
    const allTables = new Set<string>();
    const result: string[] = [];

    for (const domain of domains) {
        const tables = schemaStore.getTablesForDomain(domain);
        if (tables.length > 0) {
            result.push(`${domain}:`);
            for (const t of tables) {
                allTables.add(t);
                const cols = schemaStore.getColumnsForTable(t);
                result.push(`  - ${t} (${cols.length} columns)`);
            }
        } else {
            // Try fuzzy match on table names
            const matched = schemaStore.findTablesByTerm(domain);
            if (matched.length > 0) {
                result.push(`Matched tables for "${domain}":`);
                for (const t of matched) {
                    allTables.add(t);
                    const cols = schemaStore.getColumnsForTable(t);
                    result.push(`  - ${t} (${cols.length} columns)`);
                }
            }
        }
    }

    // Always include date_dim if any time-related domain is mentioned
    const timeKeywords = ["time", "date", "year", "quarter", "month", "period", "yoy", "trend"];
    const queryLower = query.toLowerCase();
    if (timeKeywords.some(kw => queryLower.includes(kw))) {
        allTables.add("date_dim");
    }

    if (result.length === 0) {
        return `No tables found for domains: ${query}. Available domains: ${schemaStore.getWorkspaces().join(", ")}`;
    }

    return result.join("\n") + `\n\nTotal unique tables: ${allTables.size}\nTable list: ${Array.from(allTables).join(", ")}`;
}, {
  name: "tables",
  description: "Retrieve the list of TPC-DS tables for given business domain(s). Input should be domain name(s) from the Intent Agent.",
  schema: z.object({
    query: z.string().describe("Business domain name(s) to retrieve tables for, e.g. 'SALES_ANALYSIS' or 'SALES_ANALYSIS, CUSTOMER_DEMOGRAPHICS'"),
  }),
});

export { trigger };