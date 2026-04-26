/**
 * Workspaces Tool — Dynamic business domain retrieval from schemaStore
 * Replaces hardcoded Northwind workspace strings.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import schemaStore from "./../memory/schemaStore.ts";

const trigger = tool(async ({ query }) => {
    const workspaces = schemaStore.getWorkspaces();
    const formatted = workspaces.map((w, i) => `${i + 1}. ${w}`).join("\n");
    return `Available business domains for TPC-DS retail analytics:\n${formatted}\n\nEach domain maps to specific fact and dimension tables in samples.tpcds_sf1.`;
}, {
  name: "workspaces",
  description: "Provide a list of all business domain workspaces to choose from. Returns domains like SALES_ANALYSIS, RETURN_ANALYSIS, INVENTORY, etc.",
  schema: z.object({
    query: z.string().describe("The user's natural language question to classify into business domains."),
  }),
});

export { trigger };