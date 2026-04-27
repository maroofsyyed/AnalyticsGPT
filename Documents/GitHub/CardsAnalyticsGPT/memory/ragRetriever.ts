/**
 * RAG Retriever — Enterprise-grade semantic retrieval for CardsAnalyticsGPT
 * 
 * Indexes all RAG content (schema chunks, gold SQL pairs, business glossary,
 * join patterns) into the vector store and provides high-level search APIs
 * for each agent in the pipeline.
 * 
 * This replaces the naive word-overlap matching in queryHistory and schemaStore
 * with proper TF-IDF vector similarity + domain synonym expansion.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import vectorStore from "./vectorStore.ts";
import type { VectorDocument, DocType } from "./vectorStore.ts";
import schemaStore from "./schemaStore.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "..", "data");
const CHUNKS_DIR = join(DATA_DIR, "chunks");

// ── Types ──────────────────────────────────────────────────────────

interface TableSearchResult {
    tableName: string;
    relevanceScore: number;
    snippet: string;
}

interface ExampleSearchResult {
    id: string;
    question: string;
    sql: string;
    category: string;
    tables: string;
    score: number;
}

interface GlossarySearchResult {
    tableName: string;
    columnName: string;
    businessMeaning: string;
    score: number;
}

// ── Indexing ───────────────────────────────────────────────────────

let isInitialized = false;

/**
 * Index all RAG content into the vector store.
 * Call this once on startup. Idempotent — skips if already initialized.
 */
function indexAllContent(): { 
    totalDocs: number; 
    vocabSize: number; 
    byType: Record<string, number>;
    fromCache: boolean;
} {
    if (isInitialized) {
        const stats = vectorStore.getStats();
        return { ...stats, totalDocs: stats.docCount, fromCache: true };
    }

    // Try loading from disk cache first
    const loaded = vectorStore.loadIndex();
    if (loaded) {
        isInitialized = true;
        const stats = vectorStore.getStats();
        return { ...stats, totalDocs: stats.docCount, fromCache: true };
    }

    // Build fresh index
    vectorStore.clear();

    // 1. Index schema chunks (markdown docs per table)
    indexSchemaChunks();

    // 2. Index gold SQL pairs
    indexGoldSQLPairs();

    // 3. Index business glossary
    indexGlossary();

    // 4. Index join patterns
    indexJoinPatterns();

    // 5. Build the TF-IDF index
    const indexStats = vectorStore.buildIndex();

    // 6. Persist to disk
    vectorStore.saveIndex();

    isInitialized = true;

    const stats = vectorStore.getStats();
    return { 
        totalDocs: stats.docCount, 
        vocabSize: indexStats.vocabSize, 
        byType: stats.byType,
        fromCache: false 
    };
}

/** Index all markdown chunks from data/chunks/ */
function indexSchemaChunks(): void {
    if (!existsSync(CHUNKS_DIR)) return;

    const files = readdirSync(CHUNKS_DIR).filter(f => f.endsWith(".md"));
    
    for (const file of files) {
        const filePath = join(CHUNKS_DIR, file);
        const content = readFileSync(filePath, "utf-8");
        const tableName = file.replace(".md", "");

        // Create a searchable document from the chunk
        const doc: VectorDocument = {
            id: `chunk_${tableName}`,
            content: content,
            type: "schema_chunk",
            metadata: {
                tableName,
                fileName: file,
                charCount: content.length
            }
        };

        vectorStore.addDocument(doc);
    }
}

/** Index gold SQL pairs for few-shot retrieval */
function indexGoldSQLPairs(): void {
    const goldPairs = schemaStore.getGoldSQLPairs();

    for (const pair of goldPairs) {
        // Create a rich searchable document combining question + SQL + concepts
        const searchContent = [
            pair.natural_language,
            pair.category.replace(/_/g, " "),
            pair.key_concepts,
            pair.tables_used,
            // Include SQL keywords for structural matching
            extractSQLPatterns(pair.gold_sql)
        ].join(" | ");

        const doc: VectorDocument = {
            id: `gold_${pair.id}`,
            content: searchContent,
            type: "gold_sql",
            metadata: {
                sqlId: pair.id,
                question: pair.natural_language,
                sql: pair.gold_sql,           // FULL SQL — no truncation!
                category: pair.category,
                tablesUsed: pair.tables_used,
                keyConcepts: pair.key_concepts
            }
        };

        vectorStore.addDocument(doc);
    }
}

/** Index business glossary entries */
function indexGlossary(): void {
    // Load from rag_master.json via schemaStore
    const allTables = schemaStore.getAllTableNames();

    for (const tableName of allTables) {
        const cols = schemaStore.getColumnsForTable(tableName);
        
        for (const col of cols) {
            if (!col.comment && col.column_name.endsWith("_sk")) continue; // Skip plain FKs
            
            const meaning = col.comment || col.column_name.replace(/_/g, " ");
            
            const doc: VectorDocument = {
                id: `glossary_${tableName}_${col.column_name}`,
                content: `${tableName} ${col.column_name} ${col.data_type} ${meaning}`,
                type: "glossary",
                metadata: {
                    tableName,
                    columnName: col.column_name,
                    dataType: col.data_type,
                    businessMeaning: meaning
                }
            };

            vectorStore.addDocument(doc);
        }
    }
}

/** Index join relationships as searchable patterns */
function indexJoinPatterns(): void {
    const allTables = schemaStore.getAllTableNames();

    for (const tableName of allTables) {
        const joins = schemaStore.getAllJoinsForTable(tableName);
        
        for (const j of joins) {
            const joinText = `${j.fact_table} joins ${j.dimension_table} on ${j.fact_column} equals ${j.dimension_column} foreign key relationship`;
            
            const doc: VectorDocument = {
                id: `join_${j.fact_table}_${j.dimension_table}_${j.fact_column}`,
                content: joinText,
                type: "join_pattern",
                metadata: {
                    factTable: j.fact_table,
                    factColumn: j.fact_column,
                    dimensionTable: j.dimension_table,
                    dimensionColumn: j.dimension_column,
                    joinSQL: `${j.fact_table}.${j.fact_column} = ${j.dimension_table}.${j.dimension_column}`
                }
            };

            vectorStore.addDocument(doc);
        }
    }
}

// ── Helper: Extract SQL Patterns ──────────────────────────────────

function extractSQLPatterns(sql: string): string {
    const patterns: string[] = [];
    
    if (/GROUP\s+BY/i.test(sql)) patterns.push("group_by aggregation");
    if (/ORDER\s+BY/i.test(sql)) patterns.push("order_by sorting");
    if (/UNION\s+ALL/i.test(sql)) patterns.push("union_all multi_channel");
    if (/LEFT\s+JOIN/i.test(sql)) patterns.push("left_join optional");
    if (/JOIN.*date_dim/i.test(sql)) patterns.push("date_dim time_filter year quarter");
    if (/JOIN.*item/i.test(sql)) patterns.push("item product category brand");
    if (/JOIN.*customer/i.test(sql)) patterns.push("customer buyer");
    if (/JOIN.*store\b/i.test(sql)) patterns.push("store physical_channel");
    if (/LAG|LEAD/i.test(sql)) patterns.push("lag lead window year_over_year growth trend");
    if (/RANK|ROW_NUMBER|DENSE_RANK/i.test(sql)) patterns.push("rank ranking top_n");
    if (/SUM\(/i.test(sql)) patterns.push("sum total aggregate");
    if (/AVG\(/i.test(sql)) patterns.push("avg average mean");
    if (/COUNT\(/i.test(sql)) patterns.push("count transactions");
    if (/HAVING/i.test(sql)) patterns.push("having filter_after_group");
    if (/WITH\b/i.test(sql)) patterns.push("cte with common_table_expression");
    if (/d_year/i.test(sql)) patterns.push("year annual yearly");
    if (/d_qoy|d_quarter/i.test(sql)) patterns.push("quarter quarterly breakdown");
    if (/ss_ext_sales_price|ws_ext_sales_price|cs_ext_sales_price/i.test(sql)) patterns.push("revenue sales_price");
    if (/ss_net_profit|ws_net_profit|cs_net_profit/i.test(sql)) patterns.push("profit margin");
    if (/ss_net_paid|ws_net_paid|cs_net_paid/i.test(sql)) patterns.push("net_paid amount");
    if (/LIMIT/i.test(sql)) patterns.push("top_n limit");
    if (/NULLIF/i.test(sql)) patterns.push("null_safe division");

    return patterns.join(" ");
}

// ── Public Search APIs ────────────────────────────────────────────

/**
 * Search for relevant tables based on a natural language query.
 * Returns table names ranked by semantic relevance.
 */
function searchTables(query: string, topK: number = 8): TableSearchResult[] {
    const results = vectorStore.search(query, topK * 2, "schema_chunk");
    
    // Deduplicate by table name and take top scores
    const seen = new Map<string, TableSearchResult>();
    for (const r of results) {
        const tableName = r.document.metadata.tableName;
        if (!seen.has(tableName) || r.score > seen.get(tableName)!.relevanceScore) {
            seen.set(tableName, {
                tableName,
                relevanceScore: r.score,
                snippet: r.document.content.slice(0, 200)
            });
        }
    }

    return Array.from(seen.values())
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, topK);
}

/**
 * Search for the best few-shot SQL examples for a query.
 * Returns FULL SQL — no truncation.
 */
function searchExamples(query: string, topK: number = 2): ExampleSearchResult[] {
    const results = vectorStore.search(query, topK, "gold_sql");

    return results.map(r => ({
        id: r.document.metadata.sqlId,
        question: r.document.metadata.question,
        sql: r.document.metadata.sql,        // FULL SQL — no truncation!
        category: r.document.metadata.category,
        tables: r.document.metadata.tablesUsed,
        score: r.score
    }));
}

/**
 * Search for relevant glossary entries to map business terms to columns.
 */
function searchGlossary(query: string, topK: number = 10): GlossarySearchResult[] {
    const results = vectorStore.search(query, topK, "glossary");

    return results.map(r => ({
        tableName: r.document.metadata.tableName,
        columnName: r.document.metadata.columnName,
        businessMeaning: r.document.metadata.businessMeaning,
        score: r.score
    }));
}

/**
 * Search for relevant join patterns.
 */
function searchJoins(query: string, tables: string[], topK: number = 10): string[] {
    // First, get joins from vector search
    const results = vectorStore.search(query, topK * 2, "join_pattern");

    // Filter to only include joins involving the specified tables
    const tableSet = new Set(tables.map(t => t.toLowerCase()));
    const joinSQLs: string[] = [];
    const seen = new Set<string>();

    for (const r of results) {
        const factTable = r.document.metadata.factTable?.toLowerCase();
        const dimTable = r.document.metadata.dimensionTable?.toLowerCase();

        if (tableSet.has(factTable) || tableSet.has(dimTable)) {
            const joinSQL = r.document.metadata.joinSQL;
            if (!seen.has(joinSQL)) {
                seen.add(joinSQL);
                joinSQLs.push(joinSQL);
            }
        }
    }

    // Also get structural joins from schemaStore as fallback
    for (let i = 0; i < tables.length; i++) {
        for (let j = i + 1; j < tables.length; j++) {
            const directJoins = schemaStore.getJoinPath(tables[i], tables[j]);
            for (const dj of directJoins) {
                const sql = `${dj.fact_table}.${dj.fact_column} = ${dj.dimension_table}.${dj.dimension_column}`;
                if (!seen.has(sql)) {
                    seen.add(sql);
                    joinSQLs.push(sql);
                }
            }
        }
    }

    return joinSQLs;
}

/**
 * Assemble complete context for the SQL agent.
 * Combines schema, joins, glossary, and few-shot examples.
 */
function getContextForSQLGeneration(query: string, tables: string[]): {
    prunedSchema: string;
    joinPaths: string;
    glossaryHints: string;
    fewShotExamples: string;
} {
    // Get glossary hints for business terms
    const glossary = searchGlossary(query, 8);
    const glossaryHints = glossary.length > 0 
        ? glossary
            .filter(g => tables.some(t => t.toLowerCase() === g.tableName.toLowerCase()))
            .map(g => `${g.tableName}.${g.columnName}: ${g.businessMeaning}`)
            .join("\n")
        : "";

    // Get join paths
    const joins = searchJoins(query, tables);
    const joinPaths = joins.length > 0 
        ? joins.map(j => `JOIN ON ${j}`).join("\n")
        : "No joins found.";

    // Get pruned schema from schemaStore
    const prunedSchema = schemaStore.getSchemaContext(tables);

    // Get few-shot examples (FULL SQL, no truncation)
    const examples = searchExamples(query, 2);
    const fewShotExamples = examples.length > 0
        ? examples.map((ex, i) => 
            `--- Example ${i + 1} (${ex.category}) ---\nQ: ${ex.question}\nSQL:\n${ex.sql}`
          ).join("\n\n")
        : "No similar examples found.";

    return { prunedSchema, joinPaths, glossaryHints, fewShotExamples };
}

/**
 * Get RAG stats for monitoring.
 */
function getStats() {
    return vectorStore.getStats();
}

// ── Export ──────────────────────────────────────────────────────────

const ragRetriever = {
    indexAllContent,
    searchTables,
    searchExamples,
    searchGlossary,
    searchJoins,
    getContextForSQLGeneration,
    getStats
};

export default ragRetriever;
export type { TableSearchResult, ExampleSearchResult, GlossarySearchResult };
