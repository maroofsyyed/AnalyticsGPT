/**
 * CardsAnalyticsGPT — Interactive CLI Entry Point
 * 
 * UPGRADED: Initializes the enterprise RAG vector store on startup.
 * 
 * Startup sequence:
 * 1. Load .env
 * 2. Load schema from rag_master.json → schemaStore
 * 3. Load query history (gold_sql_pairs + session history) → queryHistory
 * 4. Build RAG vector index → ragRetriever
 * 5. Init session memory → sessionMemory
 * 6. Compile graph with checkpointer
 * 7. Start interactive readline loop
 */

import "dotenv/config";
import { createInterface } from "readline";
import { HumanMessage } from "@langchain/core/messages";
import schemaStore from "./memory/schemaStore.ts";
import queryHistory from "./memory/queryHistory.ts";
import sessionMemory from "./memory/sessionMemory.ts";
import ragRetriever from "./memory/ragRetriever.ts";
import { compileGraph } from "./graph.ts";

// ── Startup ────────────────────────────────────────────────────────

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

// Step 4: Init session
const session = sessionMemory.initSession();
console.log(`✅ Session started: ${session.threadId}`);

// Step 5: Compile graph with checkpointer
const app = compileGraph(session.checkpointer);

console.log("\n" + "═".repeat(60));
console.log("  CardsAnalyticsGPT — Enterprise RAG SQL Generator");
console.log("  Dataset: samples.tpcds_sf1 (Databricks)");
console.log(`  LLM: Sarvam AI (${process.env.SARVAM_MODEL || "sarvam-m"})`);
console.log(`  RAG: ${ragStats.totalDocs} docs | ${ragStats.vocabSize} vocab terms`);
console.log("═".repeat(60));
console.log("\nAsk any question about store, web, or catalog sales.");
console.log("Type 'exit' or 'quit' to stop. Type 'new' to start a fresh session.\n");

// ── Interactive CLI ────────────────────────────────────────────────

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Handle readline close gracefully (e.g. piped input)
let rlClosed = false;
rl.on("close", () => {
    rlClosed = true;
});

async function runQuery(query: string): Promise<void> {
    console.log("\n⏳ Processing through 5-agent pipeline...\n");

    try {
        const result = await app.invoke(
            { messages: [new HumanMessage(query)] },
            { configurable: { thread_id: sessionMemory.getThreadId() } }
        );

        // Get final result
        const messages = result.messages;
        console.log("─".repeat(60));
        const finalMessage = messages[messages.length - 1];
        console.log(finalMessage.content);
        console.log("─".repeat(60));
        console.log("\n📋 Copy the SQL above into your Databricks notebook to verify.");
        console.log(`📊 Session: ${sessionMemory.getThreadId()} | Queries: ${queryHistory.getTotalCount()}\n`);

    } catch (error: any) {
        console.error("\n❌ Error:", error.message || error);
        if (error.message?.includes("401") || error.message?.includes("403")) {
            console.error("   → Check your SARVAM_API_KEY in .env");
        }
        if (error.message?.includes("model")) {
            console.error("   → Check SARVAM_MODEL in .env (default: sarvam-m)");
        }
        console.log("");
    }
}

function askQuestion(promptText: string): Promise<string | null> {
    return new Promise((resolve) => {
        if (rlClosed) {
            resolve(null);
            return;
        }
        rl.question(promptText, (answer) => {
            resolve(answer);
        });
    });
}

async function main(): Promise<void> {
    while (true) {
        const input = await askQuestion("📝 Your question: ");

        // Handle closed stdin (piped mode)
        if (input === null) {
            console.log("\n👋 Goodbye! Session saved.\n");
            break;
        }

        const query = input.trim();

        if (!query) {
            continue; // Empty enter → re-prompt
        }

        if (query.toLowerCase() === "exit" || query.toLowerCase() === "quit") {
            console.log("\n👋 Goodbye! Session saved.\n");
            break;
        }

        if (query.toLowerCase() === "new" || query.toLowerCase() === "reset") {
            const newThreadId = sessionMemory.newThread();
            console.log(`\n🔄 New session started: ${newThreadId}\n`);
            continue;
        }

        if (query.toLowerCase() === "history") {
            console.log(`\n📜 Total queries in history: ${queryHistory.getTotalCount()}\n`);
            continue;
        }

        if (query.toLowerCase() === "rag" || query.toLowerCase() === "stats") {
            const stats = ragRetriever.getStats();
            console.log(`\n📊 RAG Stats:`);
            console.log(`   Documents: ${stats.docCount}`);
            console.log(`   Vocabulary: ${stats.vocabSize}`);
            console.log(`   Indexed: ${stats.indexed}`);
            console.log(`   Types: ${JSON.stringify(stats.byType)}\n`);
            continue;
        }

        // Run the query through the pipeline
        await runQuery(query);

        // Follow-up loop
        while (true) {
            const followUp = await askQuestion("🔄 Follow-up question? (Enter for new query, 'exit' to quit): ");

            if (followUp === null) {
                console.log("\n👋 Goodbye! Session saved.\n");
                rl.close();
                process.exit(0);
            }

            const fu = followUp.trim();

            if (!fu) {
                break; // Empty enter → back to main prompt
            }
            if (fu.toLowerCase() === "exit" || fu.toLowerCase() === "quit") {
                console.log("\n👋 Goodbye! Session saved.\n");
                rl.close();
                process.exit(0);
            }

            // Process follow-up with same thread (session memory preserves context)
            await runQuery(fu);
        }
    }

    rl.close();
    process.exit(0);
}

// Start the CLI
main();
