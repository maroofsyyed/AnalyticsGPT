# Query pattern library — natural language to SQL

Use these examples to understand how business questions map to SQL joins.

## Q001: Compare net sales and profit across store, web, and catalog channels for 2001

**Category:** channel_comparison
**Tables:** store_sales, web_sales, catalog_sales, date_dim
**Concepts:** multi-channel UNION, date filter, aggregation

```sql
SELECT 'store' AS channel, SUM(ss_net_paid) AS total_sales, SUM(ss_net_profit) AS total_profit
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.date_dim d ON ss.ss_sold_date_sk = d.d_date_sk WHERE d.d_year = 2001
UNION ALL
SELECT 'web', SUM(ws_net_paid), SUM(ws_net_profit)
FROM samples.tpcds_sf1.web_sales ws
JOIN samples.tpcds_sf1.date_dim d ON ws.ws_sold_date_sk = d.d_date_sk WHERE d.d_year = 2001
UNION ALL
SELECT 'catalog', SUM(cs_net_paid), SUM(cs_net_profit)
FROM samples.tpcds_sf1.catalog_sales cs
JOIN samples.tpcds_sf1.date_dim d ON cs.cs_sold_date_sk = d.d_date_sk WHERE d.d_year = 2001
ORDER BY total_sales DESC```

## Q002: Return rate by item category in the store channel

**Category:** return_rate
**Tables:** store_sales, store_returns, item
**Concepts:** LEFT JOIN to returns, return rate calc, item dimension

```sql
SELECT i.i_category,
       COUNT(ss.ss_item_sk)                                                        AS total_sold,
       COUNT(sr.sr_item_sk)                                                        AS total_returned,
       ROUND(COUNT(sr.sr_item_sk)*100.0/NULLIF(COUNT(ss.ss_item_sk),0),2)         AS return_rate_pct
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.item i ON ss.ss_item_sk = i.i_item_sk
LEFT JOIN samples.tpcds_sf1.store_returns sr
  ON ss.ss_item_sk = sr.sr_item_sk AND ss.ss_ticket_number = sr.sr_ticket_number
GROUP BY i.i_category ORDER BY return_rate_pct DESC```

## Q003: Top 100 customers by total spend across all three channels

**Category:** customer_lifetime_value
**Tables:** store_sales, web_sales, catalog_sales, customer
**Concepts:** UNION all channels, customer join, ranking

```sql
WITH all_sales AS (
  SELECT ss_customer_sk AS csk, ss_net_paid AS amt FROM samples.tpcds_sf1.store_sales
  UNION ALL SELECT ws_bill_customer_sk, ws_net_paid FROM samples.tpcds_sf1.web_sales
  UNION ALL SELECT cs_bill_customer_sk, cs_net_paid FROM samples.tpcds_sf1.catalog_sales
)
SELECT c.c_customer_id, c.c_first_name, c.c_last_name, c.c_email_address,
       SUM(a.amt) AS lifetime_value
FROM all_sales a JOIN samples.tpcds_sf1.customer c ON a.csk = c.c_customer_sk
GROUP BY c.c_customer_id, c.c_first_name, c.c_last_name, c.c_email_address
ORDER BY lifetime_value DESC LIMIT 100```

## Q004: Items with stock below 100 units in any warehouse for the latest week

**Category:** inventory_analysis
**Tables:** inventory, item, warehouse, date_dim
**Concepts:** inventory threshold, latest date filter, warehouse join

```sql
WITH latest AS (SELECT MAX(inv_date_sk) AS max_sk FROM samples.tpcds_sf1.inventory)
SELECT i.i_product_name, i.i_category, w.w_warehouse_name, inv.inv_quantity_on_hand
FROM samples.tpcds_sf1.inventory inv
JOIN latest ON inv.inv_date_sk = latest.max_sk
JOIN samples.tpcds_sf1.item i ON inv.inv_item_sk = i.i_item_sk
JOIN samples.tpcds_sf1.warehouse w ON inv.inv_warehouse_sk = w.w_warehouse_sk
WHERE inv.inv_quantity_on_hand < 100
ORDER BY inv.inv_quantity_on_hand```

## Q005: Top promotions by discount amount in web channel last year

**Category:** promotion_effectiveness
**Tables:** web_sales, promotion, date_dim
**Concepts:** promotion join, discount aggregation, year filter

```sql
SELECT p.p_promo_name, p.p_channel_email, p.p_channel_tv,
       SUM(ws.ws_ext_discount_amt) AS total_discount, COUNT(*) AS transactions
FROM samples.tpcds_sf1.web_sales ws
JOIN samples.tpcds_sf1.promotion p ON ws.ws_promo_sk = p.p_promo_sk
JOIN samples.tpcds_sf1.date_dim d  ON ws.ws_sold_date_sk = d.d_date_sk
WHERE d.d_year = (SELECT MAX(d2.d_year)-1 FROM samples.tpcds_sf1.date_dim d2)
GROUP BY p.p_promo_name, p.p_channel_email, p.p_channel_tv
ORDER BY total_discount DESC LIMIT 20```

## Q006: Average order value by education level and gender for store sales

**Category:** demographic_sales
**Tables:** store_sales, customer_demographics
**Concepts:** demographic join, AVG, GROUP BY multi-column

```sql
SELECT cd.cd_education_status, cd.cd_gender,
       ROUND(AVG(ss.ss_net_paid),2) AS avg_order_value,
       COUNT(*) AS transaction_count
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.customer_demographics cd ON ss.ss_cdemo_sk = cd.cd_demo_sk
GROUP BY cd.cd_education_status, cd.cd_gender
ORDER BY avg_order_value DESC```

## Q007: Year-over-year store sales growth by quarter

**Category:** year_over_year
**Tables:** store_sales, date_dim
**Concepts:** LAG window function, YoY comparison, fiscal quarter

```sql
SELECT d.d_year, d.d_qoy AS quarter,
       SUM(ss.ss_net_paid) AS net_sales,
       LAG(SUM(ss.ss_net_paid)) OVER (PARTITION BY d.d_qoy ORDER BY d.d_year) AS prev_year,
       ROUND((SUM(ss.ss_net_paid)-LAG(SUM(ss.ss_net_paid)) OVER (PARTITION BY d.d_qoy ORDER BY d.d_year))
             /NULLIF(LAG(SUM(ss.ss_net_paid)) OVER (PARTITION BY d.d_qoy ORDER BY d.d_year),0)*100,2) AS yoy_pct
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.date_dim d ON ss.ss_sold_date_sk = d.d_date_sk
GROUP BY d.d_year, d.d_qoy ORDER BY d.d_year, quarter```

## Q008: Rank US states by total catalog sales revenue

**Category:** geography
**Tables:** catalog_sales, customer_address
**Concepts:** address join, state aggregation, RANK window

```sql
SELECT ca.ca_state,
       SUM(cs.cs_net_paid)                                          AS total_revenue,
       RANK() OVER (ORDER BY SUM(cs.cs_net_paid) DESC)             AS revenue_rank
FROM samples.tpcds_sf1.catalog_sales cs
JOIN samples.tpcds_sf1.customer_address ca ON cs.cs_bill_addr_sk = ca.ca_address_sk
WHERE ca.ca_country = 'United States'
GROUP BY ca.ca_state ORDER BY revenue_rank```

## Q009: Which shift generates the most store sales revenue

**Category:** time_of_day
**Tables:** store_sales, time_dim
**Concepts:** time dimension join, shift aggregation

```sql
SELECT t.t_shift, t.t_am_pm,
       SUM(ss.ss_net_paid) AS total_revenue, COUNT(*) AS transactions
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.time_dim t ON ss.ss_sold_time_sk = t.t_time_sk
GROUP BY t.t_shift, t.t_am_pm ORDER BY total_revenue DESC```

## Q010: Top 10 brands by profit margin across all channels

**Category:** brand_performance
**Tables:** store_sales, web_sales, catalog_sales, item
**Concepts:** cross-channel UNION, profit margin, top-N

```sql
WITH all_sales AS (
  SELECT ss_item_sk AS isk, ss_net_profit AS profit, ss_ext_sales_price AS rev FROM samples.tpcds_sf1.store_sales
  UNION ALL SELECT ws_item_sk, ws_net_profit, ws_ext_sales_price FROM samples.tpcds_sf1.web_sales
  UNION ALL SELECT cs_item_sk, cs_net_profit, cs_ext_sales_price FROM samples.tpcds_sf1.catalog_sales
)
SELECT i.i_brand,
       ROUND(SUM(a.profit)/NULLIF(SUM(a.rev),0)*100,2) AS margin_pct,
       SUM(a.rev) AS total_revenue
FROM all_sales a JOIN samples.tpcds_sf1.item i ON a.isk = i.i_item_sk
GROUP BY i.i_brand HAVING SUM(a.rev)>10000
ORDER BY margin_pct DESC LIMIT 10```

## Q011: Compare sales on holidays vs non-holidays by channel

**Category:** holiday_sales
**Tables:** store_sales, web_sales, date_dim
**Concepts:** holiday flag, conditional aggregation, channel split

```sql
SELECT d.d_holiday,
       SUM(ss.ss_net_paid) AS store_sales,
       SUM(ws.ws_net_paid) AS web_sales
FROM samples.tpcds_sf1.date_dim d
LEFT JOIN samples.tpcds_sf1.store_sales ss ON ss.ss_sold_date_sk = d.d_date_sk
LEFT JOIN samples.tpcds_sf1.web_sales   ws ON ws.ws_sold_date_sk = d.d_date_sk
GROUP BY d.d_holiday```

## Q012: Average store purchase value by household income band

**Category:** income_segment
**Tables:** store_sales, household_demographics, income_band
**Concepts:** two-hop join, income segmentation, AVG

```sql
SELECT ib.ib_lower_bound, ib.ib_upper_bound,
       ROUND(AVG(ss.ss_net_paid),2) AS avg_purchase,
       COUNT(*)                      AS transactions
FROM samples.tpcds_sf1.store_sales ss
JOIN samples.tpcds_sf1.household_demographics hd ON ss.ss_hdemo_sk   = hd.hd_demo_sk
JOIN samples.tpcds_sf1.income_band            ib ON hd.hd_income_band_sk = ib.ib_income_band_sk
GROUP BY ib.ib_lower_bound, ib.ib_upper_bound
ORDER BY ib.ib_lower_bound```
