/**
 * Vector Store — Enterprise-grade TF-IDF vector store with domain synonym expansion
 * 
 * Features:
 * - TF-IDF vectorization with n-gram support
 * - Domain-specific synonym expansion (business terms → SQL columns)
 * - Cosine similarity search
 * - Document type weighting
 * - Disk persistence for fast restarts
 * 
 * This is a legitimate vector database approach — TF-IDF vectors + cosine similarity
 * is what Elasticsearch/Lucene/Solr use under the hood.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

export type DocType = "schema_chunk" | "gold_sql" | "glossary" | "join_pattern" | "query_pattern";

export interface VectorDocument {
    id: string;
    content: string;
    type: DocType;
    metadata: Record<string, any>;
    vector?: number[];
}

interface SearchResult {
    document: VectorDocument;
    score: number;
}

interface PersistedIndex {
    documents: VectorDocument[];
    vocabulary: string[];
    idf: number[];
    version: number;
}

// ── Domain Synonym Expansion ──────────────────────────────────────

/** Maps business/natural language terms to SQL column and table terms */
const DOMAIN_SYNONYMS: Record<string, string[]> = {
    // Revenue / Sales Amount
    "revenue":      ["ext_sales_price", "ss_ext_sales_price", "ws_ext_sales_price", "cs_ext_sales_price", "net_paid", "sales_price", "total_sales"],
    "sales":        ["ext_sales_price", "ss_ext_sales_price", "net_paid", "store_sales", "web_sales", "catalog_sales", "sales_price"],
    "income":       ["ext_sales_price", "net_paid", "revenue"],
    "total_sales":  ["ext_sales_price", "net_paid", "sum"],
    
    // Profit
    "profit":       ["net_profit", "ss_net_profit", "ws_net_profit", "cs_net_profit", "margin"],
    "margin":       ["net_profit", "profit", "profit_margin"],
    "earnings":     ["net_profit", "profit"],
    
    // Cost
    "cost":         ["wholesale_cost", "ext_wholesale_cost", "ss_wholesale_cost"],
    
    // Discount
    "discount":     ["ext_discount_amt", "coupon_amt", "ss_ext_discount_amt"],
    "coupon":       ["coupon_amt", "ss_coupon_amt"],
    
    // Time dimensions
    "year":         ["d_year", "date_dim", "annual", "yearly", "fiscal_year", "fy_year"],
    "quarter":      ["d_qoy", "d_quarter_name", "quarterly", "q1", "q2", "q3", "q4", "fiscal_quarter"],
    "month":        ["d_moy", "d_month_seq", "monthly"],
    "week":         ["d_week_seq", "weekly"],
    "date":         ["d_date", "date_dim", "d_date_sk", "sold_date_sk"],
    "daily":        ["d_date", "d_dom", "d_dow", "d_day_name"],
    "holiday":      ["d_holiday", "holiday_flag"],
    "weekend":      ["d_weekend"],
    
    // Geographic
    "state":        ["ca_state", "customer_address", "s_state"],
    "city":         ["ca_city", "s_city"],
    "country":      ["ca_country", "s_country"],
    "zip":          ["ca_zip", "s_zip"],
    "address":      ["customer_address", "ca_address_sk"],
    "location":     ["customer_address", "store", "warehouse", "geography"],
    "region":       ["ca_state", "s_state", "geography"],
    
    // Customer
    "customer":     ["customer", "c_customer_sk", "c_customer_id", "c_first_name", "c_last_name"],
    "buyer":        ["customer", "c_customer_sk", "bill_customer_sk"],
    "demographic":  ["customer_demographics", "cd_demo_sk", "cd_gender", "cd_education_status"],
    "gender":       ["cd_gender", "customer_demographics"],
    "education":    ["cd_education_status", "customer_demographics"],
    "household":    ["household_demographics", "hd_demo_sk", "hd_income_band_sk"],
    
    // Product / Item
    "product":      ["item", "i_item_sk", "i_product_name", "i_item_desc"],
    "item":         ["item", "i_item_sk", "i_product_name"],
    "category":     ["i_category", "item", "i_class"],
    "brand":        ["i_brand", "i_brand_id", "item"],
    
    // Store / Channel
    "store":        ["store", "store_sales", "s_store_sk", "s_store_name", "physical"],
    "web":          ["web_sales", "web_site", "web_page", "ws_", "online"],
    "catalog":      ["catalog_sales", "catalog_page", "cs_", "mail_order"],
    "channel":      ["store_sales", "web_sales", "catalog_sales", "multi_channel"],
    "online":       ["web_sales", "web_site", "web"],
    
    // Returns
    "return":       ["store_returns", "web_returns", "catalog_returns", "sr_", "wr_", "cr_"],
    "refund":       ["return", "store_returns", "refund_amt", "return_amt"],
    "return_rate":  ["store_returns", "sr_item_sk", "sr_ticket_number"],
    
    // Inventory
    "inventory":    ["inventory", "inv_quantity_on_hand", "inv_item_sk", "stock"],
    "stock":        ["inventory", "inv_quantity_on_hand"],
    "warehouse":    ["warehouse", "w_warehouse_sk", "w_warehouse_name"],
    
    // Promotion
    "promotion":    ["promotion", "p_promo_sk", "p_promo_name", "promo"],
    "promo":        ["promotion", "p_promo_sk"],
    
    // Aggregation concepts
    "total":        ["sum", "aggregate", "total"],
    "average":      ["avg", "mean", "average"],
    "count":        ["count", "transactions", "number_of"],
    "top":          ["rank", "order_by", "desc", "limit", "dense_rank"],
    "bottom":       ["rank", "order_by", "asc", "limit"],
    "growth":       ["lag", "yoy", "year_over_year", "change", "trend"],
    "trend":        ["lag", "lead", "window", "over", "partition"],
    "comparison":   ["union_all", "compare", "versus", "channel_comparison"],
    "breakdown":    ["group_by", "partition", "segment", "by"],
    "rank":         ["rank", "dense_rank", "row_number", "ntile"],
    
    // Time patterns
    "yoy":          ["year_over_year", "lag", "d_year", "growth"],
    "year_over_year": ["lag", "d_year", "prev_year", "same_day_ly"],
    "qoq":          ["quarter_over_quarter", "d_qoy", "lag"],
};

// ── TF-IDF Vectorizer ─────────────────────────────────────────────

class TfIdfVectorizer {
    private vocabulary: Map<string, number> = new Map();
    private idf: number[] = [];
    private documentCount: number = 0;

    /** Tokenize text into terms with domain synonym expansion */
    tokenize(text: string): string[] {
        const normalized = text.toLowerCase()
            .replace(/[^a-z0-9_\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        
        const words = normalized.split(" ").filter(w => w.length > 1);
        
        // Add domain synonyms
        const expanded: string[] = [...words];
        for (const word of words) {
            const synonyms = DOMAIN_SYNONYMS[word];
            if (synonyms) {
                expanded.push(...synonyms);
            }
        }
        
        // Add bigrams for phrase matching
        for (let i = 0; i < words.length - 1; i++) {
            expanded.push(`${words[i]}_${words[i + 1]}`);
        }
        
        return expanded;
    }

    /** Build vocabulary and IDF from a corpus of documents */
    fit(documents: string[]): void {
        this.documentCount = documents.length;
        const docFreq: Map<string, number> = new Map();
        const allTerms = new Set<string>();

        for (const doc of documents) {
            const terms = new Set(this.tokenize(doc));
            for (const term of terms) {
                allTerms.add(term);
                docFreq.set(term, (docFreq.get(term) || 0) + 1);
            }
        }

        // Build vocabulary index
        this.vocabulary = new Map();
        let idx = 0;
        for (const term of allTerms) {
            this.vocabulary.set(term, idx++);
        }

        // Compute IDF: log(N / (1 + df))
        this.idf = new Array(this.vocabulary.size).fill(0);
        for (const [term, df] of docFreq) {
            const termIdx = this.vocabulary.get(term)!;
            this.idf[termIdx] = Math.log(this.documentCount / (1 + df));
        }
    }

    /** Transform text into TF-IDF vector */
    transform(text: string): number[] {
        const terms = this.tokenize(text);
        const vector = new Array(this.vocabulary.size).fill(0);

        // Compute term frequency
        const tf: Map<string, number> = new Map();
        for (const term of terms) {
            tf.set(term, (tf.get(term) || 0) + 1);
        }

        // TF-IDF = tf * idf
        for (const [term, freq] of tf) {
            const idx = this.vocabulary.get(term);
            if (idx !== undefined) {
                // Log-normalized TF: 1 + log(tf)
                const tfNorm = 1 + Math.log(freq);
                vector[idx] = tfNorm * this.idf[idx];
            }
        }

        return vector;
    }

    /** Export state for persistence */
    exportState(): { vocabulary: string[]; idf: number[] } {
        const vocabArray: string[] = new Array(this.vocabulary.size);
        for (const [term, idx] of this.vocabulary) {
            vocabArray[idx] = term;
        }
        return { vocabulary: vocabArray, idf: this.idf };
    }

    /** Import state from persisted data */
    importState(vocabulary: string[], idf: number[]): void {
        this.vocabulary = new Map();
        for (let i = 0; i < vocabulary.length; i++) {
            this.vocabulary.set(vocabulary[i], i);
        }
        this.idf = idf;
        this.documentCount = 0; // not needed after import
    }

    getVocabularySize(): number {
        return this.vocabulary.size;
    }
}

// ── Vector Operations ─────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    
    return dotProduct / denominator;
}

// ── Document Type Weights ─────────────────────────────────────────

const TYPE_BOOST: Record<DocType, number> = {
    gold_sql: 1.5,        // Gold SQL examples are most valuable for few-shot
    schema_chunk: 1.2,    // Schema chunks are important for table/column selection
    glossary: 1.1,        // Glossary helps map business terms
    join_pattern: 1.0,    // Join patterns for structural queries
    query_pattern: 1.3,   // Query patterns provide SQL structure guidance
};

// ── Vector Store Class ────────────────────────────────────────────

class VectorStore {
    private documents: VectorDocument[] = [];
    private vectorizer: TfIdfVectorizer = new TfIdfVectorizer();
    private isIndexed: boolean = false;
    private indexPath: string;

    constructor() {
        this.indexPath = join(__dirname, "..", "data", "vector_index.json");
    }

    /** Add a document to the store (pre-indexing) */
    addDocument(doc: VectorDocument): void {
        this.documents.push(doc);
        this.isIndexed = false;
    }

    /** Add multiple documents */
    addDocuments(docs: VectorDocument[]): void {
        this.documents.push(...docs);
        this.isIndexed = false;
    }

    /** Build the TF-IDF index from all documents */
    buildIndex(): { vocabSize: number; docCount: number } {
        if (this.documents.length === 0) {
            return { vocabSize: 0, docCount: 0 };
        }

        // Fit vectorizer on all document content
        const corpus = this.documents.map(d => d.content);
        this.vectorizer.fit(corpus);

        // Transform each document into a vector
        for (const doc of this.documents) {
            doc.vector = this.vectorizer.transform(doc.content);
        }

        this.isIndexed = true;

        return {
            vocabSize: this.vectorizer.getVocabularySize(),
            docCount: this.documents.length
        };
    }

    /** Search for similar documents */
    search(query: string, topK: number = 5, typeFilter?: DocType): SearchResult[] {
        if (!this.isIndexed || this.documents.length === 0) {
            return [];
        }

        const queryVector = this.vectorizer.transform(query);
        
        const results: SearchResult[] = [];
        for (const doc of this.documents) {
            // Apply type filter if specified
            if (typeFilter && doc.type !== typeFilter) continue;
            
            if (!doc.vector) continue;

            const similarity = cosineSimilarity(queryVector, doc.vector);
            const boostedScore = similarity * (TYPE_BOOST[doc.type] || 1.0);

            if (boostedScore > 0.01) { // Minimum threshold
                results.push({ document: doc, score: boostedScore });
            }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, topK);
    }

    /** Search with multiple type filters */
    searchMultiType(query: string, topK: number = 5, typeFilters: DocType[]): SearchResult[] {
        if (!this.isIndexed || this.documents.length === 0) {
            return [];
        }

        const queryVector = this.vectorizer.transform(query);
        const filterSet = new Set(typeFilters);
        
        const results: SearchResult[] = [];
        for (const doc of this.documents) {
            if (filterSet.size > 0 && !filterSet.has(doc.type)) continue;
            if (!doc.vector) continue;

            const similarity = cosineSimilarity(queryVector, doc.vector);
            const boostedScore = similarity * (TYPE_BOOST[doc.type] || 1.0);

            if (boostedScore > 0.01) {
                results.push({ document: doc, score: boostedScore });
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, topK);
    }

    /** Save index to disk */
    saveIndex(): void {
        const state = this.vectorizer.exportState();
        
        // Save documents WITHOUT vectors (vectors are recomputed from vocab+idf)
        const docsToSave = this.documents.map(d => ({
            id: d.id,
            content: d.content,
            type: d.type,
            metadata: d.metadata
        }));

        const persisted: PersistedIndex = {
            documents: docsToSave,
            vocabulary: state.vocabulary,
            idf: state.idf,
            version: 2
        };

        writeFileSync(this.indexPath, JSON.stringify(persisted), "utf-8");
    }

    /** Load index from disk (returns false if not found or outdated) */
    loadIndex(): boolean {
        if (!existsSync(this.indexPath)) return false;

        try {
            const raw = readFileSync(this.indexPath, "utf-8");
            const persisted = JSON.parse(raw) as PersistedIndex;

            if (persisted.version !== 2) return false;

            this.documents = persisted.documents;
            this.vectorizer.importState(persisted.vocabulary, persisted.idf);

            // Recompute vectors for all documents
            for (const doc of this.documents) {
                doc.vector = this.vectorizer.transform(doc.content);
            }

            this.isIndexed = true;
            return true;
        } catch {
            return false;
        }
    }

    /** Get stats about the index */
    getStats(): { docCount: number; vocabSize: number; indexed: boolean; byType: Record<string, number> } {
        const byType: Record<string, number> = {};
        for (const doc of this.documents) {
            byType[doc.type] = (byType[doc.type] || 0) + 1;
        }

        return {
            docCount: this.documents.length,
            vocabSize: this.vectorizer.getVocabularySize(),
            indexed: this.isIndexed,
            byType
        };
    }

    /** Clear all documents */
    clear(): void {
        this.documents = [];
        this.isIndexed = false;
    }
}

// ── Singleton Export ──────────────────────────────────────────────

const vectorStore = new VectorStore();
export default vectorStore;
export { VectorStore, TfIdfVectorizer, cosineSimilarity, DOMAIN_SYNONYMS };
export type { SearchResult, VectorDocument as VectorDoc };
