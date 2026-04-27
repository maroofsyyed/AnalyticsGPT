/**
 * CardsAnalyticsGPT — LangGraph Workflow
 * 
 * 5-agent pipeline with MemorySaver checkpointer for session continuity.
 * Same node order as original: Intent → Tables → ColumnPruner → SQL → Execution
 * 
 * UPGRADED: InitNode now builds the RAG vector index before running agents.
 * The vector store indexes all schema chunks, gold SQL pairs, glossary,
 * and join patterns for semantic search throughout the pipeline.
 */

import { agent as IntentAgent } from "./agents/intent.ts";
import { agent as TablesAgent } from "./agents/tables.ts";
import { agent as ColumnPrunerAgent } from "./agents/columnPruner.ts";
import { agent as SQLAgent } from "./agents/sqlAgent.ts";
import { agent as SQLExecutionAgent } from "./agents/execution.ts";
import { END, START, StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import schemaStore from "./memory/schemaStore.ts";
import queryHistory from "./memory/queryHistory.ts";
import ragRetriever from "./memory/ragRetriever.ts";

/**
 * InitNode — ensures schema, query history, and RAG vector index
 * are all loaded before the first agent runs.
 * All loaders are idempotent so this is a cheap no-op on subsequent invocations.
 */
function initNode(state: typeof MessagesAnnotation.State) {
    // 1. Load raw schema data
    schemaStore.loadSchema();
    
    // 2. Load query history (gold SQL seeds + session history)
    queryHistory.loadHistory();
    
    // 3. Build RAG vector index (indexes schema chunks, gold SQL, glossary, joins)
    ragRetriever.indexAllContent();
    
    // Pass messages through unchanged
    return { messages: state.messages };
}

export function compileGraph(checkpointer?: BaseCheckpointSaver) {
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("InitNode", initNode)
        .addNode("IntentAgent", IntentAgent)
        .addNode("TablesAgent", TablesAgent)
        .addNode("ColumnPrunerAgent", ColumnPrunerAgent)
        .addNode("SQLAgent", SQLAgent)
        .addNode("SQLExecutionAgent", SQLExecutionAgent)
        .addEdge(START, "InitNode")
        .addEdge("InitNode", "IntentAgent")
        .addEdge("IntentAgent", "TablesAgent")
        .addEdge("TablesAgent", "ColumnPrunerAgent")
        .addEdge("ColumnPrunerAgent", "SQLAgent")
        .addEdge("SQLAgent", "SQLExecutionAgent")
        .addEdge("SQLExecutionAgent", END);

    if (checkpointer) {
        return workflow.compile({ checkpointer });
    }
    return workflow.compile();
}
