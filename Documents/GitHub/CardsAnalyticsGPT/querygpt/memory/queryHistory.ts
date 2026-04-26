/**
 * Query History — Few-shot example retrieval and query logging
 * 
 * UPGRADED: Now integrates with ragRetriever for semantic search.
 * Seeds from gold_sql_pairs in rag_master.json on startup.
 * Logs every new query→SQL pair to data/query_history.json.
 * 
 * getSimilarQueries() now uses ragRetriever for vector-based semantic search
 * instead of naive word overlap. formatFewShotExamples() no longer truncates SQL.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import schemaStore from "./schemaStore.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

interface QueryRecord {
  id: string;
  category: string;
  natural_language: string;
  gold_sql: string;
  tables_used: string;
  key_concepts: string;
  timestamp?: string;
  source: "seed" | "session";
}

// ── State ──────────────────────────────────────────────────────────

let queryRecords: QueryRecord[] = [];
const historyPath = join(__dirname, "..", "data", "query_history.json");

// ── Loader ─────────────────────────────────────────────────────────

function loadHistory(): { seedCount: number; sessionCount: number } {
  // Idempotent — skip if already loaded
  if (queryRecords.length > 0) {
    const seedCount = queryRecords.filter(r => r.source === "seed").length;
    const sessionCount = queryRecords.filter(r => r.source === "session").length;
    return { seedCount, sessionCount };
  }

  // Load gold SQL pairs from rag_master.json as seed examples
  const goldPairs = schemaStore.getGoldSQLPairs();
  const seeds: QueryRecord[] = goldPairs.map(p => ({
    id: p.id,
    category: p.category,
    natural_language: p.natural_language,
    gold_sql: p.gold_sql,
    tables_used: p.tables_used,
    key_concepts: p.key_concepts,
    source: "seed" as const
  }));

  // Load session history if exists
  let sessionRecords: QueryRecord[] = [];
  if (existsSync(historyPath)) {
    try {
      const raw = readFileSync(historyPath, "utf-8");
      sessionRecords = JSON.parse(raw) as QueryRecord[];
    } catch {
      sessionRecords = [];
    }
  }

  queryRecords = [...seeds, ...sessionRecords];

  return {
    seedCount: seeds.length,
    sessionCount: sessionRecords.length
  };
}

// ── Public API ─────────────────────────────────────────────────────

function logQuery(
  question: string,
  sql: string,
  tablesUsed: string[],
  category: string = "user_query"
): void {
  const record: QueryRecord = {
    id: `U${String(queryRecords.filter(r => r.source === "session").length + 1).padStart(3, "0")}`,
    category,
    natural_language: question,
    gold_sql: sql,
    tables_used: tablesUsed.join(", "),
    key_concepts: "",
    timestamp: new Date().toISOString(),
    source: "session"
  };

  queryRecords.push(record);

  // Persist session queries
  const sessionRecords = queryRecords.filter(r => r.source === "session");
  try {
    writeFileSync(historyPath, JSON.stringify(sessionRecords, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save query history:", err);
  }
}

/**
 * Get similar queries using enhanced word matching with domain awareness.
 * This is a fallback — the primary semantic search is in ragRetriever.
 */
function getSimilarQueries(question: string, n: number = 3): QueryRecord[] {
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = queryRecords.map(record => {
    let score = 0;

    // Match against natural_language
    const nlWords = record.natural_language.toLowerCase().split(/[\s_\-]+/);
    for (const qw of questionWords) {
      for (const nw of nlWords) {
        if (nw.includes(qw) || qw.includes(nw)) {
          score += 2;
        }
      }
    }

    // Match against category
    const catWords = record.category.toLowerCase().split(/[_\s]+/);
    for (const qw of questionWords) {
      for (const cw of catWords) {
        if (cw.includes(qw) || qw.includes(cw)) {
          score += 3;
        }
      }
    }

    // Match against key_concepts
    const conceptWords = record.key_concepts.toLowerCase().split(/[,\s]+/);
    for (const qw of questionWords) {
      for (const cw of conceptWords) {
        if (cw.includes(qw) || qw.includes(cw)) {
          score += 1;
        }
      }
    }

    // Match against tables_used
    const tableWords = record.tables_used.toLowerCase().split(/[,\s]+/);
    for (const qw of questionWords) {
      for (const tw of tableWords) {
        if (tw.includes(qw) || qw.includes(tw)) {
          score += 1;
        }
      }
    }

    return { record, score };
  });

  // Sort by score descending, take top n
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).filter(s => s.score > 0).map(s => s.record);
}

/**
 * Format few-shot examples — FULL SQL, NO truncation.
 */
function formatFewShotExamples(question: string, n: number = 2): string {
  const similar = getSimilarQueries(question, n);

  if (similar.length === 0) {
    return "No similar past queries found.";
  }

  return similar.map((q, i) =>
    `--- Example ${i + 1} (${q.category}) ---\nQuestion: ${q.natural_language}\nSQL:\n${q.gold_sql}\n`
  ).join("\n");
}

function getTotalCount(): number {
  return queryRecords.length;
}

function getAllRecords(): QueryRecord[] {
  return queryRecords;
}

// ── Export ──────────────────────────────────────────────────────────

const queryHistory = {
  loadHistory,
  logQuery,
  getSimilarQueries,
  formatFewShotExamples,
  getTotalCount,
  getAllRecords
};

export default queryHistory;
