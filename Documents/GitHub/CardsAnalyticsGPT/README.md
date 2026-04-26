# 🧠 Databricks-RAG-SQL-Generator (CardsAnalyticsGPT)

An enterprise-grade, Multi-Agent Retrieval-Augmented Generation (RAG) system built to generate optimized, production-ready Databricks SQL for the TPC-DS dataset (`samples.tpcds_sf1`).

Powered by **Sarvam AI (`sarvam-m`)** and **LangGraph**, this engine operates beyond naive prompt injection—it uses a specialized 5-agent pipeline combined with a persistent TF-IDF Vector Store to intelligently map complex business questions into correct schema lookups, table joins, and SQL aggregations.

---

## 🏗️ Architecture: The 5-Agent Pipeline

The core logic executes as a stateful `LangGraph` pipeline, passing the context down sequentially.

1. **InitNode**: Checks and loads the semantic domain dictionary, historical SQL pairs, and the vector index from disk.
2. **Intent Agent**: Parses the natural language question to understand the core financial/analytical goal.
3. **Tables Agent**: Performs sparse vector semantic search across the `tpcds_sf1` schema to isolate the correct dimension and fact tables.
4. **Column Pruner Agent**: Cross-references the business terms ("revenue", "profit", "margins") using the RAG business glossary to select only the required SQL columns, maintaining strict context limits.
5. **SQL generation Agent**: Uses deterministic few-shot retrieval via Cosine Similarity over Gold SQL examples to inject highly-accurate patterns. Translates pruned schema into Databricks-ready SQL.
6. **Execution API**: Validates the SQL and packages it alongside complexity metrics and join maps.

---

## ⚡ The RAG Engine

A localized TF-IDF engine indexes four specific components to ground the LLM:
* **Schema Chunks:** Detailed table mappings for `item`, `date_dim`, `store_sales`, etc.
* **Gold SQL Dictionary:** High-quality, verified SQL queries serving as deterministic few-shot examples.
* **Business Glossary:** A living dictionary linking terms like "Sales" → `ss_ext_sales_price` to prevent model hallucination.
* **Join Patterns:** Explicit, pre-computed FK structural maps preventing bad cross-joins (e.g. enforcing `ss_sold_date_sk = d_date_sk`).

---

## 🧪 Verified Prompts & Model Responses

Here are examples of queries sent to the API and their validated end-to-end SQL outputs directly runnable on Databricks.

### Case 1: Simple Revenue Aggregation

**Prompt (User Question):**
> "Show me total store sales revenue and profit broken down by year and quarter, ordered by year and quarter ascending."

**Model Response (Databricks SQL):**
\`\`\`sql
═══════════════════════════════════════════════════════════
  READY TO RUN ON DATABRICKS: samples.tpcds_sf1
═══════════════════════════════════════════════════════════

SELECT
  d.d_year,
  d.d_qoy AS quarter,
  SUM(ss.ss_ext_sales_price) AS revenue,
  SUM(ss.ss_net_profit) AS profit
FROM
  samples.tpcds_sf1.store_sales ss
JOIN
  samples.tpcds_sf1.date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
GROUP BY
  d.d_year,
  d.d_qoy
ORDER BY
  d.d_year,
  d.d_qoy
  
📊 Tables used: store_sales, date_dim
🔗 Joins: 1
⚡ Estimated complexity: Medium
\`\`\`

---

### Case 2: Multi-Channel Comparative Analysis (Store vs Web vs Catalog)

*Note: In complex queries, the RAG engine forces the model to synthesize a `UNION ALL` statement while explicitly tracking correct PKs/FKs across isolated table clusters.*

**Prompt (User Question):**
> "Compare total net sales, total discount given, and total profit across the store, web, and catalog channels. Which channel is most profitable?"

**Model Response (Databricks SQL):**
\`\`\`sql
═══════════════════════════════════════════════════════════
  READY TO RUN ON DATABRICKS: samples.tpcds_sf1
═══════════════════════════════════════════════════════════

SELECT 'store' AS channel, SUM(ss.ss_ext_sales_price) AS total_sales, SUM(ss.ss_ext_discount_amt) AS total_discount, SUM(ss.ss_net_profit) AS total_profit
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
UNION ALL
SELECT 'web', SUM(ws.ws_ext_sales_price), SUM(ws.ws_ext_discount_amt), SUM(ws.ws_net_profit)
FROM samples.tpcds_sf1.web_sales ws
JOIN samples.tpcds_sf1.date_dim d ON ws.ws_sold_date_sk = d.d_date_sk
UNION ALL
SELECT 'catalog', SUM(cs.cs_ext_sales_price), SUM(cs.cs_ext_discount_amt), SUM(cs.cs_net_profit)
FROM samples.tpcds_sf1.catalog_sales cs
JOIN samples.tpcds_sf1.date_dim d ON cs.cs_sold_date_sk = d.d_date_sk
ORDER BY total_profit DESC

📊 Tables used: store_sales, date_dim, web_sales, catalog_sales
🔗 Joins: 3
⚡ Estimated complexity: High
🔄 Multi-channel UNION ALL detected
\`\`\`

---

## 🛠️ Local Installation & Setup

1. **Clone the repo**
   \`\`\`bash
   git clone https://github.com/maroofsyyed/Databricks-RAG-SQL-Generator.git
   cd Databricks-RAG-SQL-Generator
   \`\`\`

2. **Set up your environment variables**
   Create a \`.env\` file in the root with your Sarvam API Key:
   \`\`\`env
   SARVAM_API_KEY=your_sarvam_api_key_here
   SARVAM_MODEL=sarvam-m
   DATABRICKS_DATASET=samples.tpcds_sf1
   \`\`\`

3. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Launch the Engine**
   \`\`\`bash
   # Run the server which exposes the inference REST endpoints at port 3000
   npx tsx querygpt/server.ts 
   
   # OR operate entirely in Interactive CLI mode:
   npx tsx querygpt/index.ts
   \`\`\`

---
*Developed for intelligent analytics generation across Databricks isolated architectures.*
