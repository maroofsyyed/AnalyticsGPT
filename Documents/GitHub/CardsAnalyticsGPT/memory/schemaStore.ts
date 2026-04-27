/**
 * Schema Store — Dynamic RAG-based schema retrieval for TPC-DS
 * 
 * Loads rag_master.json on startup and provides functions to query
 * tables, columns, joins, glossary, and domain mappings.
 * Replaces all hardcoded metadata from the original QueryGPT.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

interface ColumnDef {
  column_name: string;
  comment: string;
  data_type: string;
  table_name: string;
}

interface JoinRelationship {
  fact_table: string;
  fact_column: string;
  dimension_table: string;
  dimension_column: string;
  pk_columns: string;
}

interface GlossaryEntry {
  table_name: string;
  column_name: string;
  business_meaning: string;
}

interface ColumnProfile {
  table_name: string;
  column_name: string;
  data_type: string;
  null_pct: number;
  distinct_count: number;
  sample_values: string;
  table_row_count: number;
}

interface GoldSQLPair {
  id: string;
  category: string;
  natural_language: string;
  gold_sql: string;
  tables_used: string;
  key_concepts: string;
}

interface RagMaster {
  metadata: {
    created: string;
    source_dataset: string;
    tables: number;
    total_columns: number;
    fk_relationships: number;
    gold_sql_pairs: number;
    rag_chunks: number;
  };
  schema: ColumnDef[];
  join_map: JoinRelationship[];
  glossary: GlossaryEntry[];
  column_profiles: ColumnProfile[];
  query_patterns: GoldSQLPair[];
}

// ── Domain Mappings ────────────────────────────────────────────────

const DOMAIN_TABLE_MAP: Record<string, string[]> = {
  SALES_ANALYSIS: [
    "store_sales", "web_sales", "catalog_sales",
    "date_dim", "item", "store", "customer", "promotion"
  ],
  RETURN_ANALYSIS: [
    "store_returns", "web_returns", "catalog_returns",
    "reason", "item", "date_dim", "customer"
  ],
  INVENTORY: [
    "inventory", "item", "warehouse", "date_dim"
  ],
  CUSTOMER_DEMOGRAPHICS: [
    "customer", "customer_demographics", "customer_address",
    "household_demographics", "income_band"
  ],
  PROMOTION_EFFECTIVENESS: [
    "promotion", "store_sales", "web_sales", "catalog_sales",
    "date_dim", "item"
  ],
  CHANNEL_COMPARISON: [
    "store_sales", "web_sales", "catalog_sales",
    "date_dim", "item", "customer"
  ],
  GEOGRAPHY: [
    "customer_address", "store", "warehouse", "web_site",
    "call_center", "customer"
  ],
  TIME_ANALYSIS: [
    "date_dim", "time_dim", "store_sales", "web_sales", "catalog_sales"
  ]
};

// ── State ──────────────────────────────────────────────────────────

let ragData: RagMaster | null = null;
let tableMap: Map<string, ColumnDef[]> = new Map();
let joinIndex: Map<string, JoinRelationship[]> = new Map();
let glossaryIndex: Map<string, GlossaryEntry[]> = new Map();
let profileIndex: Map<string, ColumnProfile[]> = new Map();

// ── Loader ─────────────────────────────────────────────────────────

function loadSchema(): { tables: number; joins: number; glossary: number } {
  // Idempotent — skip if already loaded
  if (ragData) {
    return { tables: tableMap.size, joins: ragData.join_map.length, glossary: ragData.glossary.length };
  }

  const ragPath = join(__dirname, "..", "data", "rag_master.json");
  const raw = readFileSync(ragPath, "utf-8");
  ragData = JSON.parse(raw) as RagMaster;

  // Build table → columns index
  tableMap = new Map();
  for (const col of ragData.schema) {
    const existing = tableMap.get(col.table_name) || [];
    existing.push(col);
    tableMap.set(col.table_name, existing);
  }

  // Build join index (keyed by fact_table)
  joinIndex = new Map();
  for (const j of ragData.join_map) {
    const key = j.fact_table;
    const existing = joinIndex.get(key) || [];
    existing.push(j);
    joinIndex.set(key, existing);
  }

  // Build glossary index (keyed by table_name)
  glossaryIndex = new Map();
  for (const g of ragData.glossary) {
    const existing = glossaryIndex.get(g.table_name) || [];
    existing.push(g);
    glossaryIndex.set(g.table_name, existing);
  }

  // Build profile index (keyed by table_name)
  profileIndex = new Map();
  for (const p of ragData.column_profiles) {
    const existing = profileIndex.get(p.table_name) || [];
    existing.push(p);
    profileIndex.set(p.table_name, existing);
  }

  return {
    tables: tableMap.size,
    joins: ragData.join_map.length,
    glossary: ragData.glossary.length
  };
}

// ── Public API ─────────────────────────────────────────────────────

function getWorkspaces(): string[] {
  return Object.keys(DOMAIN_TABLE_MAP);
}

function getWorkspacesFormatted(): string {
  return Object.entries(DOMAIN_TABLE_MAP)
    .map(([domain, tables]) => `${domain}: ${tables.join(", ")}`)
    .join("\n");
}

function getTablesForDomain(domain: string): string[] {
  const key = domain.toUpperCase().replace(/\s+/g, "_");
  return DOMAIN_TABLE_MAP[key] || [];
}

function getTablesForDomainFormatted(domain: string): string {
  const tables = getTablesForDomain(domain);
  if (tables.length === 0) return `No tables found for domain: ${domain}`;

  return tables.map(t => {
    const cols = tableMap.get(t) || [];
    const colNames = cols.map(c => c.column_name).join(", ");
    return `${t} (${cols.length} columns): ${colNames}`;
  }).join("\n");
}

function getAllTableNames(): string[] {
  return Array.from(tableMap.keys());
}

function getColumnsForTable(tableName: string): ColumnDef[] {
  return tableMap.get(tableName) || [];
}

function getColumnsForTableFormatted(tableName: string): string {
  const cols = tableMap.get(tableName);
  if (!cols || cols.length === 0) return `Table '${tableName}' not found in schema.`;

  const glossaryEntries = glossaryIndex.get(tableName) || [];
  const profiles = profileIndex.get(tableName) || [];
  const glossaryMap = new Map(glossaryEntries.map(g => [g.column_name, g.business_meaning]));
  const profileMap = new Map(profiles.map(p => [p.column_name, p]));

  const lines = cols.map(c => {
    const meaning = glossaryMap.get(c.column_name) || "";
    const profile = profileMap.get(c.column_name);
    const nullInfo = profile ? ` (null: ${profile.null_pct}%)` : "";
    const meaningStr = meaning ? ` — ${meaning}` : "";
    return `  ${c.column_name} ${c.data_type}${nullInfo}${meaningStr}`;
  });

  return `Table: ${tableName}\n${lines.join("\n")}`;
}

function getJoinPath(tableA: string, tableB: string): JoinRelationship[] {
  // Direct joins where tableA is fact and tableB is dimension
  const directAB = (joinIndex.get(tableA) || [])
    .filter(j => j.dimension_table === tableB);
  if (directAB.length > 0) return directAB;

  // Reverse: tableB is fact and tableA is dimension
  const directBA = (joinIndex.get(tableB) || [])
    .filter(j => j.dimension_table === tableA);
  if (directBA.length > 0) return directBA;

  return [];
}

function getJoinPathFormatted(tableA: string, tableB: string): string {
  const joins = getJoinPath(tableA, tableB);
  if (joins.length === 0) return `No direct join path found between ${tableA} and ${tableB}`;

  return joins.map(j =>
    `${j.fact_table}.${j.fact_column} = ${j.dimension_table}.${j.dimension_column}`
  ).join("\n");
}

function getAllJoinsForTable(tableName: string): JoinRelationship[] {
  const asFactTable = joinIndex.get(tableName) || [];

  // Also find joins where this table is a dimension
  const asDimTable: JoinRelationship[] = [];
  for (const [, joins] of joinIndex) {
    for (const j of joins) {
      if (j.dimension_table === tableName) {
        asDimTable.push(j);
      }
    }
  }

  return [...asFactTable, ...asDimTable];
}

function getAllJoinsFormatted(tables: string[]): string {
  const seen = new Set<string>();
  const result: string[] = [];

  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      const joins = getJoinPath(tables[i], tables[j]);
      for (const join of joins) {
        const key = `${join.fact_table}.${join.fact_column}=${join.dimension_table}.${join.dimension_column}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(
            `JOIN samples.tpcds_sf1.${join.dimension_table} ON ${join.fact_table}.${join.fact_column} = ${join.dimension_table}.${join.dimension_column}`
          );
        }
      }
    }
  }

  return result.length > 0 ? result.join("\n") : "No joins found between the specified tables.";
}

function findTablesByTerm(nlTerm: string): string[] {
  const term = nlTerm.toLowerCase();
  const matches = new Set<string>();

  // Search glossary for business meaning matches
  for (const [table, entries] of glossaryIndex) {
    for (const entry of entries) {
      if (entry.business_meaning.toLowerCase().includes(term)) {
        matches.add(table);
      }
    }
  }

  // Search table names
  for (const tableName of tableMap.keys()) {
    if (tableName.toLowerCase().includes(term)) {
      matches.add(tableName);
    }
  }

  return Array.from(matches);
}

function findColumnsByTerm(nlTerm: string): Array<{ table: string; column: string; meaning: string }> {
  const term = nlTerm.toLowerCase();
  const results: Array<{ table: string; column: string; meaning: string }> = [];

  for (const [table, entries] of glossaryIndex) {
    for (const entry of entries) {
      if (
        entry.column_name.toLowerCase().includes(term) ||
        entry.business_meaning.toLowerCase().includes(term)
      ) {
        results.push({
          table,
          column: entry.column_name,
          meaning: entry.business_meaning
        });
      }
    }
  }

  return results;
}

function getGoldSQLPairs(): GoldSQLPair[] {
  return ragData?.query_patterns || [];
}

function getSchemaContext(tables: string[]): string {
  const parts: string[] = [];

  for (const t of tables) {
    parts.push(getColumnsForTableFormatted(t));
  }

  parts.push("\n--- JOIN PATHS ---");
  parts.push(getAllJoinsFormatted(tables));

  return parts.join("\n\n");
}

// ── Export ──────────────────────────────────────────────────────────

const schemaStore = {
  loadSchema,
  getWorkspaces,
  getWorkspacesFormatted,
  getTablesForDomain,
  getTablesForDomainFormatted,
  getAllTableNames,
  getColumnsForTable,
  getColumnsForTableFormatted,
  getJoinPath,
  getJoinPathFormatted,
  getAllJoinsForTable,
  getAllJoinsFormatted,
  findTablesByTerm,
  findColumnsByTerm,
  getGoldSQLPairs,
  getSchemaContext
};

export default schemaStore;
export type { ColumnDef, JoinRelationship, GlossaryEntry, ColumnProfile, GoldSQLPair };
