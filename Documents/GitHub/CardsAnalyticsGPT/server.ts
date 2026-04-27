/**
 * CardsAnalyticsGPT — Web UI Server
 * 
 * UPGRADED: Initializes the enterprise RAG vector store on startup.
 * Adds /api/health endpoint with RAG stats and /api/rag/search debug endpoint.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";

import { compileGraph } from "./graph.ts";
import sessionMemory from "./memory/sessionMemory.ts";
import schemaStore from "./memory/schemaStore.ts";
import queryHistory from "./memory/queryHistory.ts";
import ragRetriever from "./memory/ragRetriever.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Initialize RAG System ──────────────────────────────────────────

console.log("\n🔧 Initializing CardsAnalyticsGPT Enterprise RAG...\n");

// Step 1: Load schema
const schemaStats = schemaStore.loadSchema();
console.log(`✅ Schema loaded: ${schemaStats.tables} tables | ${schemaStats.joins} joins | ${schemaStats.glossary} glossary entries`);

// Step 2: Load query history
const historyStats = queryHistory.loadHistory();
console.log(`✅ Query history: ${historyStats.seedCount} seed examples + ${historyStats.sessionCount} session queries`);

// Step 3: Build RAG vector index
const ragStats = ragRetriever.indexAllContent();
console.log(`✅ RAG Vector Store: ${ragStats.totalDocs} documents indexed | ${ragStats.vocabSize} vocabulary terms | cache=${ragStats.fromCache}`);
if (ragStats.byType) {
    const types = Object.entries(ragStats.byType).map(([t, c]) => `${t}: ${c}`).join(", ");
    console.log(`   📊 Document types: ${types}`);
}

// Step 4: Init session + compile graph
const session = sessionMemory.initSession();
const workflowApp = compileGraph(session.checkpointer);

console.log(`✅ Session started: ${session.threadId}`);

// ── API Endpoints ──────────────────────────────────────────────────

// Health check with RAG stats
app.get("/api/health", (_req, res) => {
    const stats = ragRetriever.getStats();
    return res.json({
        status: "ok",
        rag: {
            indexed: stats.indexed,
            totalDocuments: stats.docCount,
            vocabularySize: stats.vocabSize,
            documentTypes: stats.byType
        },
        schema: schemaStats,
        queryHistory: historyStats
    });
});

// Debug: RAG semantic search
app.post("/api/rag/search", (req, res) => {
    const { query, type, topK } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    const tables = ragRetriever.searchTables(query, topK || 5);
    const examples = ragRetriever.searchExamples(query, topK || 3);
    const glossary = ragRetriever.searchGlossary(query, topK || 5);

    return res.json({ query, tables, examples, glossary });
});

// Main query endpoint
app.post("/api/query", async (req, res) => {
    const { query, threadId } = req.body;

    if (!query) {
        return res.status(400).json({ error: "Query is required." });
    }

    const currentThreadId = threadId || `thread_${uuidv4().slice(0, 8)}`;
    console.log(`\n⏳ Processing query for thread: ${currentThreadId}`);
    console.log(`   📝 Query: "${query}"`);

    try {
        const result = await workflowApp.invoke(
            { messages: [new HumanMessage(query)] },
            { configurable: { thread_id: currentThreadId } }
        );

        const messages = result.messages;
        const finalMessage = messages[messages.length - 1];
        const output = typeof finalMessage.content === "string" ? finalMessage.content : JSON.stringify(finalMessage.content);

        console.log(`   ✅ Query completed successfully`);

        return res.json({
            success: true,
            threadId: currentThreadId,
            result: output
        });
    } catch (error: any) {
        console.error("❌ Error running workflow:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "An error occurred during query generation."
        });
    }
});

// ── Start Server ──────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log("\n" + "═".repeat(60));
    console.log(`🚀 CardsAnalyticsGPT Enterprise RAG Server`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   RAG: ${ragStats.totalDocs} documents indexed`);
    console.log(`   LLM: Sarvam AI (${process.env.SARVAM_MODEL || "sarvam-m"})`);
    console.log("═".repeat(60));
});
